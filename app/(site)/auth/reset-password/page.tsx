import type { Metadata } from "next";
import { Suspense } from "react";
import ResetPasswordClient from "@/components/Auth/ResetPasswordClient";

export const metadata: Metadata = {
  title: "Réinitialiser le mot de passe - SikaSchool",
  description: "Choisissez un nouveau mot de passe pour votre compte SikaSchool.",
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
          Chargement…
        </div>
      }
    >
      <ResetPasswordClient />
    </Suspense>
  );
}
