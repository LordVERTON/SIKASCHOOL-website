import { Metadata } from "next";
import HowTo from "@/components/HowTo";

export const metadata: Metadata = {
  title: "Comment ça marche - SikaSchool",
  description: "Découvrez comment SikaSchool vous offre une expérience de cours en ligne simple et qualitative en quelques clics.",
};

export default function HowToPage() {
  return (
    <main>
      <HowTo />
    </main>
  );
}
