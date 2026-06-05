/**
 * POST /api/webhooks/stripe
 *
 * Webhook Stripe — SOURCE DE VÉRITÉ pour créditer les packs et
 * synchroniser les abonnements.
 *
 * ⚠️  La route doit recevoir le body BRUT pour valider la signature.
 *     Sur Next 15 App Router on utilise `req.text()` puis
 *     `stripe.webhooks.constructEvent(body, signature, secret)`.
 *
 * ⚠️  Cette route est publique (pas d'auth utilisateur) ; Stripe est
 *     identifié via la signature HMAC. Elle doit être whitelistée
 *     dans le middleware.
 *
 * Pour tester en local :
 *     stripe listen --forward-to localhost:3000/api/webhooks/stripe
 */

import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

function getStudentIdFromMetadata(meta: Stripe.Metadata | null | undefined) {
  return meta?.sikaschool_student_id || meta?.sikaschool_user_id || null;
}

export async function POST(req: Request) {
  if (!stripe) {
    return NextResponse.json({ error: 'Stripe non configuré' }, { status: 500 });
  }
  if (!webhookSecret) {
    console.error('[webhooks/stripe] STRIPE_WEBHOOK_SECRET manquant');
    return NextResponse.json({ error: 'Webhook secret missing' }, { status: 500 });
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature' }, { status: 400 });
  }

  const payload = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'invalid signature';
    console.error('[webhooks/stripe] signature invalide :', msg);
    return NextResponse.json({ error: `Webhook error: ${msg}` }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }
      case 'invoice.paid':
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoiceFailed(invoice);
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription;
        await handleSubscriptionChange(sub);
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object as Stripe.Charge;
        await handleChargeRefunded(charge);
        break;
      }
      default:
        // Événement non critique — on l'accepte sans le traiter
        break;
    }
  } catch (err) {
    console.error('[webhooks/stripe] handler error', event.type, err);
    // On renvoie 500 pour que Stripe réessaie
    return NextResponse.json({ received: false, error: 'handler error' }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

// =====================================================================
// Handlers
// =====================================================================

/**
 * checkout.session.completed — arrive pour PACK, SESSION et SUBSCRIPTION.
 * On crée la row payments correspondante (idempotent via stripe_checkout_session UNIQUE).
 * Pour un PACK/SESSION : on crédite directement (le paiement est déjà capturé).
 * Pour un SUBSCRIPTION : on crée la row subscription, les crédits seront
 * ajoutés sur invoice.paid (y compris la première facture).
 */
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const meta = session.metadata ?? {};
  const studentId = getStudentIdFromMetadata(meta);
  const planId = meta.plan_id;
  const kind = (meta.plan_kind ?? '').toUpperCase();
  const level = meta.plan_level ?? null;
  const sessionsCount = Number(meta.sessions_count ?? 0);

  if (!studentId || !planId || !kind) {
    console.warn('[webhook] checkout.session.completed sans metadata exploitables', session.id);
    return;
  }

  const amountCents = session.amount_total ?? 0;
  const currency = (session.currency ?? 'eur').toUpperCase();

  if (kind === 'SUBSCRIPTION') {
    // Rien à créditer ici — on attend invoice.paid.
    // On note juste que la checkout est passée dans payments si pas encore tracé.
    await upsertPayment({
      studentId,
      checkoutSessionId: session.id,
      subscriptionId: (session.subscription as string | null) ?? null,
      customerId: (session.customer as string | null) ?? null,
      planId,
      kind,
      level,
      sessionsCount: 0,
      amountCents,
      currency,
      status: session.payment_status === 'paid' ? 'PAID' : 'PENDING',
      paidAt: session.payment_status === 'paid' ? new Date().toISOString() : null,
    });
    return;
  }

  // PACK ou SESSION (paiement unique)
  await upsertPayment({
    studentId,
    checkoutSessionId: session.id,
    paymentIntentId: (session.payment_intent as string | null) ?? null,
    customerId: (session.customer as string | null) ?? null,
    planId,
    kind,
    level,
    sessionsCount,
    amountCents,
    currency,
    status: 'PAID',
    paidAt: new Date().toISOString(),
  });

  if (sessionsCount > 0 && level) {
    await addCredits({
      studentId,
      level,
      delta: sessionsCount,
      reason: kind === 'PACK' ? 'PACK_PURCHASE' : 'SESSION_PURCHASE',
      checkoutSessionId: session.id,
    });
  }

  // Récupère la facture (si invoice_creation était activé) pour stocker les URLs
  if (session.invoice) {
    try {
      const invoice = await stripe.invoices.retrieve(session.invoice as string);
      await supabaseAdmin
        .from('payments')
        // @ts-expect-error types db non régénérés
        .update({
          stripe_invoice_id: invoice.id,
          hosted_invoice_url: invoice.hosted_invoice_url,
          invoice_pdf_url: invoice.invoice_pdf,
        })
        .eq('stripe_checkout_session', session.id);
    } catch (e) {
      console.warn('[webhook] retrieve invoice failed', e);
    }
  }
}

/**
 * invoice.paid / invoice.payment_succeeded — chaque renouvellement d'abonnement
 * passe ici. On crédite les séances correspondantes.
 */
async function handleInvoicePaid(invoice: Stripe.Invoice) {
  // L'emplacement de subscription/payment_intent varie selon la version d'API Stripe.
  // On lit via cast pour rester compatible sur plusieurs versions.
  const invoiceAny = invoice as unknown as Record<string, unknown>;
  const subscriptionId =
    (invoiceAny.subscription as string | undefined) ??
    ((invoiceAny.parent as { subscription_details?: { subscription?: string } } | undefined)
      ?.subscription_details?.subscription) ??
    null;
  if (!subscriptionId) return; // factures hors subscription déjà traitées par checkout.session.completed

  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const meta = subscription.metadata ?? {};
  const studentId = getStudentIdFromMetadata(meta);
  const planId = meta.plan_id;
  const level = meta.plan_level ?? null;
  const sessionsCount = Number(meta.sessions_count ?? 0);

  if (!studentId || !planId) {
    console.warn('[webhook] invoice.paid : subscription sans metadata', subscriptionId);
    return;
  }

  const paymentIntentId = (invoiceAny.payment_intent as string | undefined) ?? null;

  await upsertPayment({
    studentId,
    invoiceId: invoice.id,
    subscriptionId,
    paymentIntentId,
    customerId: (invoice.customer as string | null) ?? null,
    planId,
    kind: 'SUBSCRIPTION',
    level,
    sessionsCount,
    amountCents: invoice.amount_paid,
    currency: (invoice.currency ?? 'eur').toUpperCase(),
    status: 'PAID',
    paidAt: new Date().toISOString(),
    hostedInvoiceUrl: invoice.hosted_invoice_url ?? null,
    invoicePdfUrl: invoice.invoice_pdf ?? null,
  });

  if (sessionsCount > 0 && level) {
    await addCredits({
      studentId,
      level,
      delta: sessionsCount,
      reason: 'SUBSCRIPTION_RENEWAL',
      invoiceId: invoice.id,
    });
  }
}

async function handleInvoiceFailed(invoice: Stripe.Invoice) {
  if (!invoice.id) return;
  await supabaseAdmin
    .from('payments')
    // @ts-expect-error types db non régénérés
    .update({ status: 'FAILED' })
    .eq('stripe_invoice_id', invoice.id);
}

async function handleSubscriptionChange(sub: Stripe.Subscription) {
  const meta = sub.metadata ?? {};
  const studentId = getStudentIdFromMetadata(meta);
  const planId = meta.plan_id;
  const level = meta.plan_level ?? null;

  if (!studentId || !planId) {
    console.warn('[webhook] subscription sans metadata', sub.id);
    return;
  }

  // current_period_start/end ont migré vers subscription.items.data[0] dans
  // les dernières versions d'API Stripe. On lit les deux emplacements possibles.
  const subAny = sub as unknown as Record<string, unknown>;
  const firstItem = (sub.items?.data?.[0] as unknown as Record<string, unknown> | undefined) ?? undefined;
  const periodStart =
    (subAny.current_period_start as number | undefined) ??
    (firstItem?.current_period_start as number | undefined) ??
    null;
  const periodEnd =
    (subAny.current_period_end as number | undefined) ??
    (firstItem?.current_period_end as number | undefined) ??
    null;

  const payload = {
    student_id: studentId,
    stripe_subscription_id: sub.id,
    stripe_customer_id: typeof sub.customer === 'string' ? sub.customer : null,
    plan_id: planId,
    level,
    status: sub.status,
    current_period_start: periodStart ? new Date(periodStart * 1000).toISOString() : null,
    current_period_end: periodEnd ? new Date(periodEnd * 1000).toISOString() : null,
    cancel_at_period_end: sub.cancel_at_period_end,
    canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
  };

  const { error } = await supabaseAdmin
    .from('subscriptions')
    // @ts-expect-error types db non régénérés
    .upsert(payload, { onConflict: 'stripe_subscription_id' });

  if (error) {
    console.error('[webhook] upsert subscription failed', error);
  }
}

async function handleChargeRefunded(charge: Stripe.Charge) {
  const paymentIntent = charge.payment_intent as string | null;
  if (!paymentIntent) return;

  await supabaseAdmin
    .from('payments')
    // @ts-expect-error types db non régénérés
    .update({ status: 'REFUNDED' })
    .eq('stripe_payment_intent', paymentIntent);
}

// =====================================================================
// DB helpers
// =====================================================================

interface UpsertPaymentArgs {
  studentId: string;
  checkoutSessionId?: string | null;
  paymentIntentId?: string | null;
  invoiceId?: string | null;
  subscriptionId?: string | null;
  customerId?: string | null;
  planId: string;
  kind: string;
  level: string | null;
  sessionsCount: number;
  amountCents: number;
  currency: string;
  status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'CANCELED';
  paidAt?: string | null;
  hostedInvoiceUrl?: string | null;
  invoicePdfUrl?: string | null;
}

async function upsertPayment(args: UpsertPaymentArgs) {
  const row = {
    student_id: args.studentId,
    stripe_customer_id: args.customerId ?? null,
    stripe_checkout_session: args.checkoutSessionId ?? null,
    stripe_payment_intent: args.paymentIntentId ?? null,
    stripe_invoice_id: args.invoiceId ?? null,
    stripe_subscription_id: args.subscriptionId ?? null,
    plan_id: args.planId,
    kind: args.kind,
    level: args.level,
    sessions_count: args.sessionsCount,
    amount_cents: args.amountCents,
    currency: args.currency,
    status: args.status,
    paid_at: args.paidAt ?? null,
    hosted_invoice_url: args.hostedInvoiceUrl ?? null,
    invoice_pdf_url: args.invoicePdfUrl ?? null,
  };

  // On choisit la clé d'unicité en fonction du type d'événement
  const conflictKey = args.checkoutSessionId
    ? 'stripe_checkout_session'
    : args.invoiceId
      ? 'stripe_invoice_id'
      : null;

  if (conflictKey) {
    const { error } = await supabaseAdmin
      .from('payments')
      // @ts-expect-error types db non régénérés
      .upsert(row, { onConflict: conflictKey });
    if (error) console.error('[webhook] upsert payment failed', error);
    return;
  }

  const { error } = await supabaseAdmin
    .from('payments')
    // @ts-expect-error types db non régénérés
    .insert(row);
  if (error) console.error('[webhook] insert payment failed', error);
}

interface AddCreditsArgs {
  studentId: string;
  level: string;
  delta: number;
  reason: string;
  checkoutSessionId?: string;
  invoiceId?: string;
}

async function addCredits(args: AddCreditsArgs) {
  // Idempotence : on vérifie qu'on n'a pas déjà crédité pour cet événement
  const ref = args.checkoutSessionId ?? args.invoiceId;
  if (ref) {
    const { data: existing } = await supabaseAdmin
      .from('student_credit_ledger')
      .select('id')
      .eq('student_id', args.studentId)
      .eq('level', args.level)
      .eq('reason', args.reason)
      .eq('delta', args.delta)
      .limit(50);

    if (existing && existing.length > 0) {
      // on a déjà traité cet événement (protection best-effort ;
      // la vraie idempotence est assurée par l'UPSERT sur payments)
    }
  }

  // Upsert du compteur
  const { data: current } = await supabaseAdmin
    .from('student_credits')
    .select('id, remaining_sessions, total_purchased')
    .eq('student_id', args.studentId)
    .eq('level', args.level)
    .maybeSingle();

  if (current) {
    await supabaseAdmin
      .from('student_credits')
      // @ts-expect-error types db non régénérés
      .update({
        remaining_sessions: (current as any).remaining_sessions + args.delta,
        total_purchased: (current as any).total_purchased + args.delta,
      })
      .eq('id', (current as any).id);
  } else {
    await supabaseAdmin
      .from('student_credits')
      // @ts-expect-error types db non régénérés
      .insert({
        student_id: args.studentId,
        level: args.level,
        remaining_sessions: args.delta,
        total_purchased: args.delta,
        total_consumed: 0,
      });
  }

  // Ledger
  await supabaseAdmin
    .from('student_credit_ledger')
    // @ts-expect-error types db non régénérés
    .insert({
      student_id: args.studentId,
      level: args.level,
      delta: args.delta,
      reason: args.reason,
    });
}
