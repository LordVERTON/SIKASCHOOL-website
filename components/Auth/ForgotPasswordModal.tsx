"use client";
import Link from "next/link";
import { useEffect, useId, useState } from "react";
import Dialog from '@/components/Common/Dialog';
import Alert from '@/components/Common/Alert';
import { setStorageItem, STORAGE_KEYS } from "@/lib/storage";

type ForgotPasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
  initialEmail?: string;
};

export default function ForgotPasswordModal({ isOpen, onClose, initialEmail = "" }: ForgotPasswordModalProps) {
  const titleId = useId();
  const [email, setEmail] = useState<string>(initialEmail);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
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
      setSubmittedEmail(null);
    }
  }, [isOpen, initialEmail]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalizedEmail = email.trim();
    if (!normalizedEmail || submitting) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: normalizedEmail }),
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error(data?.error || "Une erreur est survenue");
      }

      setSubmittedEmail(normalizedEmail);
      setStorageItem(STORAGE_KEYS.LAST_LEAD_EMAIL, normalizedEmail);
      setShowSuccess(true);
    } catch {
      setError("Le lien n’a pas pu être envoyé. Réessayez dans quelques instants.");
    } finally {
      setSubmitting(false);
    }
  };

  const signinHref = submittedEmail
    ? `/auth/signin?email=${encodeURIComponent(submittedEmail)}`
    : "/auth/signin";

  if (!isOpen) return null;

  return (
    <Dialog isOpen={isOpen} onClose={onClose} labelledBy={titleId} className="sika-dialog-compact">
      <div className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-2xl dark:bg-blacksection">
        {/* Close */}
        <button type="button" aria-label="Fermer" onClick={onClose} className="absolute right-2 top-2 flex h-11 w-11 items-center justify-center text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <svg aria-hidden="true" className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {showSuccess ? (
          <div className="py-8 text-center">
            <h2 id={titleId} className="mb-3 text-2xl font-semibold text-black dark:text-white">Vérifiez votre messagerie</h2>
            <p role="status" className="mx-auto max-w-xl text-waterloo dark:text-manatee">
              Si cette adresse existe, vous recevrez un lien de réinitialisation dans quelques instants. Vérifiez aussi le dossier spam/indésirables.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3">
              <Link
                href={signinHref}
                onClick={onClose}
                className="inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-primaryho focus:outline-none focus-visible:ring-2 focus-visible:ring-primaryho focus-visible:ring-offset-2 dark:ring-offset-black"
              >
                Retour à la connexion
              </Link>
              <button
                type="button"
                onClick={() => {
                  setShowSuccess(false);
                  setError(null);
                }}
                className="text-sm text-waterloo hover:text-primary dark:text-manatee"
              >
                Renvoyer un lien
              </button>
            </div>
          </div>
        ) : (
          <>
            <h2 id={titleId} className="mb-4 pr-8 text-2xl font-semibold text-black dark:text-white">Mot de passe oublié</h2>
            <p className="mb-6 text-waterloo dark:text-manatee">
              Entrez votre adresse e-mail et nous vous enverrons un lien de réinitialisation.
            </p>

            {error && (
              <Alert className="mb-4">
                {error}
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4" aria-busy={submitting}>
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
                  {submitting ? "Envoi..." : "Envoyer le lien"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </Dialog>
  );
}

