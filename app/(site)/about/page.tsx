import { Metadata } from 'next';
import AboutPage from '@/components/AboutPage';

export const metadata: Metadata = {
  title: 'Qui sommes nous - SikaSchool',
  description:
    'Découvrez l’équipe SIKASCHOOL et son approche pédagogique : écoute, compréhension et accompagnement personnalisé en ligne.',
};

export default function About() {
  return (
    <>
      <AboutPage />
    </>
  );
}
