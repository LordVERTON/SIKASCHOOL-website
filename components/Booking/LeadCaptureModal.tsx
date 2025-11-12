"use client";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { setStorageItem, STORAGE_KEYS } from "@/lib/storage";

type LeadCaptureModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onPrefillEmail?: (email: string) => void;
};

const LEVELS = [
  "6ème","5ème","4ème","3ème","Seconde","Première","Terminale","Supérieur"
] as const;

const SUBJECTS = [
  "Mathématiques","Physiques","Sciences de l'ingénieur","Français","Histoire",
  "Géographie","Méthodologie","Chimie","Informatique","Biologie","Économie",
  "Gestion","Comptabilité","Préparation à un concours"
] as const;

const GOALS = [
  "Découvrir/approfondir",
  "Reprendre les bases",
  "Consolider une matière",
  "Gagner en méthodologie",
  "Rattraper une matière",
  "Autre"
] as const;

export default function LeadCaptureModal({ isOpen, onClose, onPrefillEmail }: LeadCaptureModalProps) {
  const [level, setLevel] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [civility, setCivility] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [phone, setPhone] = useState<string>("");
  const [zip, setZip] = useState<string>("");
  const [goal, setGoal] = useState<string>("");
  const [goalOther, setGoalOther] = useState<string>("");
  const [contest, setContest] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  const isValid = useMemo(() => {
    const base = level && subject && civility && lastName && firstName && /.+@.+\..+/.test(email) && phone.length >= 6 && zip.length >= 4;
    const contestOk = subject === "Préparation à un concours" ? contest.trim().length > 2 : true;
    const goalOk = goal === "Autre" ? goalOther.trim().length > 2 : true;
    return Boolean(base && contestOk && goalOk);
  }, [level, subject, civility, lastName, firstName, email, phone, zip, contest, goal, goalOther]);

  const sanitizeNameForPassword = (value: string) =>
    value
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "");

  const buildInitialPassword = (first: string, last: string) => {
    const safeFirst = sanitizeNameForPassword(first) || "eleve";
    const safeLast = sanitizeNameForPassword(last) || "sikaschool";
    return `${safeFirst}.${safeLast}12345`;
  };

  const handleSubmit = async () => {
    if (!isValid || submitting) return;
    setSubmitting(true);
    try {
      setStorageItem(STORAGE_KEYS.SELECTED_LEVEL, level);
      setStorageItem(STORAGE_KEYS.SELECTED_SUBJECT, subject);
      setStorageItem(
        STORAGE_KEYS.LEAD_FORM,
        JSON.stringify({ civility, lastName, firstName, email, phone, zip, goal, goalOther: goal === "Autre" ? goalOther : "", contest: subject === "Préparation à un concours" ? contest : "" })
      );

      // Call backend to create the student
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone,
          zip,
          level,
          subject,
          goal,
          goalOther,
          contest
        })
      });

      const data = await res.json();

      if (!res.ok || !data?.success) {
        throw new Error("lead_failed");
      }

      const displayedPassword =
        typeof data.initialPassword === "string" && data.initialPassword.trim().length > 0
          ? data.initialPassword.trim()
          : buildInitialPassword(firstName, lastName);

      setGeneratedPassword(displayedPassword);
      setSubmittedEmail(email);
      setStorageItem(STORAGE_KEYS.LAST_LEAD_EMAIL, email);
      onPrefillEmail?.(email);
      setError(null);
      // Show a simple inline confirmation state
      setShowThanks(true);
    } catch {
      setError("Une erreur est survenue. Merci de réessayer.");
    } finally {
      setSubmitting(false);
    }
  };

  const [showThanks, setShowThanks] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      <div className="relative w-full max-w-3xl rounded-lg bg-white p-6 shadow-2xl dark:bg-blacksection max-h-[80vh] overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
        {/* Close */}
        <button onClick={onClose} className="absolute right-4 top-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">
          <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
        {error && (
          <div className="mb-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        {showThanks ? (
          <div className="py-16 text-center">
            <h3 className="mb-3 text-2xl font-semibold text-black dark:text-white">Merci pour votre inscription</h3>
            <p className="mx-auto max-w-xl text-waterloo dark:text-manatee">
              Vous pouvez dès à présent vous connecter sur votre espace famille avec l&apos;adresse e-mail fournie et le mot de passe ci-dessous.
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
        <div className="grid gap-6 md:grid-cols-2">
          {/* Étape 1 */}
          <div className="rounded-lg bg-primary/10 p-6">
            <div className="mb-4 inline-block rounded bg-primary px-3 py-1 text-white text-sm font-semibold">ÉTAPE 1</div>
            <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">Sélectionnez la classe de l'élève</h3>
            <div className="grid grid-cols-2 gap-y-3">
              {LEVELS.map((lv) => (
                <label key={lv} className="flex items-center gap-3">
                  <input type="radio" name="level" value={lv} checked={level===lv} onChange={(e) => setLevel(e.target.value)} className="h-4 w-4 text-primary focus:ring-primary" />
                  <span className="text-black dark:text-white">{lv}</span>
                </label>
              ))}
            </div>

            <h3 className="mt-6 mb-2 text-xl font-semibold text-black dark:text-white">Matière</h3>
            <select value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full rounded-md border border-stroke px-3 py-2 dark:border-strokedark dark:bg-black">
              <option value="">Sélectionner une matière</option>
              {SUBJECTS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
            {subject === "Préparation à un concours" && (
              <input
                value={contest}
                onChange={(e) => setContest(e.target.value)}
                placeholder="Quel concours ? (ex: Passerelle, BCE, ingénieur, etc.)"
                className="mt-3 w-full rounded-md border border-stroke px-3 py-2 dark:border-strokedark dark:bg-black"
              />
            )}

            <h3 className="mt-6 mb-2 text-xl font-semibold text-black dark:text-white">Objectif</h3>
            <select value={goal} onChange={(e) => setGoal(e.target.value)} className="w-full rounded-md border border-stroke px-3 py-2 dark:border-strokedark dark:bg-black">
              <option value="">Sélectionner un objectif</option>
              {GOALS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
            {goal === "Autre" && (
              <input
                value={goalOther}
                onChange={(e) => setGoalOther(e.target.value)}
                placeholder="Préciser votre objectif"
                className="mt-3 w-full rounded-md border border-stroke px-3 py-2 dark:border-strokedark dark:bg-black"
              />
            )}
          </div>

          {/* Étape 2 */}
          <div className="rounded-lg bg-primary/10 p-6">
            <div className="mb-4 inline-block rounded bg-primary px-3 py-1 text-white text-sm font-semibold">ÉTAPE 2</div>
            <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">Vos coordonnées</h3>

            <div className="space-y-3">
              <select value={civility} onChange={(e) => setCivility(e.target.value)} className="w-full rounded-full bg-white px-4 py-2 text-black">
                <option value="">Sélectionner une civilité</option>
                <option value="Mme">Mme</option>
                <option value="M.">M.</option>
              </select>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Nom" className="w-full rounded-full bg-white px-4 py-2 text-black" />
              <input value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Prénom" className="w-full rounded-full bg-white px-4 py-2 text-black" />
              <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" type="email" className="w-full rounded-full bg-white px-4 py-2 text-black" />
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Téléphone" className="w-full rounded-full bg-white px-4 py-2 text-black" />
              <input value={zip} onChange={(e) => setZip(e.target.value)} placeholder="Code postal" className="w-full rounded-full bg-white px-4 py-2 text-black" />
            </div>

            <div className="mt-6 text-xs text-black/70">
              En soumettant ce formulaire, vous acceptez notre{" "}
              <Link
                href="/donnees-personnelles"
                className="text-primary underline hover:text-primaryho"
              >
                politique de protection des données
              </Link>
              .
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-center">
          <button disabled={!isValid || submitting} onClick={handleSubmit} className="rounded-full bg-primary px-10 py-3 text-white hover:bg-primaryho disabled:opacity-60">
            {submitting ? 'Envoi…' : 'Valider'}
          </button>
        </div>
        </>
        )}
      </div>
    </div>
  );
}


