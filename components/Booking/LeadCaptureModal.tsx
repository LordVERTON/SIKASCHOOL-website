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
import { TUTOR_SUBJECTS } from "@/lib/tutor-subjects";

type LeadCaptureModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onPrefillEmail?: (email: string) => void;
  initialEmail?: string;
};

type FirstSessionSlot = {
  tutorId: string;
  tutorName: string;
  startedAt: string;
  duration: number;
};

const LEVELS = [
  "6ème","5ème","4ème","3ème","Seconde","Première","Terminale","Supérieur"
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
  const [accountType, setAccountType] = useState<"PARENT" | "STUDENT">("PARENT");
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
  const [firstSessionSlots, setFirstSessionSlots] = useState<FirstSessionSlot[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<FirstSessionSlot | null>(null);
  const [bookingSlot, setBookingSlot] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [subjectOptions, setSubjectOptions] = useState<string[]>([...TUTOR_SUBJECTS]);

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

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    async function loadSubjectOptions() {
      try {
        const response = await fetch("/api/tutor-subjects", {
          cache: "no-store",
        });
        const data = await response.json().catch(() => ({}));
        if (!response.ok || !Array.isArray(data.subjects) || data.subjects.length === 0) {
          return;
        }
        if (!cancelled) {
          setSubjectOptions(data.subjects);
        }
      } catch {
        // Keep the local fallback catalog if the API is unavailable.
      }
    }

    void loadSubjectOptions();

    return () => {
      cancelled = true;
    };
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
          accountType,
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
          civility,
          email,
          phone: fullPhone,
          phoneDialCode,
          phoneDialCountry,
          zip,
          accountType,
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
      setSelectedSlot(null);
      setBookingConfirmed(false);
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

  useEffect(() => {
    if (!showThanks || !subject) return;

    let cancelled = false;

    async function loadFirstSessionSlots() {
      setSlotsLoading(true);
      setSlotsError(null);
      try {
        const response = await fetch(`/api/leads/first-session-slots?subject=${encodeURIComponent(subject)}`, {
          cache: "no-store",
        });
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(data?.error || "slots_failed");
        }

        if (!cancelled) {
          setFirstSessionSlots(Array.isArray(data.slots) ? data.slots : []);
        }
      } catch {
        if (!cancelled) {
          setFirstSessionSlots([]);
          setSlotsError("Impossible de charger les créneaux pour le moment.");
        }
      } finally {
        if (!cancelled) setSlotsLoading(false);
      }
    }

    void loadFirstSessionSlots();

    return () => {
      cancelled = true;
    };
  }, [showThanks, subject]);

  const formatSlotDate = (startedAt: string) => {
    const date = new Date(startedAt);
    return date.toLocaleDateString("fr-FR", {
      weekday: "long",
      day: "numeric",
      month: "long",
    });
  };

  const formatSlotTime = (startedAt: string) => {
    const date = new Date(startedAt);
    return date.toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const groupedFirstSessionSlots = useMemo(() => {
    return firstSessionSlots.reduce<Record<string, FirstSessionSlot[]>>((acc, slot) => {
      const dayKey = new Date(slot.startedAt).toISOString().slice(0, 10);
      acc[dayKey] = acc[dayKey] || [];
      acc[dayKey].push(slot);
      return acc;
    }, {});
  }, [firstSessionSlots]);

  const handleConfirmFirstSession = async () => {
    if (!selectedSlot || !submittedEmail || bookingSlot) return;

    setBookingSlot(true);
    setSlotsError(null);
    try {
      const response = await fetch("/api/leads/first-session-slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: submittedEmail,
          subject,
          tutorId: selectedSlot.tutorId,
          startedAt: selectedSlot.startedAt,
        }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.success) {
        throw new Error(data?.error || "booking_failed");
      }

      setBookingConfirmed(true);
    } catch {
      setSlotsError("Ce créneau n’a pas pu être réservé. Merci d’en choisir un autre.");
    } finally {
      setBookingSlot(false);
    }
  };

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

  const isParentFlow = accountType === "PARENT";
  const levelTitle = isParentFlow
    ? "Sélectionnez la classe de votre enfant"
    : "Sélectionne ton niveau";
  const contactTitle = isParentFlow ? "Vos coordonnées" : "Mes coordonnées";
  const contactDescription = isParentFlow
    ? "Ces informations nous permettent de créer votre espace parent et de vous contacter pour la première séance."
    : "Ces informations nous permettent de créer votre espace élève et de préparer votre première séance.";

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
          <div className="py-8">
            <div className="text-center">
            <h3 className="mb-3 text-2xl font-semibold text-black dark:text-white">Merci pour votre inscription</h3>
            <p className="mx-auto max-w-xl text-waterloo dark:text-manatee">
              Votre compte est prêt. Choisissez maintenant votre première séance gratuite avec un tuteur disponible en {subject}.
            </p>
            </div>

            <div className="mt-8 rounded-lg border border-stroke bg-white p-5 text-left dark:border-strokedark dark:bg-black">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h4 className="text-lg font-semibold text-black dark:text-white">
                    Je choisis ma première séance gratuite
                  </h4>
                  <p className="mt-1 text-sm text-waterloo dark:text-manatee">
                    Les créneaux affichés proviennent des tuteurs disponibles qui enseignent cette matière.
                  </p>
                </div>
                <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                  1 heure
                </span>
              </div>

              {bookingConfirmed ? (
                <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                  Votre demande de première séance a bien été enregistrée. Le tuteur recevra une notification pour confirmer le créneau.
                </div>
              ) : (
                <>
                  {slotsLoading ? (
                    <div className="mt-6 grid gap-3 sm:grid-cols-2">
                      {[0, 1, 2, 3].map((item) => (
                        <div key={item} className="h-16 animate-pulse rounded-lg bg-primary/10" />
                      ))}
                    </div>
                  ) : firstSessionSlots.length > 0 ? (
                    <div className="mt-6 space-y-5">
                      {Object.entries(groupedFirstSessionSlots).map(([dateKey, slots]) => (
                        <div key={dateKey}>
                          <p className="mb-2 text-sm font-semibold capitalize text-black dark:text-white">
                            {formatSlotDate(slots[0].startedAt)}
                          </p>
                          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                            {slots.map((slot) => {
                              const isSelected =
                                selectedSlot?.tutorId === slot.tutorId &&
                                selectedSlot?.startedAt === slot.startedAt;

                              return (
                                <button
                                  key={`${slot.tutorId}-${slot.startedAt}`}
                                  type="button"
                                  onClick={() => setSelectedSlot(slot)}
                                  className={`rounded-lg border p-3 text-left text-sm transition ${
                                    isSelected
                                      ? "border-primary bg-primary text-white"
                                      : "border-stroke bg-white text-black hover:border-primary hover:bg-primary/5 dark:border-strokedark dark:bg-blacksection dark:text-white"
                                  }`}
                                >
                                  <span className="block font-semibold">{formatSlotTime(slot.startedAt)}</span>
                                  <span className={isSelected ? "text-white/85" : "text-waterloo dark:text-manatee"}>
                                    {slot.tutorName}
                                  </span>
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-sm text-yellow-900">
                      Aucun créneau disponible n’a été trouvé pour cette matière. Nous vous contacterons pour organiser la première séance.
                    </div>
                  )}

                  {slotsError && (
                    <div className="mt-4 rounded border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                      {slotsError}
                    </div>
                  )}

                  <div className="mt-6 flex justify-center">
                    <button
                      type="button"
                      disabled={!selectedSlot || bookingSlot}
                      onClick={handleConfirmFirstSession}
                      className="rounded-full bg-primary px-8 py-3 text-sm font-semibold text-white transition hover:bg-primaryho disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {bookingSlot ? "Réservation..." : "Confirmer ce créneau"}
                    </button>
                  </div>
                </>
              )}
            </div>

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
            <h3 className="mb-3 text-xl font-semibold text-black dark:text-white">Je suis</h3>
            <div className="mb-6 grid gap-3 sm:grid-cols-2">
              {[
                { value: "PARENT", label: "Un parent" },
                { value: "STUDENT", label: "Un élève" },
              ].map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition ${
                    accountType === option.value
                      ? "border-primary bg-white text-primary shadow-sm dark:bg-black"
                      : "border-stroke bg-white/60 text-waterloo hover:border-primary/40 dark:border-strokedark dark:bg-black/30 dark:text-manatee"
                  }`}
                >
                  <input
                    type="radio"
                    name="accountType"
                    value={option.value}
                    checked={accountType === option.value}
                    onChange={(e) => setAccountType(e.target.value as "PARENT" | "STUDENT")}
                    className="h-4 w-4 text-primary focus:ring-primary"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
            <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">{levelTitle}</h3>
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
              {subjectOptions.map((s) => (
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
            <h3 className="mb-4 text-xl font-semibold text-black dark:text-white">
              {contactTitle}
            </h3>
            <p className="mb-5 text-sm text-waterloo dark:text-manatee">
              {contactDescription}
            </p>

            <div className="space-y-3">
              <select value={civility} onChange={(e) => setCivility(e.target.value)} className="w-full rounded-full bg-white px-4 py-2 text-black">
                <option value="">Sélectionner une civilité</option>
                <option value="Mme">Mme</option>
                <option value="M.">M.</option>
              </select>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder={isParentFlow ? "Votre nom" : "Mon nom"}
                className="w-full rounded-full bg-white px-4 py-2 text-black"
              />
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder={isParentFlow ? "Votre prénom" : "Mon prénom"}
                className="w-full rounded-full bg-white px-4 py-2 text-black"
              />
              <input
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setEmailManuallyEdited(true);
                }}
                placeholder={isParentFlow ? "Votre e-mail" : "Mon e-mail"}
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
                    placeholder={isParentFlow ? "Votre numéro" : "Mon numéro"}
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


