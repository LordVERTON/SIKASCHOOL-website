'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { brandCopy } from '@/lib/brand-copy';

// Existing public team identities; no inferred subjects, degrees or verification badges.
const members = [
  { name: 'Ruudy Mbouza-Bayonne', image: '/images/team/ruudy.jpg' },
  { name: 'Walid Lakas', image: '/images/team/walid.jpg' },
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
      <div className="sika-container sika-tutor-grid">
        <div>
          <p className="sika-eyebrow">{copy.eyebrow}</p>
          <h2
            id="tutors-title"
            className="sika-display sika-section-title mt-4"
          >
            {copy.title}
          </h2>
          <p className="sika-lead mt-6">{copy.description}</p>
          <div className="sika-quote mt-8">
            <p className="sika-eyebrow mb-3">{copy.adviceTitle}</p>
            <blockquote className="leading-relaxed">
              « {copy.advice} »
            </blockquote>
          </div>
          <Link href="/about" className="sika-text-link mt-6">
            {copy.link}
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div>
          <div className="sika-tutor-portraits">
            {members.map(member => (
              <figure key={member.name}>
                <Image
                  src={member.image}
                  alt={member.name}
                  width={480}
                  height={560}
                  sizes="(max-width: 900px) 44vw, 24vw"
                  className="aspect-[4/5] w-full rounded-t-[5rem] object-cover"
                />
                <figcaption className="mt-4">
                  <p className="font-bold">{member.name}</p>
                  <p className="text-sm">{copy.role}</p>
                </figcaption>
              </figure>
            ))}
          </div>
          <aside className="border-stroke dark:border-strokedark mt-8 border-t pt-6">
            <h3 className="text-lg font-bold">{copy.parentTitle}</h3>
            <p className="mt-3 leading-relaxed">{copy.parentDescription}</p>
          </aside>
        </div>
      </div>
    </section>
  );
}
