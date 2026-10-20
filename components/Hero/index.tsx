'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { useBooking } from '@/context/BookingContext';
import { TUTOR_SUBJECTS } from '@/lib/tutor-subjects';
import { brandCopy } from '@/lib/brand-copy';

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
          setSubjects(data.subjects);
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
        <p className="sika-eyebrow">{copy.hero.eyebrow}</p>
        <div className="sika-hero-grid">
          <div className="min-w-0">
            <h1 id="hero-title" className="sika-display sika-hero-title">
              {copy.hero.title}
              <br />
              <span className="sika-highlight">{copy.hero.accent}</span>
            </h1>
            <p className="sika-lead mt-7">{copy.hero.description}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button
                type="button"
                className="sika-button"
                onClick={() => openBooking({ subject: subject || undefined })}
              >
                {t.hero.reserveButton}
                <span aria-hidden="true">↗</span>
              </button>
              <Link href="/packs" className="sika-button sika-button-secondary">
                {t.hero.secondaryButton}
              </Link>
            </div>
            <p className="mt-4 text-sm">{copy.hero.reassurance}</p>
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
                priority
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
          <div className="flex min-w-0 flex-wrap items-end gap-3">
            <div className="min-w-0 flex-1">
              <label
                htmlFor="hero-subject"
                className="mb-2 block text-sm font-semibold"
              >
                {copy.hero.subjectLabel}
              </label>
              <select
                id="hero-subject"
                value={subject}
                onChange={event => setSubject(event.target.value)}
                className="sika-subject-select"
              >
                <option value="">{copy.hero.subjectPlaceholder}</option>
                {subjects.map(item => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="button"
              className="sika-button sika-button-blue"
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
