import type { ReactNode } from 'react';
import Card from '@/components/Common/Card';
import {
  formatEuros,
  getPlanPricing,
  getLevelLabel,
  LEVEL_COLORS,
  type ClientPlan,
} from '@/lib/payments-catalog';

export default function PlanCard({
  plan,
  children,
  language = 'fr',
  headingLevel: Heading = 'h3',
}: {
  plan: ClientPlan;
  children: ReactNode;
  language?: 'fr' | 'en';
  headingLevel?: 'h2' | 'h3';
}) {
  const fr = language === 'fr';
  const { perSessionCents, referenceCents, savingsCents } =
    getPlanPricing(plan);
  const level = getLevelLabel(plan.level, language);
  return (
    <Card>
      <p
        className={`self-start rounded-full px-3 py-1 text-xs font-semibold ${LEVEL_COLORS[plan.level].bg} ${LEVEL_COLORS[plan.level].text}`}
      >
        {plan.kind === 'PACK'
          ? `Pack ${plan.badge}`
          : fr
            ? 'À la séance'
            : 'Single session'}
      </p>
      <Heading className="mt-4 text-2xl font-bold">{level}</Heading>
      <p className="text-primary mt-5 text-3xl font-bold">
        {formatEuros(plan.priceCents)}
      </p>
      <p className="mt-2 text-sm">
        {plan.sessions ?? 1}{' '}
        {fr
          ? plan.sessions === 1
            ? 'séance · TTC'
            : 'séances · TTC'
          : plan.sessions === 1
            ? 'session · incl. tax'
            : 'sessions · incl. tax'}
      </p>
      <p className="mt-3 font-semibold">
        {formatEuros(perSessionCents)} / {fr ? 'séance' : 'session'}
      </p>
      {plan.kind === 'SESSION' && (
        <p className="mt-2 text-sm">
          {fr ? 'Durée : 60 minutes' : 'Duration: 60 minutes'}
        </p>
      )}
      {savingsCents > 0 && (
        <p className="mt-4 text-sm leading-relaxed">
          {fr ? 'Économie de ' : 'Save '}
          <strong>{formatEuros(savingsCents)}</strong>
          {fr
            ? ` par rapport à ${plan.sessions} séances à l’unité (${formatEuros(referenceCents!)}).`
            : ` compared with ${plan.sessions} single sessions (${formatEuros(referenceCents!)}).`}
        </p>
      )}
      <div className="mt-auto pt-6">{children}</div>
    </Card>
  );
}
