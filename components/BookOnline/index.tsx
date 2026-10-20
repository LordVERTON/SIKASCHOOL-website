'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useBooking } from '@/context/BookingContext';
import Button from '@/components/Common/Button';
import Card from '@/components/Common/Card';
import Alert from '@/components/Common/Alert';
import Section, { Container } from '@/components/Common/Section';
import PlanCard from '@/components/Pricing/PlanCard';
import { usePlanCheckout } from '@/components/Pricing/usePlanCheckout';
import { CLIENT_PLANS, getLevelLabel } from '@/lib/payments-catalog';

export default function BookOnline() {
  const { language, t } = useLanguage();
  const openBooking = useBooking();
  const fr = language === 'fr';
  const { startCheckout, pendingPlan, error } = usePlanCheckout('/book-online');
  return (
    <Section className="pt-36!" aria-labelledby="sessions-title">
      <Container>
        <p className="sika-eyebrow">{t.nav.perSession}</p>
        <h1
          id="sessions-title"
          className="sika-display sika-section-title mt-4"
        >
          {fr ? 'Une séance. Un prix clair.' : 'One session. One clear price.'}
        </h1>
        <p className="sika-lead mt-5">
          {fr
            ? 'Choisissez et payez votre séance avant de réserver votre créneau. Comparez les tarifs par niveau ou commencez par une première séance gratuite.'
            : 'Choose and pay for your session before booking a time. Compare prices by level or start with a free first session.'}
        </p>
        <Link href="/packs" className="sika-text-link mt-4">
          {t.nav.sessionPacks}
          <span aria-hidden="true">↗</span>
        </Link>
        {error && <Alert className="mt-6">{error}</Alert>}
        <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <Card>
            <p className="sika-eyebrow">{fr ? 'Tous niveaux' : 'All levels'}</p>
            <h2 className="mt-4 text-2xl font-bold">
              {fr ? 'Première séance gratuite' : 'Free first session'}
            </h2>
            <p className="mt-5 text-3xl font-bold">0 €</p>
            <p className="mt-3 pb-6 text-sm">
              {fr
                ? '1 séance de 60 minutes pour découvrir l’accompagnement.'
                : 'One 60-minute session to discover our tutoring.'}
            </p>
            <Button className="mt-auto w-full" onClick={() => openBooking()}>
              {t.hero.reserveButton}
            </Button>
          </Card>
          {CLIENT_PLANS.filter(plan => plan.kind === 'SESSION').map(plan => (
            <PlanCard
              key={plan.id}
              plan={plan}
              language={language}
              headingLevel="h2"
            >
              <Button
                variant="blue"
                className="w-full"
                disabled={pendingPlan !== null}
                loading={pendingPlan === plan.id}
                loadingLabel={
                  fr ? 'Préparation du paiement…' : 'Preparing checkout…'
                }
                onClick={() => void startCheckout(plan.id)}
              >
                {fr
                  ? `Choisir une séance ${plan.levelLabel}`
                  : `Choose a ${getLevelLabel(plan.level, language)} session`}
              </Button>
            </PlanCard>
          ))}
        </div>
      </Container>
    </Section>
  );
}
