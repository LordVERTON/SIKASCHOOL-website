/**
 * POST /api/student/payments/checkout
 *
 * Body: { planId: string }
 * Response: { url: string } -> URL de la page Stripe Checkout
 *
 * Crée une Stripe Checkout Session (mode payment ou subscription selon plan.kind)
 * puis renvoie l'URL hostée par Stripe. Le front effectue ensuite un
 * window.location.href = url (redirection la plus user-friendly).
 */

import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { getUserSession } from '@/lib/auth-simple';
import { stripe, assertStripeConfigured, getPlan } from '@/lib/stripe';
import { getOrCreateStripeCustomer } from '@/lib/stripe-customer';
import { canAccessStudentFeatures, getEffectiveStudentAccess } from '@/lib/student-access';

export async function POST(req: Request) {
  try {
    const user = await getUserSession();
    if (!canAccessStudentFeatures(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const access = await getEffectiveStudentAccess(user);
    if (!access) {
      return NextResponse.json({ error: 'Aucun élève lié à ce compte parent' }, { status: 404 });
    }

    assertStripeConfigured();

    const body = await req.json().catch(() => ({}));
    const planId = typeof body?.planId === 'string' ? body.planId : '';
    const plan = getPlan(planId);

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan inconnu', planId },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const customerId = await getOrCreateStripeCustomer(user.id);

    const successUrl = `${appUrl}/student/paiements/success?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${appUrl}/student/paiements/cancel`;

    const commonMetadata: Record<string, string> = {
      sikaschool_user_id: user.id,
      sikaschool_student_id: access.effectiveStudentId,
      plan_id: plan.id,
      plan_kind: plan.kind,
      plan_level: plan.level,
      sessions_count: String(plan.sessions ?? 0),
    };

    let session: Stripe.Checkout.Session;

    if (plan.kind === 'SUBSCRIPTION') {
      session = await stripe.checkout.sessions.create({
        mode: 'subscription',
        customer: customerId,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: plan.currency,
              unit_amount: plan.priceCents,
              recurring: { interval: plan.recurringInterval ?? 'month' },
              product_data: {
                name: plan.name,
                description: plan.description,
                metadata: { plan_id: plan.id, level: plan.level },
              },
            },
          },
        ],
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
        locale: 'fr',
        success_url: successUrl,
        cancel_url: cancelUrl,
        subscription_data: { metadata: commonMetadata },
        metadata: commonMetadata,
      });
    } else {
      // PACK ou SESSION : paiement unique
      session = await stripe.checkout.sessions.create({
        mode: 'payment',
        customer: customerId,
        line_items: [
          {
            quantity: 1,
            price_data: {
              currency: plan.currency,
              unit_amount: plan.priceCents,
              product_data: {
                name: plan.name,
                description: plan.description,
                metadata: { plan_id: plan.id, level: plan.level },
              },
            },
          },
        ],
        allow_promotion_codes: true,
        billing_address_collection: 'auto',
        locale: 'fr',
        payment_intent_data: {
          metadata: commonMetadata,
          // Activation du reçu email automatique côté Stripe
          receipt_email: user.email,
        },
        invoice_creation: { enabled: true },
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: commonMetadata,
      });
    }

    if (!session.url) {
      return NextResponse.json(
        { error: 'Impossible de générer la session Stripe' },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[payments/checkout] error', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
