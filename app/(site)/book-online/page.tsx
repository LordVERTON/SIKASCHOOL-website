import { Metadata } from "next";
import BookOnline from "@/components/BookOnline";

export const metadata: Metadata = {
  title: "Réserver à la séance - SikaSchool",
  description: "Choisissez votre séance à la carte selon votre niveau : Collège, Lycée ou Enseignement Supérieur.",
};

export default function BookOnlinePage() {
  return (
    <main>
      <BookOnline />
    </main>
  );
}
