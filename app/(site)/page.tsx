import { Metadata } from 'next';
import Hero from '@/components/Hero';
import Pricing from '@/components/Pricing';
import Contact from '@/components/Contact';
import Testimonial from '@/components/Testimonial';
import FAQ from '@/components/FAQ';
import Method from '@/components/Homepage/Method';
import Identity from '@/components/Homepage/Identity';
import Tutors from '@/components/Homepage/Tutors';
import CTA from '@/components/CTA';

export const metadata: Metadata = {
  title: 'SikaSchool - Cours particuliers et accompagnement scolaire',
  description:
    'Cours particuliers en ligne du collège au supérieur. Comprendre vos cours, travailler votre méthode et progresser avec un tuteur. Première séance gratuite.',
};

export default function Home() {
  return (
    <>
      <Hero />
      <Testimonial />
      <Method />
      <Identity />
      <Tutors />
      <div id="pricing">
        <Pricing />
      </div>
      <FAQ />
      <div id="contact">
        <Contact />
      </div>
      <CTA />
    </>
  );
}
