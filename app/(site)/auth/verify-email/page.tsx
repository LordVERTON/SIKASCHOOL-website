import VerifyEmailClient from "@/components/Auth/VerifyEmailClient";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Confirmer l'e-mail - SikaSchool",
  description: "Confirmez votre adresse e-mail pour votre compte SikaSchool",
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
