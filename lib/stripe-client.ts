/**
 * Stripe browser client (singleton)
 * Utilisé uniquement si on embarque Stripe Elements ; notre flux principal
 * redirige vers Stripe Checkout (hosted) via window.location donc ce fichier
 * est prêt pour de futures extensions (Payment Element, Apple Pay Button, etc.).
 */

import { loadStripe, type Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!stripePromise) {
    const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.warn('[stripe-client] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY manquant');
      stripePromise = Promise.resolve(null);
    } else {
      stripePromise = loadStripe(key);
    }
  }
  return stripePromise;
}
