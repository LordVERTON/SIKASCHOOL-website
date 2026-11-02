/**
 * Catalogue partagé côté client (sans dépendance Stripe SDK server).
 * Source commune à l'affichage public et à `lib/stripe.ts` (Checkout).
 * Aucun SDK serveur ne doit être importé ici.
 */

export type PlanKind = 'PACK' | 'SESSION' | 'SUBSCRIPTION';
export type PlanLevel = 'COLLEGE' | 'LYCEE' | 'SUPERIEUR';

export function getLevelLabel(level: PlanLevel, language: 'fr' | 'en' = 'fr') {
  const labels = {
    fr: { COLLEGE: 'Collège', LYCEE: 'Lycée', SUPERIEUR: 'Supérieur' },
    en: {
      COLLEGE: 'Middle school',
      LYCEE: 'High school',
      SUPERIEUR: 'Higher education',
    },
  };
  return labels[language][level];
}

export interface ClientPlan {
  id: string;
  kind: PlanKind;
  name: string;
  description: string;
  level: PlanLevel;
  levelLabel: string;
  priceCents: number;
  sessions?: number;
  recurringInterval?: 'month';
  badge?: string;
  color: string;
}

export const CLIENT_PLANS: ClientPlan[] = [
  {
    id: 'pack_eco_college',
    kind: 'PACK',
    name: 'NOTA Eco',
    description: '8 séances · Maths, Français, Physique-Chimie',
    level: 'COLLEGE',
    levelLabel: 'Collège',
    priceCents: 14400,
    sessions: 8,
    badge: 'Eco',
    color: 'yellow',
  },
  {
    id: 'pack_eco_lycee',
    kind: 'PACK',
    name: 'AVA Eco',
    description: '8 séances · Maths, Physique, SVT, Spécialités',
    level: 'LYCEE',
    levelLabel: 'Lycée',
    priceCents: 17600,
    sessions: 8,
    badge: 'Eco',
    color: 'sky',
  },
  {
    id: 'pack_eco_superieur',
    kind: 'PACK',
    name: 'TODA Eco',
    description: '8 séances · Maths, Physique, Info',
    level: 'SUPERIEUR',
    levelLabel: 'Supérieur',
    priceCents: 22400,
    sessions: 8,
    badge: 'Eco',
    color: 'green',
  },
  {
    id: 'pack_basic_college',
    kind: 'PACK',
    name: 'NOTA Basic',
    description: '4 séances · Maths, Français, Physique-Chimie',
    level: 'COLLEGE',
    levelLabel: 'Collège',
    priceCents: 8800,
    sessions: 4,
    badge: 'Basic',
    color: 'yellow',
  },
  {
    id: 'pack_basic_lycee',
    kind: 'PACK',
    name: 'AVA Basic',
    description: '4 séances · Maths, Physique, SVT, Spécialités',
    level: 'LYCEE',
    levelLabel: 'Lycée',
    priceCents: 10800,
    sessions: 4,
    badge: 'Basic',
    color: 'sky',
  },
  {
    id: 'pack_basic_superieur',
    kind: 'PACK',
    name: 'TODA Basic',
    description: '4 séances · Maths, Physique, Info',
    level: 'SUPERIEUR',
    levelLabel: 'Supérieur',
    priceCents: 12800,
    sessions: 4,
    badge: 'Basic',
    color: 'green',
  },
  {
    id: 'session_college',
    kind: 'SESSION',
    name: "Séance à l'unité",
    description: '1 séance 60 min · Collège',
    level: 'COLLEGE',
    levelLabel: 'Collège',
    priceCents: 2500,
    sessions: 1,
    color: 'yellow',
  },
  {
    id: 'session_lycee',
    kind: 'SESSION',
    name: "Séance à l'unité",
    description: '1 séance 60 min · Lycée',
    level: 'LYCEE',
    levelLabel: 'Lycée',
    priceCents: 3000,
    sessions: 1,
    color: 'sky',
  },
  {
    id: 'session_superieur',
    kind: 'SESSION',
    name: "Séance à l'unité",
    description: '1 séance 60 min · Supérieur',
    level: 'SUPERIEUR',
    levelLabel: 'Supérieur',
    priceCents: 3800,
    sessions: 1,
    color: 'green',
  },
  {
    id: 'sub_college',
    kind: 'SUBSCRIPTION',
    name: 'Abonnement Collège',
    description: '4 séances / mois · résiliable à tout moment',
    level: 'COLLEGE',
    levelLabel: 'Collège',
    priceCents: 7900,
    sessions: 4,
    recurringInterval: 'month',
    color: 'yellow',
  },
  {
    id: 'sub_lycee',
    kind: 'SUBSCRIPTION',
    name: 'Abonnement Lycée',
    description: '4 séances / mois · résiliable à tout moment',
    level: 'LYCEE',
    levelLabel: 'Lycée',
    priceCents: 9900,
    sessions: 4,
    recurringInterval: 'month',
    color: 'sky',
  },
  {
    id: 'sub_superieur',
    kind: 'SUBSCRIPTION',
    name: 'Abonnement Supérieur',
    description: '4 séances / mois · résiliable à tout moment',
    level: 'SUPERIEUR',
    levelLabel: 'Supérieur',
    priceCents: 11900,
    sessions: 4,
    recurringInterval: 'month',
    color: 'green',
  },
];

export function formatEuros(cents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

/** Compare à autant de séances à l'unité du même niveau, en centimes. */
export function getPlanPricing(plan: ClientPlan) {
  const sessions = plan.sessions ?? 1;
  const unitPlan = CLIENT_PLANS.find(
    candidate => candidate.kind === 'SESSION' && candidate.level === plan.level
  );
  const referenceCents = unitPlan ? unitPlan.priceCents * sessions : null;
  return {
    perSessionCents: plan.priceCents / sessions,
    referenceCents,
    savingsCents:
      referenceCents === null
        ? 0
        : Math.max(0, referenceCents - plan.priceCents),
  };
}

export const LEVEL_COLORS: Record<
  PlanLevel,
  { bg: string; text: string; ring: string }
> = {
  COLLEGE: {
    bg: 'bg-brand-orange/20',
    text: 'text-primary dark:text-white',
    ring: 'ring-brand-orange/50',
  },
  LYCEE: {
    bg: 'bg-primary/10 dark:bg-white/10',
    text: 'text-primary dark:text-white',
    ring: 'ring-primary/30 dark:ring-white/30',
  },
  SUPERIEUR: {
    bg: 'bg-zumthor dark:bg-white/10',
    text: 'text-primary dark:text-white',
    ring: 'ring-stroke dark:ring-strokedark',
  },
};
