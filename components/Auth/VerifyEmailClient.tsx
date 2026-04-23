"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function VerifyEmailClient() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "ok" | "err">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const token = searchParams?.get("token") ?? null;
    if (!token) {
      setStatus("err");
      setMessage("Lien incomplet : aucun jeton de vérification.");
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await res.json().catch(() => ({}));
        if (cancelled) return;
        if (res.ok && data.success) {
          setStatus("ok");
          setMessage("Votre adresse e-mail est confirmée. Vous pouvez vous connecter.");
          return;
        }
        setStatus("err");
        setMessage(typeof data.error === "string" ? data.error : "La vérification a échoué.");
      } catch {
        if (!cancelled) {
          setStatus("err");
          setMessage("Erreur réseau. Réessayez dans un instant.");
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 dark:bg-zinc-950">
      <div className="w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">Confirmation e-mail</h1>
        <p className="mt-4 text-sm text-zinc-600 dark:text-zinc-300">
          {status === "loading" ? "Vérification en cours…" : message}
        </p>
        {status !== "loading" && (
          <div className="mt-6 flex flex-col gap-3">
            <Link
              href="/auth/signin"
              className="inline-flex justify-center rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              Aller à la connexion
            </Link>
            {status === "ok" && (
              <button
                type="button"
                onClick={() => router.push("/auth/signin")}
                className="text-sm text-zinc-500 underline-offset-2 hover:underline dark:text-zinc-400"
              >
                Fermer
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
