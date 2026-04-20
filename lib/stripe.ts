/**
 * Stripe server-side client + produit catalog.
 *
 * - Utilise STRIPE_SECRET_KEY (jamais exposé côté client)
 * - Toutes les créations de Checkout/Portal/Webhook passent par ce module
 */

import Stripe from 'stripe';

const apiKey = process.env.STRIPE_SECRET_KEY;

if (!apiKey && process.env.NODE_ENV !== 'test') {
  // On ne throw pas au build mais on log clairement en dev
  console.warn('[stripe] STRIPE_SECRET_KEY manquant. Les paiements seront désactivés.');
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

export const PLANS: Record<string, PlanDefinition> = {
  // ===== Packs Eco (8 séances) =====
  pack_eco_college: {
    id: 'pack_eco_college',
    kind: 'PACK',
    name: 'NOTA Eco',
    description: '8 séances · Collège · Maths, Français, Physique-Chimie',
    level: 'COLLEGE',
    levelLabel: 'Collège',
    priceCents: 14400,
    currency: 'eur',
    sessions: 8,
    badge: 'Eco',
    color: 'yellow',
  },
  pack_eco_lycee: {
    id: 'pack_eco_lycee',
    kind: 'PACK',
    name: 'AVA Eco',
    description: '8 séances · Lycée · Maths, Physique, SVT, Spécialités',
    level: 'LYCEE',
    levelLabel: 'Lycée',
    priceCents: 17600,
    currency: 'eur',
    sessions: 8,
    badge: 'Eco',
    color: 'sky',
  },
  pack_eco_superieur: {
    id: 'pack_eco_superieur',
    kind: 'PACK',
    name: 'TODA Eco',
    description: '8 séances · Supérieur · Maths, Physique, Info',
    level: 'SUPERIEUR',
    levelLabel: 'Supérieur',
    priceCents: 22400,
    currency: 'eur',
    sessions: 8,
    badge: 'Eco',
    color: 'green',
  },

  // ===== Packs Basic (4 séances) =====
  pack_basic_college: {
    id: 'pack_basic_college',
    kind: 'PACK',
    name: 'NOTA Basic',
    description: '4 séances · Collège · Maths, Français, Physique-Chimie',
    level: 'COLLEGE',
    levelLabel: 'Collège',
    priceCents: 8800,
    currency: 'eur',
    sessions: 4,
    badge: 'Basic',
    color: 'yellow',
  },
  pack_basic_lycee: {
    id: 'pack_basic_lycee',
    kind: 'PACK',
    name: 'AVA Basic',
    description: '4 séances · Lycée · Maths, Physique, SVT, Spécialités',
    level: 'LYCEE',
    levelLabel: 'Lycée',
    priceCents: 10800,
    currency: 'eur',
    sessions: 4,
    badge: 'Basic',
    color: 'sky',
  },
  pack_basic_superieur: {
    id: 'pack_basic_superieur',
    kind: 'PACK',
    name: 'TODA Basic',
    description: '4 séances · Supérieur · Maths, Physique, Info',
    level: 'SUPERIEUR',
    levelLabel: 'Supérieur',
    priceCents: 12800,
    currency: 'eur',
    sessions: 4,
    badge: 'Basic',
    color: 'green',
  },

  // ===== Séance à l'unité =====
  session_college: {
    id: 'session_college',
    kind: 'SESSION',
    name: 'Séance à l\'unité · Collège',
    description: '1 séance de 60 min · Collège',
    level: 'COLLEGE',
    levelLabel: 'Collège',
    priceCents: 2500,
    currency: 'eur',
    sessions: 1,
    color: 'yellow',
  },
  session_lycee: {
    id: 'session_lycee',
    kind: 'SESSION',
    name: 'Séance à l\'unité · Lycée',
    description: '1 séance de 60 min · Lycée',
    level: 'LYCEE',
    levelLabel: 'Lycée',
    priceCents: 3000,
    currency: 'eur',
    sessions: 1,
    color: 'sky',
  },
  session_superieur: {
    id: 'session_superieur',
    kind: 'SESSION',
    name: 'Séance à l\'unité · Supérieur',
    description: '1 séance de 60 min · Supérieur',
    level: 'SUPERIEUR',
    levelLabel: 'Supérieur',
    priceCents: 3800,
    currency: 'eur',
    sessions: 1,
    color: 'green',
  },

  // ===== Abonnements mensuels =====
  sub_college: {
    id: 'sub_college',
    kind: 'SUBSCRIPTION',
    name: 'Abonnement Collège',
    description: '4 séances / mois · Collège · résiliable à tout moment',
    level: 'COLLEGE',
    levelLabel: 'Collège',
    priceCents: 7900,
    currency: 'eur',
    sessions: 4,
    recurringInterval: 'month',
    color: 'yellow',
  },
  sub_lycee: {
    id: 'sub_lycee',
    kind: 'SUBSCRIPTION',
    name: 'Abonnement Lycée',
    description: '4 séances / mois · Lycée · résiliable à tout moment',
    level: 'LYCEE',
    levelLabel: 'Lycée',
    priceCents: 9900,
    currency: 'eur',
    sessions: 4,
    recurringInterval: 'month',
    color: 'sky',
  },
  sub_superieur: {
    id: 'sub_superieur',
    kind: 'SUBSCRIPTION',
    name: 'Abonnement Supérieur',
    description: '4 séances / mois · Supérieur · résiliable à tout moment',
    level: 'SUPERIEUR',
    levelLabel: 'Supérieur',
    priceCents: 11900,
    currency: 'eur',
    sessions: 4,
    recurringInterval: 'month',
    color: 'green',
  },
};

export function getPlan(id: string): PlanDefinition | null {
  return PLANS[id] ?? null;
}

export function listPlans(kind?: PlanKind): PlanDefinition[] {
  const all = Object.values(PLANS);
  return kind ? all.filter((p) => p.kind === kind) : all;
}

/** Formate un prix en centimes vers "24,00 €" */
export function formatPrice(cents: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 2,
  }).format(cents / 100);
}
