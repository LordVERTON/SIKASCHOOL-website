import React from 'react';
import Contact from '@/components/Contact';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact et accompagnement | SIKASCHOOL',

  // other metadata
  description:
    'Contactez SIKASCHOOL pour vos questions sur les cours particuliers en ligne et votre accompagnement.',
};

const SupportPage = () => {
  return (
    <div className="pt-40 pb-20">
      <div className="sika-container">
        <h1 className="sika-display sika-section-title">
          Parlons de votre accompagnement.
        </h1>
      </div>
      <Contact />
    </div>
  );
};

export default SupportPage;
