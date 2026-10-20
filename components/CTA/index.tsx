'use client';

import { useBooking } from '@/context/BookingContext';
import { useLanguage } from '@/context/LanguageContext';
import { brandCopy } from '@/lib/brand-copy';

export default function CTA() {
  const openBooking = useBooking();
  const { language, t } = useLanguage();
  const copy = brandCopy[language].cta;
  return (
    <section
      className="sika-section sika-final-cta"
      aria-labelledby="final-cta-title"
    >
      <div className="sika-container">
        <p className="sika-eyebrow mb-5">{copy.eyebrow}</p>
        <h2 id="final-cta-title" className="sika-display">
          {copy.title} <span className="sika-highlight">{copy.accent}</span>
        </h2>
        <p className="sika-lead mt-6">{copy.description}</p>
        <button
          type="button"
          className="sika-button mt-8"
          onClick={() => openBooking()}
        >
          {t.hero.reserveButton}
          <span aria-hidden="true">↗</span>
        </button>
      </div>
    </section>
  );
}
