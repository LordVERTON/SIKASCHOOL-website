import VerifyEmailClient from "@/components/Auth/VerifyEmailClient";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Confirmation de votre adresse e-mail | SikaSchool",
  description:
    "Page ouverte après le clic sur le lien reçu par e-mail : elle confirme votre adresse e-mail avant la première connexion à SikaSchool.",
};

export default function VerifyEmailPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
          Chargement…
        </div>
      }
    >
      <VerifyEmailClient />
    </Suspense>
  );
}
