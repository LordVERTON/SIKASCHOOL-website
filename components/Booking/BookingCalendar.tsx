'use client';

import Method from '@/components/Homepage/Method';
import { useBooking } from '@/context/BookingContext';
import { useLanguage } from '@/context/LanguageContext';

export default function BookingCalendar() {
  const openBooking = useBooking();
  const { language, t } = useLanguage();
  return (
    <div className="pt-36">
      <div className="sika-container">
        <p className="sika-eyebrow">SIKASCHOOL</p>
        <h1 className="sika-display sika-section-title mt-4">
          {language === 'fr'
            ? 'Votre première séance commence ici.'
            : 'Your first session starts here.'}
        </h1>
        <p className="sika-lead mt-6">
          {language === 'fr'
            ? 'Indiquez votre niveau et votre matière. Les créneaux disponibles vous seront proposés dans le formulaire, après vos coordonnées.'
            : 'Tell us your level and subject. Available slots will be offered in the form after you enter your contact details.'}
        </p>
        <button
          type="button"
          className="sika-button mt-7"
          onClick={() => openBooking()}
        >
          {t.hero.reserveButton}
          <span aria-hidden="true">↗</span>
        </button>
      </div>
      <Method />
    </div>
  );
}
