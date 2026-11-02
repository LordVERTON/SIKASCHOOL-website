'use client';

import { useLanguage } from '@/context/LanguageContext';
import { brandCopy } from '@/lib/brand-copy';

export default function Identity() {
  const { language } = useLanguage();
  const copy = brandCopy[language].identity;
  return (
    <section
      id="about"
      className="sika-section sika-identity"
      aria-labelledby="identity-title"
    >
      <div className="sika-container">
        <p className="sika-eyebrow mb-8">{copy.eyebrow}</p>
        <div className="sika-identity-grid">
          <h2 id="identity-title" className="sika-display">
            {copy.words.map(word => (
              <span key={word}>{word}</span>
            ))}
          </h2>
          <p className="sika-lead">{copy.description}</p>
        </div>
      </div>
    </section>
  );
}
