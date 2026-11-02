'use client';

import { useLanguage } from '@/context/LanguageContext';
import { useBooking } from '@/context/BookingContext';

export default function Contact() {
  const { language, t } = useLanguage();
  const openBooking = useBooking();
  const isFrench = language === 'fr';
  return (
    <section
      id="support"
      className="sika-section"
      aria-labelledby="contact-title"
    >
      <div className="sika-container border-stroke dark:border-strokedark grid gap-8 border-t pt-10 md:grid-cols-2">
        <div>
          <p className="sika-eyebrow">
            {isFrench ? 'Gardons le contact' : 'Let’s talk'}
          </p>
          <h2
            id="contact-title"
            className="sika-display sika-section-title mt-4"
          >
            {isFrench
              ? 'Une question avant de commencer ?'
              : 'A question before you start?'}
          </h2>
        </div>
        <div>
          <p className="sika-lead">
            {isFrench
              ? 'Pour parler de votre parcours ou de celui de votre enfant, contactez l’équipe SIKASCHOOL. Pour démarrer, retrouvez directement le formulaire de première séance.'
              : 'Contact the SIKASCHOOL team to discuss your learning needs or your child’s. To get started, open the first-session form.'}
          </p>
          <a
            className="sika-text-link mt-5 break-all"
            href="mailto:sikaschoolservice@gmail.com"
          >
            sikaschoolservice@gmail.com
          </a>
          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="https://wa.me/33626817578"
              target="_blank"
              rel="noopener noreferrer"
              className="sika-button sika-button-secondary"
            >
              WhatsApp <span aria-hidden="true">↗</span>
            </a>
            <button
              type="button"
              onClick={() => openBooking()}
              className="sika-button sika-button-blue"
            >
              {t.hero.reserveButton}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
