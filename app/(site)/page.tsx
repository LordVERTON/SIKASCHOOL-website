import { Metadata } from "next";
import Hero from "@/components/Hero";
import About from "@/components/About";
import FunFact from "@/components/FunFact";
import Pricing from "@/components/Pricing";
import Contact from "@/components/Contact";
import Testimonial from "@/components/Testimonial";

export const metadata: Metadata = {
  title: "SikaSchool - Cours particuliers et accompagnement scolaire",
  description:
    "Comprendre, Progresser, Réussir. Professeurs certifiés et étudiants des meilleures écoles. Séance d'essai gratuite.",
};

export default function Home() {
  return (
    <main>
      <Hero />
      <div id="about">
        <About />
      </div>
      <div id="how-it-works">
        <FunFact />
      </div>
      <Testimonial />
      <div id="pricing">
        <Pricing />
      </div>
      <div id="contact">
        <Contact />
      </div>
    </main>
  );
}
