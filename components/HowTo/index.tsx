'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { useBooking } from '@/context/BookingContext';
import { brandCopy } from '@/lib/brand-copy';
import Button from '@/components/Common/Button';
import Section, { Container } from '@/components/Common/Section';

const images = [
  '/images/wix/test.jpg',
  '/images/wix/choose.jpg',
  '/images/wix/progress3.png',
];

export default function HowTo() {
  const { language, t } = useLanguage();
  const openBooking = useBooking();
  const fr = language === 'fr';
  const copy = brandCopy[language].method;
  return (
    <Section className="pt-36!" aria-labelledby="how-to-title">
      <Container>
        <p className="sika-eyebrow">{t.nav.howItWorks}</p>
        <h1 id="how-to-title" className="sika-display sika-section-title mt-4">
          {copy.title}
        </h1>
        <p className="sika-lead mt-5">
          {fr
            ? 'Du premier échange aux cours réguliers, voici les étapes de votre accompagnement.'
            : 'From your first conversation to regular lessons, here is how your tutoring works.'}
        </p>
        <ol className="mt-12 space-y-16">
          {copy.steps.map((step, index) => (
            <li
              key={step.title}
              className="grid items-center gap-8 md:grid-cols-2"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                <Image
                  src={images[index]}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 90vw, 45vw"
                  className="object-cover"
                />
              </div>
              <div>
                <p className="sika-eyebrow" aria-hidden="true">
                  0{index + 1}
                </p>
                <h2 className="mt-4 text-2xl font-bold">{step.title}</h2>
                <p className="mt-4 leading-relaxed">{step.description}</p>
                {index === 0 && (
                  <Button className="mt-6" onClick={() => openBooking()}>
                    {t.hero.reserveButton}
                  </Button>
                )}
                {index === 1 && (
                  <div className="mt-6 flex flex-wrap gap-x-6">
                    <Link href="/packs" className="sika-text-link">
                      {t.nav.sessionPacks}
                    </Link>
                    <Link href="/book-online" className="sika-text-link">
                      {t.nav.perSession}
                    </Link>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ol>
      </Container>
    </Section>
  );
}
