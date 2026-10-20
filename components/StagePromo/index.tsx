'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useBooking } from '@/context/BookingContext';
import { getActiveCampaign } from '@/lib/campaigns';

const StagePromo = () => {
  const { t } = useLanguage();
  const openBooking = useBooking();
  const campaign = getActiveCampaign();
  const benefits = [
    t.stagePromo.benefitReview,
    t.stagePromo.benefitConsolidate,
    t.stagePromo.benefitConfidence,
  ];

  if (!campaign) return null;

  return (
    <section
      className="px-4 pb-8 md:px-8"
      aria-labelledby="back-to-school-offer-title"
    >
      <div className="max-w-c-1315 bg-primary shadow-solid-10 mx-auto overflow-hidden rounded-2xl px-6 py-8 text-white md:px-10 md:py-10">
        <div className="flex flex-col items-start justify-between gap-8 lg:flex-row lg:items-center">
          <div>
            <p className="text-brand-orange mb-2 font-semibold tracking-wider uppercase">
              {t.stagePromo.subtitle}
            </p>
            <h2
              id="back-to-school-offer-title"
              className="text-3xl font-bold md:text-4xl"
            >
              {t.stagePromo.title}
            </h2>
            <p className="mt-4 max-w-3xl text-lg text-white/90">
              {t.stagePromo.description}
            </p>
            <ul className="mt-5 flex flex-col gap-2 md:flex-row md:flex-wrap md:gap-x-6">
              {benefits.map(benefit => (
                <li
                  key={benefit}
                  className="flex items-center gap-2 font-medium"
                >
                  <span className="text-brand-orange" aria-hidden="true">
                    ✓
                  </span>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>

          <button
            type="button"
            onClick={() => openBooking({ campaign: campaign.id })}
            className="sika-button shrink-0"
          >
            {t.hero.reserveButton}
          </button>
        </div>
      </div>
    </section>
  );
};

export default StagePromo;
