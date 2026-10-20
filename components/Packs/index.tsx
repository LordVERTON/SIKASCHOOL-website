'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import Button from '@/components/Common/Button';
import Alert from '@/components/Common/Alert';
import Section, { Container } from '@/components/Common/Section';
import PlanCard from '@/components/Pricing/PlanCard';
import { usePlanCheckout } from '@/components/Pricing/usePlanCheckout';
import { CLIENT_PLANS, getLevelLabel } from '@/lib/payments-catalog';

export default function Packs() {
  const { language, t } = useLanguage();
  const fr = language === 'fr';
  const { startCheckout, pendingPlan, error } = usePlanCheckout('/packs');
  return (
    <Section className="pt-36!" aria-labelledby="packs-title">
      <Container>
        <p className="sika-eyebrow">{t.nav.sessionPacks}</p>
        <h1 id="packs-title" className="sika-display sika-section-title mt-4">
          {fr
            ? 'Un pack adapté à votre rythme.'
            : 'A session pack at your pace.'}
        </h1>
        <p className="sika-lead mt-5">
          {fr
            ? 'Comparez le prix total et le coût par séance pour votre niveau. Un pack est un carnet de séances ; il se distingue d’un abonnement mensuel.'
            : 'Compare the total and per-session price for your level. A pack is a set of sessions, separate from a monthly subscription.'}
        </p>
        <Link href="/book-online" className="sika-text-link mt-4">
          {t.nav.perSession}
          <span aria-hidden="true">↗</span>
        </Link>
        {error && <Alert className="mt-6">{error}</Alert>}
        {[8, 4].map(count => (
          <section
            key={count}
            className="mt-12"
            aria-labelledby={`packs-${count}`}
          >
            <h2 id={`packs-${count}`} className="mb-6 text-2xl font-bold">
              {fr ? `Packs de ${count} séances` : `${count}-session packs`} ·{' '}
              {count === 8 ? 'Eco' : 'Basic'}
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {CLIENT_PLANS.filter(
                plan => plan.kind === 'PACK' && plan.sessions === count
              ).map(plan => (
                <PlanCard key={plan.id} plan={plan} language={language}>
                  <Button
                    className="w-full"
                    disabled={pendingPlan !== null}
                    loading={pendingPlan === plan.id}
                    loadingLabel={
                      fr ? 'Préparation du paiement…' : 'Preparing checkout…'
                    }
                    onClick={() => void startCheckout(plan.id)}
                  >
                    {fr
                      ? `Choisir le pack ${plan.levelLabel} ${plan.badge}`
                      : `Choose ${getLevelLabel(plan.level, language)} ${plan.badge}`}
                  </Button>
                </PlanCard>
              ))}
            </div>
          </section>
        ))}
        <p className="mt-8 max-w-3xl text-sm leading-relaxed">
          {fr
            ? 'Les économies sont calculées sur le tarif à la séance du même niveau, hors promotion. Le montant total est payé à l’achat du pack.'
            : 'Savings are calculated against single sessions at the same level, excluding promotions. The total is paid when purchasing the pack.'}
        </p>
      </Container>
    </Section>
  );
}
