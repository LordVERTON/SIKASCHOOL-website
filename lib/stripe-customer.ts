/**
 * Helpers pour associer un user SikaSchool à un Stripe Customer.
 * Cette association est stockée dans users.stripe_customer_id.
 */

import { stripe, assertStripeConfigured } from './stripe';
import { supabaseAdmin } from './supabase';

interface UserRow {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  stripe_customer_id: string | null;
}

/**
 * Retourne l'ID Stripe Customer du user ; le crée si nécessaire.
 */
export async function getOrCreateStripeCustomer(userId: string): Promise<string> {
  assertStripeConfigured();

  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, email, first_name, last_name, stripe_customer_id')
    .eq('id', userId)
    .single();

  if (error || !data) {
    throw new Error(`[stripe-customer] User introuvable: ${userId}`);
  }

  const user = data as UserRow;

  if (user.stripe_customer_id) {
    return user.stripe_customer_id;
  }

  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();

  const customer = await stripe.customers.create({
    email: user.email,
    name: fullName || undefined,
    metadata: {
      sikaschool_user_id: user.id,
    },
  });

  const { error: updateError } = await supabaseAdmin
    .from('users')
    // @ts-expect-error stripe_customer_id n'est pas encore typé dans Database
    .update({ stripe_customer_id: customer.id })
    .eq('id', userId);

  if (updateError) {
    console.error('[stripe-customer] failed to persist stripe_customer_id', updateError);
  }

  return customer.id;
}
