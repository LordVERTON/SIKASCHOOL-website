"use client";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { setStorageItem, STORAGE_KEYS } from "@/lib/storage";
import {
  PHONE_COUNTRIES,
  findPhoneCountry,
  normalizeForSearch,
} from "@/lib/phone-countries";

type LeadCaptureModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onPrefillEmail?: (email: string) => void;
  initialEmail?: string;
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


export default function LeadCaptureModal({ isOpen, onClose, onPrefillEmail, initialEmail }: LeadCaptureModalProps) {
  const router = useRouter();
  const [level, setLevel] = useState<string>("");
  const [subject, setSubject] = useState<string>("");
  const [civility, setCivility] = useState<string>("");
  const [lastName, setLastName] = useState<string>("");
  const [firstName, setFirstName] = useState<string>("");
  const [email, setEmail] = useState<string>(initialEmail?.trim() ?? "");
  const [emailManuallyEdited, setEmailManuallyEdited] = useState<boolean>(false);
  const [phone, setPhone] = useState<string>("");
  const [phoneDialCountry, setPhoneDialCountry] = useState<string>("FR");
  const [zip, setZip] = useState<string>("");
  const [goal, setGoal] = useState<string>("");
  const [goalOther, setGoalOther] = useState<string>("");
  const [contest, setContest] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState<string | null>(null);

  // Keep the form email in sync with the hero/header email as long as the
  // user has not manually edited the field inside the modal itself.
  useEffect(() => {
    if (emailManuallyEdited) return;
    const trimmed = initialEmail?.trim() ?? "";
    setEmail((current) => (current === trimmed ? current : trimmed));
  }, [initialEmail, emailManuallyEdited]);

  // Reset the manual-edit flag whenever the modal is closed so the next
  // opening can be prefilled again from the hero/header email.
  useEffect(() => {
    if (!isOpen) setEmailManuallyEdited(false);
  }, [isOpen]);

  const selectedCountry = useMemo(
    () => findPhoneCountry(phoneDialCountry) ?? findPhoneCountry("FR")!,
    [phoneDialCountry]
  );
  const phoneDialCode = selectedCountry.dial;

  const fullPhone = useMemo(
    () => (phone ? `${phoneDialCode} ${phone}`.trim() : ""),
    [phoneDialCode, phone]
  );

  // --- Dropdown indicatif téléphonique (compact + recherche) -----------------
  const [dialPickerOpen, setDialPickerOpen] = useState(false);
  const [dialSearch, setDialSearch] = useState("");
  const dialPickerRef = useRef<HTMLDivElement | null>(null);
  const dialSearchInputRef = useRef<HTMLInputElement | null>(null);

  const filteredCountries = useMemo(() => {
    const q = normalizeForSearch(dialSearch.trim());
    if (!q) return PHONE_COUNTRIES;
    const digits = q.replace(/\D+/g, "");
    return PHONE_COUNTRIES.filter((option) => {
      if (normalizeForSearch(option.country).includes(q)) return true;
      if (option.code.toLowerCase().includes(q)) return true;
      if (digits && option.dial.replace(/\D+/g, "").includes(digits)) return true;
      return false;
    });
  }, [dialSearch]);

  // Fermeture au clic en dehors ou via la touche Echap.
  useEffect(() => {
    if (!dialPickerOpen) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!dialPickerRef.current) return;
      if (!dialPickerRef.current.contains(event.target as Node)) {
        setDialPickerOpen(false);
      }
    };
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDialPickerOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [dialPickerOpen]);

  // Focus automatique du champ de recherche à l'ouverture.
  useEffect(() => {
    if (dialPickerOpen) {
      setDialSearch("");
      requestAnimationFrame(() => dialSearchInputRef.current?.focus());
    }
  }, [dialPickerOpen]);

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
        JSON.stringify({
          civility,
          lastName,
          firstName,
          email,
          phone: fullPhone,
          phoneLocal: phone,
          phoneDialCode,
          phoneDialCountry,
          zip,
          goal,
          goalOther: goal === "Autre" ? goalOther : "",
          contest: subject === "Préparation à un concours" ? contest : ""
        })
      );

      // Call backend to create the student
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone: fullPhone,
          phoneDialCode,
          phoneDialCountry,
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

  const handleSigninRedirect = () => {
    if (submittedEmail?.trim()) {
      const normalized = submittedEmail.trim();
      // Double sécurité: query param + stockage local pour garantir le préremplissage.
      setStorageItem(STORAGE_KEYS.LAST_LEAD_EMAIL, normalized);
      onClose();
      router.push(`/auth/signin?email=${encodeURIComponent(normalized)}`);
      return;
    }
    onClose();
    router.push("/auth/signin");
  };

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
              Un e-mail de confirmation contenant vos informations de connexion vous a ete envoye.
              Verifiez votre boite de reception (et vos spams), puis confirmez votre adresse e-mail avant de vous connecter.
            </p>
            <p className="mx-auto mt-3 max-w-xl text-sm text-waterloo dark:text-manatee">
              Apres votre premiere connexion, pensez a changer votre mot de passe depuis votre espace.
            </p>
            <p className="mx-auto mt-4 max-w-xl text-xs text-waterloo dark:text-manatee">
              Si vous ne recevez rien sous quelques minutes, contactez-nous pour renvoyer l&apos;e-mail de confirmation.
            </p>
            <button
              type="button"
              onClick={handleSigninRedirect}
              className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-primaryho focus:outline-none focus-visible:ring-2 focus-visible:ring-primaryho focus-visible:ring-offset-2 dark:ring-offset-black"
            >
              Se connecter à mon espace
            </button>
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
              <input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailManuallyEdited(true);
                }}
                placeholder="E-mail"
                type="email"
                className="w-full rounded-full bg-white px-4 py-2 text-black"
              />
              <div className="flex w-full items-stretch gap-2">
                <div ref={dialPickerRef} className="relative shrink-0">
                  <button
                    type="button"
                    onClick={() => setDialPickerOpen((open) => !open)}
                    aria-haspopup="listbox"
                    aria-expanded={dialPickerOpen}
                    aria-label={`Indicatif téléphonique (${selectedCountry.country}, ${selectedCountry.dial})`}
                    title={`${selectedCountry.country} (${selectedCountry.dial})`}
                    className="flex h-full items-center gap-1 rounded-full bg-white pl-3 pr-2 py-2 text-black focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    <span className="text-base leading-none" aria-hidden="true">
                      {selectedCountry.flag}
                    </span>
                    <span className="whitespace-nowrap text-sm font-medium">
                      {selectedCountry.dial}
                    </span>
                    <span
                      aria-hidden="true"
                      className="text-xs text-black/60"
                    >
                      ▾
                    </span>
                  </button>

                  {dialPickerOpen && (
                    <div
                      role="dialog"
                      aria-label="Choisir un indicatif téléphonique"
                      className="absolute left-0 top-full z-[100] mt-2 flex w-[min(20rem,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white text-black shadow-2xl dark:border-white/10 dark:bg-blacksection dark:text-white"
                    >
                      <div className="shrink-0 border-b border-black/5 p-2 dark:border-white/10">
                        <input
                          ref={dialSearchInputRef}
                          value={dialSearch}
                          onChange={(e) => setDialSearch(e.target.value)}
                          placeholder="Rechercher un pays ou indicatif…"
                          aria-label="Rechercher un pays ou indicatif"
                          className="w-full rounded-full border border-black/10 bg-white px-3 py-1.5 text-sm text-black placeholder-black/40 focus:border-primary focus:outline-none dark:border-white/10 dark:bg-black/30 dark:text-white dark:placeholder-white/40"
                        />
                      </div>
                      <ul
                        role="listbox"
                        aria-activedescendant={`dial-option-${selectedCountry.code}`}
                        className="h-[min(20rem,55vh)] overflow-y-auto overscroll-contain py-1 [scrollbar-color:rgba(0,0,0,0.25)_transparent] [scrollbar-width:thin] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/20 hover:[&::-webkit-scrollbar-thumb]:bg-black/40 [&::-webkit-scrollbar-track]:bg-transparent"
                        onWheelCapture={(e) => e.stopPropagation()}
                        onTouchMoveCapture={(e) => e.stopPropagation()}
                      >
                        {filteredCountries.length === 0 ? (
                          <li className="px-3 py-2 text-sm text-black/50 dark:text-white/50">
                            Aucun résultat
                          </li>
                        ) : (
                          filteredCountries.map((option) => {
                            const isSelected = option.code === phoneDialCountry;
                            return (
                              <li key={option.code}>
                                <button
                                  type="button"
                                  id={`dial-option-${option.code}`}
                                  role="option"
                                  aria-selected={isSelected}
                                  onClick={() => {
                                    setPhoneDialCountry(option.code);
                                    setDialPickerOpen(false);
                                  }}
                                  className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm transition hover:bg-primary/10 ${
                                    isSelected
                                      ? "bg-primary/10 font-semibold text-primary"
                                      : "text-black dark:text-white"
                                  }`}
                                >
                                  <span className="text-base leading-none" aria-hidden="true">
                                    {option.flag}
                                  </span>
                                  <span className="flex-1 truncate">
                                    {option.country}
                                  </span>
                                  <span className="shrink-0 text-black/60 dark:text-white/60">
                                    {option.dial}
                                  </span>
                                </button>
                              </li>
                            );
                          })
                        )}
                      </ul>
                      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-5 bg-gradient-to-t from-white to-transparent dark:from-blacksection" />
                    </div>
                  )}
                </div>
                <div className="flex min-w-0 flex-1 items-center rounded-full bg-white px-4 text-black">
                  <span className="mr-2 select-none whitespace-nowrap text-black/70">
                    {phoneDialCode}
                  </span>
                  <input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D+/g, ""))}
                    onKeyDown={(e) => {
                      if (
                        e.key.length === 1 &&
                        !/[0-9]/.test(e.key) &&
                        !e.ctrlKey &&
                        !e.metaKey &&
                        !e.altKey
                      ) {
                        e.preventDefault();
                      }
                    }}
                    onPaste={(e) => {
                      const pasted = e.clipboardData.getData("text");
                      if (/\D/.test(pasted)) {
                        e.preventDefault();
                        setPhone((prev) => (prev + pasted).replace(/\D+/g, ""));
                      }
                    }}
                    placeholder="Numéro de téléphone"
                    type="tel"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete="tel-national"
                    maxLength={15}
                    className="w-full bg-transparent py-2 text-black focus:outline-none"
                  />
                </div>
              </div>
              <input
                value={zip}
                onChange={(e) => setZip(e.target.value.replace(/\D+/g, ""))}
                onKeyDown={(e) => {
                  if (
                    e.key.length === 1 &&
                    !/[0-9]/.test(e.key) &&
                    !e.ctrlKey &&
                    !e.metaKey &&
                    !e.altKey
                  ) {
                    e.preventDefault();
                  }
                }}
                onPaste={(e) => {
                  const pasted = e.clipboardData.getData("text");
                  if (/\D/.test(pasted)) {
                    e.preventDefault();
                    setZip((prev) => (prev + pasted).replace(/\D+/g, "").slice(0, 5));
                  }
                }}
                placeholder="Code postal"
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="postal-code"
                maxLength={5}
                className="w-full rounded-full bg-white px-4 py-2 text-black"
              />
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


