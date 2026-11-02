'use client';

import { useLanguage } from '@/context/LanguageContext';
import { brandCopy } from '@/lib/brand-copy';

export default function Reassurance() {
  const { language } = useLanguage();
  const copy = brandCopy[language].reassurance;
  return (
    <section
      id="reassurance"
      className="sika-reassurance"
      aria-label={copy.label}
    >
      <ul className="sika-container sika-reassurance-grid">
        {copy.items.map((item, index) => (
          <li key={item.title}>
            <span className="sika-reassurance-mark" aria-hidden="true">
              0{index + 1}
            </span>
            <div>
              <h2>{item.title}</h2>
              <p className="mt-2 text-sm leading-relaxed">{item.description}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
