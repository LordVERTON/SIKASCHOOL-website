/**
 * Catalogue partagé côté client (sans dépendance Stripe SDK server).
 * Reflète exactement le contenu de `lib/stripe.ts` mais sûr à importer
 * depuis un composant client ("use client").
 */

export type PlanKind = 'PACK' | 'SESSION' | 'SUBSCRIPTION';
export type PlanLevel = 'COLLEGE' | 'LYCEE' | 'SUPERIEUR';

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
  { id: 'pack_eco_college', kind: 'PACK', name: 'NOTA Eco', description: '8 séances · Maths, Français, Physique-Chimie', level: 'COLLEGE', levelLabel: 'Collège', priceCents: 14400, sessions: 8, badge: 'Eco', color: 'yellow' },
  { id: 'pack_eco_lycee', kind: 'PACK', name: 'AVA Eco', description: '8 séances · Maths, Physique, SVT, Spécialités', level: 'LYCEE', levelLabel: 'Lycée', priceCents: 17600, sessions: 8, badge: 'Eco', color: 'sky' },
  { id: 'pack_eco_superieur', kind: 'PACK', name: 'TODA Eco', description: '8 séances · Maths, Physique, Info', level: 'SUPERIEUR', levelLabel: 'Supérieur', priceCents: 22400, sessions: 8, badge: 'Eco', color: 'green' },
  { id: 'pack_basic_college', kind: 'PACK', name: 'NOTA Basic', description: '4 séances · Maths, Français, Physique-Chimie', level: 'COLLEGE', levelLabel: 'Collège', priceCents: 8800, sessions: 4, badge: 'Basic', color: 'yellow' },
  { id: 'pack_basic_lycee', kind: 'PACK', name: 'AVA Basic', description: '4 séances · Maths, Physique, SVT, Spécialités', level: 'LYCEE', levelLabel: 'Lycée', priceCents: 10800, sessions: 4, badge: 'Basic', color: 'sky' },
  { id: 'pack_basic_superieur', kind: 'PACK', name: 'TODA Basic', description: '4 séances · Maths, Physique, Info', level: 'SUPERIEUR', levelLabel: 'Supérieur', priceCents: 12800, sessions: 4, badge: 'Basic', color: 'green' },
  { id: 'session_college', kind: 'SESSION', name: 'Séance à l\'unité', description: '1 séance 60 min · Collège', level: 'COLLEGE', levelLabel: 'Collège', priceCents: 2500, sessions: 1, color: 'yellow' },
  { id: 'session_lycee', kind: 'SESSION', name: 'Séance à l\'unité', description: '1 séance 60 min · Lycée', level: 'LYCEE', levelLabel: 'Lycée', priceCents: 3000, sessions: 1, color: 'sky' },
  { id: 'session_superieur', kind: 'SESSION', name: 'Séance à l\'unité', description: '1 séance 60 min · Supérieur', level: 'SUPERIEUR', levelLabel: 'Supérieur', priceCents: 3800, sessions: 1, color: 'green' },
  { id: 'sub_college', kind: 'SUBSCRIPTION', name: 'Abonnement Collège', description: '4 séances / mois · résiliable à tout moment', level: 'COLLEGE', levelLabel: 'Collège', priceCents: 7900, sessions: 4, recurringInterval: 'month', color: 'yellow' },
  { id: 'sub_lycee', kind: 'SUBSCRIPTION', name: 'Abonnement Lycée', description: '4 séances / mois · résiliable à tout moment', level: 'LYCEE', levelLabel: 'Lycée', priceCents: 9900, sessions: 4, recurringInterval: 'month', color: 'sky' },
  { id: 'sub_superieur', kind: 'SUBSCRIPTION', name: 'Abonnement Supérieur', description: '4 séances / mois · résiliable à tout moment', level: 'SUPERIEUR', levelLabel: 'Supérieur', priceCents: 11900, sessions: 4, recurringInterval: 'month', color: 'green' },
];

export function formatEuros(cents: number): string {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(cents / 100);
}

export const LEVEL_COLORS: Record<PlanLevel, { bg: string; text: string; ring: string }> = {
  COLLEGE:   { bg: 'bg-yellow-50 dark:bg-yellow-500/10', text: 'text-yellow-800 dark:text-yellow-300', ring: 'ring-yellow-200 dark:ring-yellow-500/30' },
  LYCEE:     { bg: 'bg-sky-50 dark:bg-sky-500/10',       text: 'text-sky-800 dark:text-sky-300',       ring: 'ring-sky-200 dark:ring-sky-500/30' },
  SUPERIEUR: { bg: 'bg-emerald-50 dark:bg-emerald-500/10', text: 'text-emerald-800 dark:text-emerald-300', ring: 'ring-emerald-200 dark:ring-emerald-500/30' },
};
