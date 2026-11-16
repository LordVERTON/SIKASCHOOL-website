import type Stripe from 'stripe';
import { stripe } from '@/lib/stripe';
import { supabaseAdmin } from '@/lib/supabase';
import { stripePaymentSchema } from '@/lib/stripe-payment';

function reference(value: string | { id: string } | null | undefined) {
  return typeof value === 'string' ? value : value?.id ?? null;
}

function subscriptionReference(invoice: Stripe.Invoice) {
  const legacy = invoice as unknown as { subscription?: string | { id: string } };
  return reference(invoice.parent?.subscription_details?.subscription ?? legacy.subscription);
}

function metadata(meta: Stripe.Metadata | null | undefined) {
  return {
    student_id: meta?.sikaschool_student_id || meta?.sikaschool_user_id,
    plan_id: meta?.plan_id,
    kind: meta?.plan_kind?.toUpperCase(),
    level: meta?.plan_level,
    sessions_count: Number(meta?.sessions_count),
  };
}

export async function processStripeEvent(event: Stripe.Event) {
  if (!stripe) throw new Error('Stripe unavailable');
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      const session = event.data.object as Stripe.Checkout.Session;
      // Subscription invoices are the sole accounting source, including the first one.
      if (session.mode === 'subscription' || session.metadata?.plan_kind === 'SUBSCRIPTION') return;
      // Completed checkout does not imply settled payment for delayed payment methods.
      if (session.payment_status !== 'paid') return;
      const details = metadata(session.metadata);
      if (!details.student_id && !details.plan_id) return;
      const invoice = session.invoice
        ? await stripe.invoices.retrieve(reference(session.invoice)!) : null;
      const payment = stripePaymentSchema.parse({
        ...details,
        stripe_checkout_session: session.id,
        stripe_invoice_id: invoice?.id ?? null,
        stripe_payment_intent: reference(session.payment_intent),
        stripe_subscription_id: null,
        stripe_customer_id: reference(session.customer),
        amount_cents: session.amount_total,
        currency: session.currency?.toUpperCase(),
        paid_at: new Date(event.created * 1000).toISOString(),
        hosted_invoice_url: invoice?.hosted_invoice_url ?? null,
        invoice_pdf_url: invoice?.invoice_pdf ?? null,
      });
      const { error } = await supabaseAdmin.rpc('apply_stripe_payment', {
        p_event_id: event.id, p_payment: payment,
      });
      if (error) throw new Error('Payment transaction failed');
      return;
    }
    case 'invoice.paid':
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object as Stripe.Invoice;
      const subId = subscriptionReference(invoice);
      if (!subId || invoice.status !== 'paid') return;
      const sub = await stripe.subscriptions.retrieve(subId);
      const details = metadata(sub.metadata);
      if (!details.student_id && !details.plan_id) return;
      const legacy = invoice as unknown as { payment_intent?: string | { id: string } };
      const payment = stripePaymentSchema.parse({
        ...details, kind: 'SUBSCRIPTION',
        stripe_checkout_session: null,
        stripe_invoice_id: invoice.id,
        stripe_payment_intent: reference(legacy.payment_intent),
        stripe_subscription_id: subId,
        stripe_customer_id: reference(invoice.customer),
        amount_cents: invoice.amount_paid,
        currency: invoice.currency.toUpperCase(),
        paid_at: new Date((invoice.status_transitions.paid_at ?? event.created) * 1000).toISOString(),
        hosted_invoice_url: invoice.hosted_invoice_url ?? null,
        invoice_pdf_url: invoice.invoice_pdf ?? null,
      });
      const { error } = await supabaseAdmin.rpc('apply_stripe_payment', {
        p_event_id: event.id, p_payment: payment,
      });
      if (error) throw new Error('Payment transaction failed');
      return;
    }
    case 'invoice.payment_failed': {
      const invoice = event.data.object as Stripe.Invoice;
      const { error } = await supabaseAdmin.from('payments').update({ status: 'FAILED' })
        .eq('stripe_invoice_id', invoice.id).in('status', ['PENDING', 'FAILED']);
      if (error) throw new Error('Payment update failed');
      return;
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
    case 'customer.subscription.deleted': {
      const sub = await stripe.subscriptions.retrieve(event.data.object.id);
      const details = metadata(sub.metadata);
      if (!details.student_id || !details.plan_id) return;
      const period = sub.items.data[0];
      const { error } = await supabaseAdmin.from('subscriptions').upsert({
        student_id: details.student_id, stripe_subscription_id: sub.id,
        stripe_customer_id: reference(sub.customer), plan_id: details.plan_id,
        level: details.level ?? null, status: sub.status,
        current_period_start: period ? new Date(period.current_period_start * 1000).toISOString() : null,
        current_period_end: period ? new Date(period.current_period_end * 1000).toISOString() : null,
        cancel_at_period_end: sub.cancel_at_period_end,
        canceled_at: sub.canceled_at ? new Date(sub.canceled_at * 1000).toISOString() : null,
      }, { onConflict: 'stripe_subscription_id' });
      if (error) throw new Error('Subscription update failed');
      return;
    }
    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge;
      const intentId = reference(charge.payment_intent);
      // Credit reversal awaits the commercial policy in SK-001.
      if (!intentId || !charge.refunded) return;
      const { error } = await supabaseAdmin.from('payments').update({ status: 'REFUNDED' })
        .eq('stripe_payment_intent', intentId);
      if (error) throw new Error('Refund update failed');
    }
  }
}
