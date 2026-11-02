'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useBooking } from '@/context/BookingContext';
import { TUTOR_SUBJECTS } from '@/lib/tutor-subjects';
import { brandCopy } from '@/lib/brand-copy';
import SubjectPicker from './SubjectPicker';

export default function Hero() {
  const { language, t } = useLanguage();
  const copy = brandCopy[language];
  const openBooking = useBooking();
  const [subjects, setSubjects] = useState<string[]>([...TUTOR_SUBJECTS]);
  const [subject, setSubject] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    async function loadSubjects() {
      try {
        const response = await fetch('/api/tutor-subjects', {
          signal: controller.signal,
        });
        if (!response.ok) return;
        const data: { subjects?: unknown } = await response.json();
        if (
          Array.isArray(data.subjects) &&
          data.subjects.length &&
          data.subjects.every(item => typeof item === 'string' && item.trim())
        ) {
          const available = [...new Set(data.subjects as string[])];
          setSubjects(available);
          setSubject(current => (available.includes(current) ? current : ''));
        }
      } catch {
        // The shared booking catalog remains usable when offline.
      }
    }
    void loadSubjects();
    return () => controller.abort();
  }, []);

  return (
    <section className="sika-hero" aria-labelledby="hero-title">
      <div className="sika-container">
        <div className="sika-hero-grid">
          <div className="min-w-0">
            <p className="sika-eyebrow sika-hero-eyebrow">
              {copy.hero.eyebrow}
            </p>
            <h1 id="hero-title" className="sika-display sika-hero-title">
              {copy.hero.title}
              <br />
              <span className="sika-highlight">{copy.hero.accent}</span>
            </h1>
            <p className="sika-hero-levels">{copy.hero.levels}</p>
            <p className="sika-lead mt-4">{copy.hero.description}</p>
            <div className="sika-hero-actions mt-7 flex flex-wrap gap-3">
              <button
                type="button"
                className="sika-button"
                onClick={() => openBooking({ subject: subject || undefined })}
              >
                {t.hero.reserveButton}
                <span aria-hidden="true">↗</span>
              </button>
              <Link
                href="/#pricing"
                className="sika-button sika-button-secondary"
              >
                {t.hero.secondaryButton}
              </Link>
            </div>
            <p className="sika-hero-reassurance mt-4 text-sm">
              <span aria-hidden="true">✓</span> {copy.hero.reassurance}
            </p>
          </div>
          <figure className="sika-hero-visual">
            <div className="sika-hero-note" aria-hidden="true">
              {copy.hero.note} <span>↴</span>
            </div>
            <div className="sika-hero-photo">
              <Image
                src="/images/wix/test.jpg"
                alt={copy.hero.imageAlt}
                fill
                preload
                sizes="(max-width: 900px) 90vw, 42vw"
                className="object-cover object-[65%_center]"
              />
            </div>
            <figcaption className="sika-hero-caption">
              <span className="sika-caption-symbol" aria-hidden="true">
                ↗
              </span>
              <div>
                <strong>{copy.hero.caption}</strong>
                <p className="mt-1 text-sm">{copy.hero.captionDetail}</p>
              </div>
            </figcaption>
          </figure>
        </div>
        <div className="sika-subject-bar">
          <div>
            <p className="sika-eyebrow">{copy.hero.subjectPrompt}</p>
            <p className="mt-1 text-sm">{copy.hero.subjectHelp}</p>
          </div>
          <div className="min-w-0">
            <SubjectPicker
              subjects={subjects}
              value={subject}
              onChange={setSubject}
              copy={copy.hero}
            />
            <button
              type="button"
              className="sika-text-link mt-4"
              data-subject-booking
              onClick={() => openBooking({ subject: subject || undefined })}
            >
              {copy.hero.subjectCta}
              <span aria-hidden="true">↗</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
