'use client';

import { useLanguage } from '@/context/LanguageContext';
import { brandCopy } from '@/lib/brand-copy';
import { homepageTestimonials } from '@/lib/homepage-testimonials';

// Preserve the existing published words; omit stock avatars and numerical outcomes.
const reviews = homepageTestimonials.filter(review =>
  [1, 3, 4].includes(review.id)
);

export default function Testimonial() {
  const { language } = useLanguage();
  const copy = brandCopy[language].testimonials;
  return (
    <section
      id="reviews"
      className="sika-section bg-zumthor dark:bg-blacksection"
      aria-labelledby="reviews-title"
    >
      <div className="sika-container">
        <p className="sika-eyebrow">{copy.eyebrow}</p>
        <h2 id="reviews-title" className="sika-display sika-section-title mt-4">
          {copy.title}
        </h2>
        <div className="sika-reviews">
          {reviews.map(review => (
            <figure key={review.id}>
              <blockquote lang="fr">{review.content}</blockquote>
              <figcaption className="mt-6">
                <p className="font-bold">{review.name}</p>
                <p className="text-sm" lang="fr">
                  {review.role}
                </p>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="mt-10 max-w-3xl text-sm leading-relaxed">
          {copy.description}
        </p>
      </div>
    </section>
  );
}
