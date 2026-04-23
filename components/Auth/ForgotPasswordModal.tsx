"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
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

      setSubmittedEmail(email.trim());
      setStorageItem(STORAGE_KEYS.LAST_LEAD_EMAIL, email.trim());
      setShowSuccess(true);
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue. Merci de réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

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
            <h3 className="mb-3 text-2xl font-semibold text-black dark:text-white">E-mail envoyé</h3>
            <p className="mx-auto max-w-xl text-waterloo dark:text-manatee">
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
            <h3 className="mb-4 text-2xl font-semibold text-black dark:text-white">Mot de passe oublié</h3>
            <p className="mb-6 text-waterloo dark:text-manatee">
              Entrez votre adresse e-mail et nous vous enverrons un lien de réinitialisation.
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
                  {submitting ? "Envoi..." : "Envoyer le lien"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

