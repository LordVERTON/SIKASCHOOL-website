import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Page introuvable | SIKASCHOOL',
  description:
    'Retrouvez les cours particuliers en ligne et l’accompagnement SIKASCHOOL.',
};

export default function ErrorPage() {
  return (
    <section className="sika-container pt-40 pb-24">
      <p className="sika-eyebrow">SIKASCHOOL · 404</p>
      <h1 className="sika-display sika-section-title mt-5">
        Cette page est introuvable.
      </h1>
      <p className="sika-lead mt-6">
        La page recherchée a peut-être été déplacée. Retrouvez nos cours et
        notre accompagnement depuis l’accueil.
      </p>
      <Link href="/" className="sika-button mt-8">
        Retour à l’accueil<span aria-hidden="true">↗</span>
      </Link>
    </section>
  );
}
