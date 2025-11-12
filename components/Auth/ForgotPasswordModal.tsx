"use client";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { setStorageItem, STORAGE_KEYS } from "@/lib/storage";

type ForgotPasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
};

export default function ForgotPasswordModal({ isOpen, onClose, initialEmail = "" }: ForgotPasswordModalProps) {
  const [email, setEmail] = useState<string>(initialEmail);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  // Update email when initialEmail changes or modal opens
  useEffect(() => {
    if (isOpen && initialEmail) {
      setEmail(initialEmail);
    }
    if (!isOpen) {
      // Reset state when modal closes
      setError(null);
      setShowSuccess(false);
      setGeneratedPassword(null);
      setSubmittedEmail(null);
    }
  }, [isOpen, initialEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Une erreur est survenue");
      }

      if (data.initialPassword) {
        setGeneratedPassword(data.initialPassword);
        setSubmittedEmail(email.trim());
        setStorageItem(STORAGE_KEYS.LAST_LEAD_EMAIL, email.trim());
        setShowSuccess(true);
      } else {
        throw new Error("Réinitialisation échouée");
      }
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue. Merci de réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyPassword = useCallback(() => {
    if (!generatedPassword) return;
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(generatedPassword).catch(() => undefined);
    }
  }, [generatedPassword]);

  const signinHref = submittedEmail
    ? `/auth/signin?email=${encodeURIComponent(submittedEmail)}`
    : "/auth/signin";

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/50 p-4" onTouchMove={(e) => e.preventDefault()}>
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-2xl dark:bg-blacksection">
        {/* Close */}
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {showSuccess ? (
          <div className="py-8 text-center">
            <h3 className="mb-3 text-2xl font-semibold text-black dark:text-white">Mot de passe réinitialisé</h3>
            <p className="mx-auto max-w-xl text-waterloo dark:text-manatee">
              Votre mot de passe a été réinitialisé. Vous pouvez dès à présent vous connecter avec l&apos;adresse e-mail fournie et le mot de passe ci-dessous.
            </p>
            {generatedPassword && (
              <div className="mx-auto mt-6 w-fit rounded-lg border border-primary/30 bg-primary/5 px-6 py-4 text-left text-sm text-black dark:text-white">
                <div className="mb-2 flex items-center gap-3">
                  <p className="font-semibold text-primary">Mot de passe initial</p>
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-primary/30 text-primary transition hover:bg-primary hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primaryho focus-visible:ring-offset-2 dark:ring-offset-black"
                    title="Copier le mot de passe"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={1.5}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="h-4 w-4"
                    >
                      <path d="M8 8h8v12H8z" />
                      <path d="M16 4H6a2 2 0 0 0-2 2v12" />
                    </svg>
                  </button>
                </div>
                <p className="select-all font-mono text-base text-black dark:text-white">{generatedPassword}</p>
                <p className="mt-3 text-xs text-waterloo dark:text-manatee">
                  Pensez à le modifier depuis votre espace une fois connecté.
                </p>
              </div>
            )}
            <Link
              href={signinHref}
              onClick={onClose}
              className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-primaryho focus:outline-none focus-visible:ring-2 focus-visible:ring-primaryho focus-visible:ring-offset-2 dark:ring-offset-black"
            >
              Se connecter à mon espace
            </Link>
          </div>
        ) : (
          <>
            <h3 className="mb-4 text-2xl font-semibold text-black dark:text-white">Mot de passe oublié</h3>
            <p className="mb-6 text-waterloo dark:text-manatee">
              Entrez votre adresse e-mail et nous vous enverrons un nouveau mot de passe.
            </p>

            {error && (
              <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="block text-sm font-medium text-black dark:text-white mb-2">
                  Adresse e-mail
                </label>
                <input
                  id="forgot-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre@email.com"
                  required
                  className="w-full rounded-md border border-stroke px-4 py-3 dark:border-strokedark dark:bg-black focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 rounded-md border border-stroke px-4 py-3 text-black transition hover:opacity-90 dark:border-strokedark dark:text-white"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={submitting || !email.trim()}
                  className="flex-1 rounded-md bg-primary px-4 py-3 text-white transition hover:bg-primaryho disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? "Envoi..." : "Réinitialiser"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

