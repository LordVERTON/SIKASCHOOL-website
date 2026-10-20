/**
 * Stripe server-side client + produit catalog.
 *
 * - Utilise STRIPE_SECRET_KEY (jamais exposé côté client)
 * - Toutes les créations de Checkout/Portal/Webhook passent par ce module
 */

import Stripe from 'stripe';
import { CLIENT_PLANS } from './payments-catalog';

const apiKey = process.env.STRIPE_SECRET_KEY;

if (!apiKey && process.env.NODE_ENV !== 'test') {
  // On ne throw pas au build mais on log clairement en dev
  console.warn(
    '[stripe] STRIPE_SECRET_KEY manquant. Les paiements seront désactivés.'
  );
}

export const stripe: Stripe = apiKey
  ? new Stripe(apiKey, {
      // On ne fixe pas apiVersion : on laisse Stripe utiliser la version par
      // défaut associée au compte (configurable dans le Dashboard). Cela évite
      // les ruptures de types à chaque nouvelle version du SDK.
      typescript: true,
      appInfo: {
        name: 'SikaSchool',
        version: '1.3.1',
      },
    })
  : (null as unknown as Stripe);

export function assertStripeConfigured(): void {
  if (!stripe) {
    throw new Error(
      'Stripe non configuré : ajoute STRIPE_SECRET_KEY dans .env.local (voir docs/STRIPE_SETUP.md)'
    );
  }
}

/**
 * Catalogue de packs / séances à l'unité / abonnements.
 * Source de vérité pour l'affichage ET la création des Checkout Sessions.
 *
 * Les prix sont en centimes (EUR). Ils sont volontairement créés à la volée
 * (price_data) pour éviter d'avoir à créer/syncroniser des Products/Prices
 * côté Stripe Dashboard. Pour passer en prod, il est recommandé de migrer
 * ces définitions vers des Stripe Prices persistants.
 */

export type PlanKind = 'PACK' | 'SESSION' | 'SUBSCRIPTION';
export type PlanLevel = 'COLLEGE' | 'LYCEE' | 'SUPERIEUR';

export interface PlanDefinition {
  id: string;
  kind: PlanKind;
  name: string;
  description: string;
  level: PlanLevel;
  levelLabel: string;
  priceCents: number;
  currency: 'eur';
  sessions?: number; // nombre de séances créditées (PACK ou SESSION)
  recurringInterval?: 'month';
  badge?: string;
  color: string;
}

// The public cards and Stripe price_data use the same amounts and product IDs.
export const PLANS: Record<string, PlanDefinition> = Object.fromEntries(
  CLIENT_PLANS.map(plan => [
    plan.id,
    {
      ...plan,
      name:
        plan.kind === 'SESSION'
          ? `${plan.name} · ${plan.levelLabel}`
          : plan.name,
      currency: 'eur' as const,
    },
  ])
);

export function getPlan(id: string): PlanDefinition | null {
  return PLANS[id] ?? null;
}

export function listPlans(kind?: PlanKind): PlanDefinition[] {
  const all = Object.values(PLANS);
  return kind ? all.filter(p => p.kind === kind) : all;
}

/** Formate un prix en centimes vers "24,00 €" */
export function formatPrice(cents: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(cents / 100);
}
