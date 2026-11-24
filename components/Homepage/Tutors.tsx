'use client';

import Link from 'next/link';
import danielPortrait from '@/public/images/team/daniel.jpg';
import { useLanguage } from '@/context/LanguageContext';
import { brandCopy } from '@/lib/brand-copy';
import TutorCard from './TutorCard';

// Identities and Daniel's quote: components/AboutPage/index.tsx.
// Daniel's portrait selected by the owner for the homepage.
const members = [
  { name: 'Ruudy', image: '/images/team/ruudy.jpg' },
  { name: 'Daniel', image: danielPortrait.src },
];

export default function Tutors() {
  const { language } = useLanguage();
  const copy = brandCopy[language].tutors;
  return (
    <section
      id="tutors"
      className="sika-section"
      aria-labelledby="tutors-title"
    >
      <div className="sika-container">
        <div className="sika-tutor-grid">
          <div>
            <p className="sika-eyebrow">{copy.eyebrow}</p>
            <h2
              id="tutors-title"
              className="sika-display sika-section-title mt-4"
            >
              {copy.title}
            </h2>
            <p className="sika-lead mt-6">{copy.description}</p>
            <ul className="sika-teaching-principles mt-8">
              {copy.principles.map(principle => (
                <li key={principle.title}>
                  <h3>{principle.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed">
                    {principle.description}
                  </p>
                </li>
              ))}
            </ul>
            <Link href="/about" className="sika-text-link mt-6">
              {copy.link}
              <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div>
            <div className="sika-tutor-portraits">
              {members.map(member => (
                <TutorCard
                  key={member.name}
                  {...member}
                  role={copy.role}
                  quote={
                    member.name === 'Daniel'
                      ? {
                          title:
                            language === 'fr'
                              ? copy.adviceTitle
                              : 'Daniel’s advice · in French',
                          text: brandCopy.fr.tutors.advice,
                          language: 'fr',
                        }
                      : undefined
                  }
                />
              ))}
            </div>
          </div>
        </div>
        <aside className="sika-parent-note mt-10">
          <h3>{copy.parentTitle}</h3>
          <p className="leading-relaxed">{copy.parentDescription}</p>
        </aside>
      </div>
    </section>
  );
}
