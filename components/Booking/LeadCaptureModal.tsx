"use client";
import { useMemo, useState } from "react";
import { setStorageItem, STORAGE_KEYS } from "@/lib/storage";

type LeadCaptureModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
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

export default function LeadCaptureModal({ isOpen, onClose, onSubmitted }: LeadCaptureModalProps) {
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

  const isValid = useMemo(() => {
    const base = level && subject && civility && lastName && firstName && /.+@.+\..+/.test(email) && phone.length >= 6 && zip.length >= 4;
    const contestOk = subject === "Préparation à un concours" ? contest.trim().length > 2 : true;
    const goalOk = goal === "Autre" ? goalOther.trim().length > 2 : true;
    return Boolean(base && contestOk && goalOk);
  }, [level, subject, civility, lastName, firstName, email, phone, zip, contest, goal, goalOther]);

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
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
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

      if (!res.ok) {
        throw new Error('lead_failed');
      }

      onSubmitted?.();
      // Show a simple inline confirmation state
      setShowThanks(true);
    } catch {
      setError('Une erreur est survenue. Merci de réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  const [showThanks, setShowThanks] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
            <p className="text-waterloo dark:text-manatee">Nous vous contacterons rapidement pour organiser une première séance d'essai.</p>
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
              En soumettant ce formulaire, vous acceptez notre politique de protection des données.
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


