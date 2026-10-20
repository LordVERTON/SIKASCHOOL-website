'use client';

import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { brandCopy } from '@/lib/brand-copy';

export default function Method() {
  const { language } = useLanguage();
  const copy = brandCopy[language].method;
  return (
    <section
      id="how-it-works"
      className="sika-section"
      aria-labelledby="method-title"
    >
      <div className="sika-container">
        <p className="sika-eyebrow">{copy.eyebrow}</p>
        <h2 id="method-title" className="sika-display sika-section-title mt-4">
          {copy.title}
        </h2>
        <ol className="sika-steps">
          {copy.steps.map((step, index) => (
            <li key={step.title}>
              <span className="sika-step-number" aria-hidden="true">
                0{index + 1}
              </span>
              <div>
                <h3 className="mt-4 text-xl font-bold">{step.title}</h3>
                <p className="mt-3 leading-relaxed">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
        <Link href="/how-to" className="sika-text-link mt-7">
          {copy.link}
          <span aria-hidden="true">↗</span>
        </Link>
      </div>
    </section>
  );
}
