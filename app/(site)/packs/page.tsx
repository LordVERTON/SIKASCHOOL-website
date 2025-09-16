import { Metadata } from "next";
import Packs from "@/components/Packs";

export const metadata: Metadata = {
  title: "Packs de séances - SikaSchool",
  description: "Choisissez votre formule de soutien scolaire. Carnets de séances sans engagement pour tous les niveaux.",
};

export default function PacksPage() {
  return (
    <main>
      <Packs />
    </main>
  );
}
