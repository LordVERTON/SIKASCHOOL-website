'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import FAQItem from './FAQItem';
import type { FAQ as FAQType } from '@/types/faq';
import { useLanguage } from '@/context/LanguageContext';

function isFAQ(value: unknown): value is FAQType {
  if (!value || typeof value !== 'object') return false;
  const item = value as Partial<FAQType>;
  return (
    typeof item.id === 'number' &&
    typeof item.quest === 'string' &&
    Boolean(item.quest.trim()) &&
    typeof item.ans === 'string' &&
    Boolean(item.ans.trim())
  );
}

export default function FAQ() {
  const { t, language } = useLanguage();
  const fr = language === 'fr';
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [faqData, setFaqData] = useState<FAQType[]>([]);
  const [status, setStatus] = useState<'loading' | 'ready' | 'fallback'>(
    'loading'
  );
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    let mounted = true;
    async function load() {
      try {
        const response = await fetch('/api/faqs', {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error('FAQ unavailable');
        const data: unknown = await response.json();
        if (
          !Array.isArray(data) ||
          !data.length ||
          !data.every(isFAQ) ||
          new Set(data.map(item => item.id)).size !== data.length
        )
          throw new Error('Invalid FAQ');
        if (mounted) {
          setFaqData(data);
          setStatus('ready');
          setActiveFaq(null);
        }
      } catch {
        if (mounted) {
          setFaqData([]);
          setStatus('fallback');
        }
      } finally {
        clearTimeout(timeout);
      }
    }
    void load();
    return () => {
      mounted = false;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [attempt]);

  // No locale field in the current API: preserve its original French text and
  // explicitly announce it in EN. The existing local fallback has both locales.
  const contentLanguage = status === 'ready' ? 'fr' : language;
  const items =
    status === 'ready'
      ? faqData
      : t.faq.fallback.map((faq, index) => ({
          id: index + 1,
          quest: faq.question,
          ans: faq.answer,
        }));
  return (
    <section
      id="faq"
      className="sika-section sika-faq"
      aria-labelledby="faq-title"
    >
      <div className="sika-container sika-faq-grid">
        <div>
          <p className="sika-eyebrow">{t.faq.eyebrow}</p>
          <h2 id="faq-title" className="sika-display sika-section-title mt-4">
            {t.faq.title}
          </h2>
          <p className="sika-lead mt-5">
            {fr
              ? 'Le fonctionnement, les séances, l’accompagnement : les repères pour faire votre choix.'
              : 'How it works, lessons and support: the essentials to help you choose.'}
          </p>
          <Link href="/#contact" className="sika-text-link mt-5">
            {fr
              ? 'Parlons de vos questions'
              : 'Talk to us about your questions'}
            <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <div className="min-w-0">
          <div
            className="sika-faq-status text-sm"
            role="status"
            aria-live="polite"
          >
            {status === 'loading' &&
              (fr
                ? 'Actualisation des réponses… Les informations essentielles restent disponibles.'
                : 'Updating answers… Essential information remains available.')}
            {status === 'fallback' &&
              (fr
                ? 'Les réponses actualisées sont indisponibles. Voici les informations essentielles.'
                : 'Updated answers are unavailable. Here is the essential information.')}
            {status === 'ready' &&
              !fr &&
              'These answers are available in French and are shown in their original language.'}
          </div>
          {status === 'fallback' && (
            <button
              type="button"
              className="sika-text-link mb-3 text-sm"
              onClick={() => {
                setStatus('loading');
                setAttempt(current => current + 1);
              }}
            >
              {fr ? 'Réessayer' : 'Try again'}
              <span aria-hidden="true">↻</span>
            </button>
          )}
          <div
            className="sika-accordion"
            onKeyDown={event => {
              if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key))
                return;
              const triggers = [
                ...event.currentTarget.querySelectorAll<HTMLButtonElement>(
                  '[data-accordion-trigger]'
                ),
              ];
              const index = triggers.indexOf(event.target as HTMLButtonElement);
              if (index < 0) return;
              event.preventDefault();
              const next =
                event.key === 'Home'
                  ? 0
                  : event.key === 'End'
                    ? triggers.length - 1
                    : (index +
                        (event.key === 'ArrowDown' ? 1 : -1) +
                        triggers.length) %
                      triggers.length;
              triggers[next]?.focus();
            }}
          >
            {items.map(item => (
              <FAQItem
                key={`${contentLanguage}-${item.id}`}
                item={item}
                language={contentLanguage}
                open={activeFaq === item.id}
                onToggle={() =>
                  setActiveFaq(current =>
                    current === item.id ? null : item.id
                  )
                }
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
