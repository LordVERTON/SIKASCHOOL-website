'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { CLIENT_PLANS } from '@/lib/payments-catalog';

import PlanCard from './PlanCard';

const packs = CLIENT_PLANS.filter(
  plan => plan.kind === 'PACK' && plan.sessions === 8
);

export default function Pricing() {
  const { language, t } = useLanguage();
  const isFrench = language === 'fr';
  return (
    <section className="sika-section" aria-labelledby="pricing-title">
      <div className="sika-container">
        <p className="sika-eyebrow">{t.pricing.title}</p>
        <h2 id="pricing-title" className="sika-display sika-section-title mt-4">
          {isFrench
            ? 'À chaque parcours, sa formule.'
            : 'A plan for your learning journey.'}
        </h2>
        <p className="sika-lead mt-5">
          {isFrench
            ? 'Des carnets de séances pour le collège, le lycée et le supérieur. Choisissez selon votre niveau et vos besoins.'
            : 'Session packs for middle school, high school and higher education. Choose according to your level and needs.'}
        </p>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {packs.map(pack => (
            <PlanCard key={pack.id} plan={pack} language={language}>
              <Link href="/packs" className="sika-text-link">
                {t.hero.secondaryButton}
                <span aria-hidden="true">↗</span>
              </Link>
            </PlanCard>
          ))}
        </div>
        <Link href="/book-online" className="sika-text-link mt-6">
          {isFrench ? 'Besoin d’une seule séance ?' : 'Need a single session?'}
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  );
}
