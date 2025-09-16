import { Metadata } from "next";
import AboutPage from "@/components/AboutPage";

export const metadata: Metadata = {
  title: "Qui sommes nous - SikaSchool",
  description: "Découvrez notre équipe de passionnés de l'enseignement diplômés des plus grandes écoles françaises et internationales.",
};

export default function About() {
  return (
    <main>
      <AboutPage />
    </main>
  );
}
