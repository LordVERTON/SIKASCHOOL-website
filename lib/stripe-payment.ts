import { z } from 'zod';

// The webhook is authenticated by Stripe; its metadata still needs a contract.
export const stripePaymentSchema = z.object({
  student_id: z.string().uuid(),
  stripe_checkout_session: z.string().min(1).nullable(),
  stripe_invoice_id: z.string().min(1).nullable(),
  stripe_payment_intent: z.string().nullable(),
  stripe_subscription_id: z.string().nullable(),
  stripe_customer_id: z.string().nullable(),
  plan_id: z.string().min(1).max(100),
  kind: z.enum(['PACK', 'SESSION', 'SUBSCRIPTION']),
  level: z.enum(['COLLEGE', 'LYCEE', 'SUPERIEUR']),
  sessions_count: z.number().int().positive(),
  amount_cents: z.number().int().nonnegative(),
  currency: z.string().regex(/^[A-Z]{3}$/),
  paid_at: z.string().datetime(),
  hosted_invoice_url: z.string().url().nullable(),
  invoice_pdf_url: z.string().url().nullable(),
}).refine(value => value.kind === 'SUBSCRIPTION'
  ? Boolean(value.stripe_invoice_id) && !value.stripe_checkout_session
  : Boolean(value.stripe_checkout_session), 'Missing payment source');

export type StripePayment = z.infer<typeof stripePaymentSchema>;

