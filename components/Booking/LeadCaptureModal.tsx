'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import Dialog from '@/components/Common/Dialog';
import Button from '@/components/Common/Button';
import Field from '@/components/Common/Field';
import Alert from '@/components/Common/Alert';
import { setStorageItem, STORAGE_KEYS } from '@/lib/storage';
import { PHONE_COUNTRIES, findPhoneCountry } from '@/lib/phone-countries';
import { TUTOR_SUBJECTS } from '@/lib/tutor-subjects';

type LeadCaptureModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onPrefillEmail?: (email: string) => void;
  initialEmail?: string;
  initialSubject?: string;
  returnFocusRef?: { current: HTMLElement | null };
  campaign?: 'back_to_school';
};

type FirstSessionSlot = {
  tutorId: string;
  tutorName: string;
  startedAt: string;
  duration: number;
};
const LEVELS = [
  '6ème',
  '5ème',
  '4ème',
  '3ème',
  'Seconde',
  'Première',
  'Terminale',
  'Supérieur',
];
const GOALS = [
  'Découvrir/approfondir',
  'Reprendre les bases',
  'Consolider une matière',
  'Gagner en méthodologie',
  'Rattraper une matière',
  'Autre',
];
const GOALS_EN = [
  'Explore a subject',
  'Review the basics',
  'Consolidate a subject',
  'Improve study methods',
  'Catch up in a subject',
  'Other',
];

export default function LeadCaptureModal({
  isOpen,
  onClose,
  onPrefillEmail,
  initialEmail,
  initialSubject,
  returnFocusRef,
  campaign,
}: LeadCaptureModalProps) {
  const router = useRouter();
  const { language } = useLanguage();
  const fr = language === 'fr';
  const [step, setStep] = useState<'needs' | 'contact' | 'slots'>('needs');
  const [accountType, setAccountType] = useState<'PARENT' | 'STUDENT'>(
    'PARENT'
  );
  const [level, setLevel] = useState('');
  const [subject, setSubject] = useState('');
  const [goal, setGoal] = useState('');
  const [goalOther, setGoalOther] = useState('');
  const [contest, setContest] = useState('');
  const [civility, setCivility] = useState('');
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState(initialEmail?.trim() ?? '');
  const [phone, setPhone] = useState('');
  const [phoneDialCountry, setPhoneDialCountry] = useState('FR');
  const [zip, setZip] = useState('');
  const [subjectOptions, setSubjectOptions] = useState<string[]>([
    ...TUTOR_SUBJECTS,
  ]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [firstSessionSlots, setFirstSessionSlots] = useState<
    FirstSessionSlot[]
  >([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [slotsError, setSlotsError] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<FirstSessionSlot | null>(
    null
  );
  const [bookingSlot, setBookingSlot] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [slotsVersion, setSlotsVersion] = useState(0);
  const submittedEmail = useRef('');
  const submittingRef = useRef(false);
  const bookingRef = useRef(false);
  const appliedSubjectRef = useRef<string | undefined>(undefined);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const phoneDialCode = (
    findPhoneCountry(phoneDialCountry) ?? findPhoneCountry('FR')!
  ).dial;

  useEffect(() => {
    // Preserve edits when closing/reopening. A new subject can only change the needs step.
    if (
      isOpen &&
      initialSubject &&
      initialSubject !== appliedSubjectRef.current &&
      !submittedEmail.current
    ) {
      setSubject(initialSubject);
      appliedSubjectRef.current = initialSubject;
    }
  }, [isOpen, initialSubject]);
  useEffect(() => {
    if (initialEmail?.trim())
      setEmail(current => current || initialEmail.trim());
  }, [initialEmail]);
  useEffect(() => {
    if (!isOpen) return;
    const controller = new AbortController();
    void fetch('/api/tutor-subjects', {
      cache: 'no-store',
      signal: controller.signal,
    })
      .then(async response => (response.ok ? response.json() : null))
      .then(data => {
        if (
          !Array.isArray(data?.subjects) ||
          !data.subjects.length ||
          !data.subjects.every((item: unknown) => typeof item === 'string')
        )
          return;
        setSubjectOptions(data.subjects);
      })
      .catch(() => {
        /* The local catalog remains available. */
      });
    return () => controller.abort();
  }, [isOpen]);
  useEffect(() => {
    if (!isOpen) return;
    const frame = requestAnimationFrame(() => {
      headingRef.current?.focus({ preventScroll: true });
      headingRef.current?.closest('dialog')?.scrollTo(0, 0);
    });
    return () => cancelAnimationFrame(frame);
  }, [step, isOpen]);

  useEffect(() => {
    if (!isOpen || step !== 'slots' || bookingConfirmed) return;
    const controller = new AbortController();
    setSlotsLoading(true);
    setSlotsError(null);
    void (async () => {
      try {
        const response = await fetch(
          `/api/leads/first-session-slots?subject=${encodeURIComponent(subject)}`,
          { cache: 'no-store', signal: controller.signal }
        );
        const data = await response.json();
        if (!response.ok || !Array.isArray(data.slots))
          throw new Error('slots_failed');
        if (!controller.signal.aborted) {
          setFirstSessionSlots(data.slots);
          setSelectedSlot(
            current =>
              data.slots.find(
                (slot: FirstSessionSlot) =>
                  slot.tutorId === current?.tutorId &&
                  slot.startedAt === current?.startedAt
              ) ?? null
          );
        }
      } catch {
        if (!controller.signal.aborted) {
          setFirstSessionSlots([]);
          setSelectedSlot(null);
          setSlotsError(
            fr
              ? 'Impossible de charger les créneaux. Vous pouvez réessayer.'
              : 'Unable to load available times. Please try again.'
          );
        }
      } finally {
        if (!controller.signal.aborted) setSlotsLoading(false);
      }
    })();
    return () => controller.abort();
  }, [isOpen, step, subject, slotsVersion, bookingConfirmed, fr]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    if (step === 'needs') {
      if (!subjectOptions.includes(subject)) {
        setError(
          fr
            ? 'Choisissez une matière du catalogue.'
            : 'Choose a subject from the catalog.'
        );
        return;
      }
      setStep('contact');
      return;
    }
    if (submittingRef.current) return;
    if (!firstName.trim() || !lastName.trim()) {
      setError(
        fr
          ? 'Renseignez votre nom et votre prénom.'
          : 'Enter your first and last name.'
      );
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    const payload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      civility,
      email: email.trim(),
      phone: `${phoneDialCode} ${phone}`,
      phoneLocal: phone,
      phoneDialCode,
      phoneDialCountry,
      zip,
      accountType,
      level,
      subject,
      goal,
      goalOther: goal === 'Autre' ? goalOther : '',
      contest: subject === 'Préparation à un concours' ? contest : '',
      campaign,
    };
    try {
      setStorageItem(STORAGE_KEYS.SELECTED_LEVEL, level);
      setStorageItem(STORAGE_KEYS.SELECTED_SUBJECT, subject);
      setStorageItem(STORAGE_KEYS.LEAD_FORM, JSON.stringify(payload));
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok || !data?.success) throw new Error('lead_failed');
      submittedEmail.current = payload.email;
      setStorageItem(STORAGE_KEYS.LAST_LEAD_EMAIL, payload.email);
      onPrefillEmail?.(payload.email);
      setStep('slots');
    } catch {
      setError(
        fr
          ? 'L’envoi a échoué. Vos réponses sont conservées ; réessayez.'
          : 'Submission failed. Your answers are preserved; please try again.'
      );
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  const confirmSlot = async () => {
    if (!selectedSlot || !submittedEmail.current || bookingRef.current) return;
    bookingRef.current = true;
    setBookingSlot(true);
    setSlotsError(null);
    try {
      const response = await fetch('/api/leads/first-session-slots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: submittedEmail.current,
          subject,
          tutorId: selectedSlot.tutorId,
          startedAt: selectedSlot.startedAt,
          campaign,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data?.success) {
        if (response.status === 409) {
          setFirstSessionSlots(current =>
            current.filter(
              slot =>
                slot.tutorId !== selectedSlot.tutorId ||
                slot.startedAt !== selectedSlot.startedAt
            )
          );
          setSelectedSlot(null);
        }
        throw new Error('booking_failed');
      }
      setBookingConfirmed(true);
    } catch {
      setSlotsError(
        fr
          ? 'La demande n’a pas pu être enregistrée. Réessayez ou choisissez un autre créneau.'
          : 'Your request could not be saved. Try again or choose another time.'
      );
    } finally {
      bookingRef.current = false;
      setBookingSlot(false);
    }
  };

  const stepIndex = step === 'needs' ? 0 : step === 'contact' ? 1 : 2;
  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      labelledBy="lead-title"
      describedBy="lead-description"
      returnFocusRef={returnFocusRef}
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <p className="sika-eyebrow">
            {fr ? 'Première séance gratuite' : 'Free first session'}
          </p>
          <h2
            id="lead-title"
            ref={headingRef}
            tabIndex={-1}
            className="mt-3 text-2xl font-bold"
          >
            {step === 'needs'
              ? fr
                ? 'Vos besoins'
                : 'Your needs'
              : step === 'contact'
                ? fr
                  ? 'Vos coordonnées'
                  : 'Your contact details'
                : fr
                  ? 'Votre créneau'
                  : 'Your session time'}
          </h2>
        </div>
        <Button
          variant="secondary"
          onClick={onClose}
          aria-label={fr ? 'Fermer la réservation' : 'Close booking'}
          className="shrink-0 px-3!"
        >
          ×
        </Button>
      </div>
      <ol
        aria-label={fr ? 'Étapes de réservation' : 'Booking steps'}
        className="mb-6 grid grid-cols-3 gap-2 text-xs sm:text-sm"
      >
        {(fr
          ? ['Besoins', 'Coordonnées', 'Créneau']
          : ['Needs', 'Contact', 'Time']
        ).map((label, index) => (
          <li
            key={label}
            aria-current={index === stepIndex ? 'step' : undefined}
            className={`border-b-2 pb-3 ${index === stepIndex ? 'border-primary dark:border-brand-orange font-bold' : 'border-stroke dark:border-strokedark'}`}
          >
            {index + 1}. {label}
          </li>
        ))}
      </ol>
      <p id="lead-description" className="mb-6 text-sm leading-relaxed">
        {step === 'needs'
          ? fr
            ? 'Commençons par le niveau et la matière. Les champs marqués * sont obligatoires.'
            : 'Start with your level and subject. Fields marked * are required.'
          : step === 'contact'
            ? accountType === 'PARENT'
              ? fr
                ? 'Renseignez les coordonnées du parent. Les créneaux seront proposés après l’envoi.'
                : 'Enter the parent’s contact details. Available times will appear after submission.'
              : fr
                ? 'Renseignez vos coordonnées. Les créneaux seront proposés après l’envoi.'
                : 'Enter your contact details. Available times will appear after submission.'
            : fr
              ? 'Vos informations ont été reçues. Choisissez un créneau pour demander votre première séance. Votre inscription seule ne réserve pas de séance.'
              : 'Your details have been received. Choose a time to request your first session. Submitting your details alone does not book a session.'}
      </p>
      {error && <Alert className="mb-6">{error}</Alert>}
      {step !== 'slots' ? (
        <form onSubmit={handleSubmit} aria-busy={submitting}>
          <fieldset disabled={submitting} className="min-w-0 space-y-6">
            <legend className="sr-only">
              {step === 'needs'
                ? fr
                  ? 'Vos besoins'
                  : 'Your needs'
                : fr
                  ? 'Vos coordonnées'
                  : 'Contact details'}
            </legend>
            {step === 'needs' ? (
              <>
                <fieldset>
                  <legend className="mb-3 font-semibold">
                    {fr ? 'Je suis' : 'I am'}
                  </legend>
                  <div className="flex flex-wrap gap-6">
                    {(['PARENT', 'STUDENT'] as const).map(value => (
                      <label
                        key={value}
                        className="flex min-h-11 items-center gap-3"
                      >
                        <input
                          type="radio"
                          name="accountType"
                          value={value}
                          checked={accountType === value}
                          onChange={() => setAccountType(value)}
                        />
                        {value === 'PARENT'
                          ? fr
                            ? 'Un parent'
                            : 'A parent'
                          : fr
                            ? 'Un élève'
                            : 'A student'}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <fieldset>
                  <legend className="mb-3 font-semibold">
                    {accountType === 'PARENT'
                      ? fr
                        ? 'Classe de votre enfant *'
                        : 'Your child’s grade *'
                      : fr
                        ? 'Votre niveau *'
                        : 'Your grade *'}
                  </legend>
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                    {LEVELS.map(value => (
                      <label
                        key={value}
                        className="flex min-h-11 items-center gap-2 text-sm"
                      >
                        <input
                          type="radio"
                          required
                          name="level"
                          value={value}
                          checked={level === value}
                          onChange={() => setLevel(value)}
                        />
                        {value}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div>
                  <label
                    htmlFor="lead-subject"
                    className="mb-2 block font-semibold"
                  >
                    {fr ? 'Matière *' : 'Subject *'}
                  </label>
                  <select
                    id="lead-subject"
                    className="sika-field"
                    required
                    value={subject}
                    onChange={event => setSubject(event.target.value)}
                  >
                    <option value="">
                      {fr ? 'Sélectionner une matière' : 'Choose a subject'}
                    </option>
                    {subjectOptions.map(value => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </div>
                {subject === 'Préparation à un concours' && (
                  <Field
                    id="lead-contest"
                    required
                    minLength={3}
                    label={fr ? 'Concours préparé' : 'Entrance exam'}
                    value={contest}
                    onChange={event => setContest(event.target.value)}
                  />
                )}
                <div>
                  <label
                    htmlFor="lead-goal"
                    className="mb-2 block font-semibold"
                  >
                    {fr ? 'Objectif (facultatif)' : 'Goal (optional)'}
                  </label>
                  <select
                    id="lead-goal"
                    className="sika-field"
                    value={goal}
                    onChange={event => setGoal(event.target.value)}
                  >
                    <option value="">
                      {fr ? 'Sélectionner un objectif' : 'Choose a goal'}
                    </option>
                    {GOALS.map((value, index) => (
                      <option key={value} value={value}>
                        {fr ? value : GOALS_EN[index]}
                      </option>
                    ))}
                  </select>
                </div>
                {goal === 'Autre' && (
                  <Field
                    id="lead-goal-other"
                    required
                    minLength={3}
                    label={
                      fr ? 'Précisez votre objectif' : 'Describe your goal'
                    }
                    value={goalOther}
                    onChange={event => setGoalOther(event.target.value)}
                  />
                )}
              </>
            ) : (
              <>
                <p className="bg-primary/10 rounded-lg p-4 text-sm dark:bg-white/10">
                  {level} · {subject}
                </p>
                <div>
                  <label
                    htmlFor="lead-civility"
                    className="mb-2 block text-sm font-semibold"
                  >
                    {fr ? 'Civilité *' : 'Title *'}
                  </label>
                  <select
                    id="lead-civility"
                    required
                    className="sika-field"
                    value={civility}
                    onChange={event => setCivility(event.target.value)}
                  >
                    <option value="">
                      {fr ? 'Sélectionner une civilité' : 'Choose a title'}
                    </option>
                    <option value="Mme">{fr ? 'Mme' : 'Ms'}</option>
                    <option value="M.">{fr ? 'M.' : 'Mr'}</option>
                  </select>
                </div>
                <div className="grid gap-6 sm:grid-cols-2">
                  <Field
                    id="lead-last-name"
                    label={fr ? 'Nom' : 'Last name'}
                    required
                    autoComplete="family-name"
                    value={lastName}
                    onChange={event => setLastName(event.target.value)}
                  />
                  <Field
                    id="lead-first-name"
                    label={fr ? 'Prénom' : 'First name'}
                    required
                    autoComplete="given-name"
                    value={firstName}
                    onChange={event => setFirstName(event.target.value)}
                  />
                </div>
                <Field
                  id="lead-email"
                  label={fr ? 'Adresse e-mail' : 'Email address'}
                  required
                  type="email"
                  autoComplete="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                />
                <div>
                  <label
                    htmlFor="lead-phone-country"
                    className="mb-2 block text-sm font-semibold"
                  >
                    {fr
                      ? 'Pays et indicatif téléphonique'
                      : 'Country and calling code'}
                  </label>
                  <select
                    id="lead-phone-country"
                    className="sika-field"
                    value={phoneDialCountry}
                    onChange={event => setPhoneDialCountry(event.target.value)}
                  >
                    {PHONE_COUNTRIES.map(country => (
                      <option key={country.code} value={country.code}>
                        {country.country} ({country.dial})
                      </option>
                    ))}
                  </select>
                </div>
                <Field
                  id="lead-phone"
                  label={fr ? 'Numéro de téléphone' : 'Phone number'}
                  hint={
                    fr
                      ? `Indicatif ${phoneDialCode} sélectionné. Saisissez le numéro national.`
                      : `Calling code ${phoneDialCode} selected. Enter the national number.`
                  }
                  required
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel-national"
                  minLength={6}
                  maxLength={15}
                  pattern="[0-9]{6,15}"
                  value={phone}
                  onChange={event =>
                    setPhone(event.target.value.replace(/[^0-9]/g, ''))
                  }
                />
                <Field
                  id="lead-zip"
                  label={fr ? 'Code postal' : 'Postal code'}
                  required
                  inputMode="numeric"
                  autoComplete="postal-code"
                  minLength={4}
                  maxLength={5}
                  pattern="[0-9]{4,5}"
                  value={zip}
                  onChange={event =>
                    setZip(event.target.value.replace(/[^0-9]/g, ''))
                  }
                />
                <p className="text-sm leading-relaxed">
                  {fr ? 'Consultez notre ' : 'Read our '}
                  <Link
                    href="/donnees-personnelles"
                    target="_blank"
                    className="underline"
                  >
                    {fr
                      ? 'politique de protection des données (nouvel onglet)'
                      : 'privacy policy (new tab)'}
                  </Link>
                  .
                </p>
              </>
            )}
          </fieldset>
          <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            {step === 'contact' && (
              <Button
                variant="secondary"
                disabled={submitting}
                onClick={() => {
                  setError(null);
                  setStep('needs');
                }}
              >
                {fr ? 'Retour aux besoins' : 'Back to needs'}
              </Button>
            )}
            <Button
              type="submit"
              loading={submitting}
              loadingLabel={fr ? 'Envoi…' : 'Sending…'}
            >
              {step === 'needs'
                ? fr
                  ? 'Continuer'
                  : 'Continue'
                : fr
                  ? 'Envoyer et voir les créneaux'
                  : 'Submit and view available times'}
            </Button>
          </div>
        </form>
      ) : (
        <div>
          {bookingConfirmed ? (
            <Alert tone="success">
              {fr
                ? 'Votre demande de première séance est enregistrée. Le tuteur doit encore confirmer le créneau.'
                : 'Your first-session request has been saved. The tutor still needs to confirm the time.'}
            </Alert>
          ) : (
            <>
              {slotsLoading ? (
                <p role="status" className="py-8">
                  {fr ? 'Chargement des créneaux…' : 'Loading available times…'}
                </p>
              ) : slotsError &&
                firstSessionSlots.length ===
                  0 ? null : firstSessionSlots.length === 0 ? (
                <Alert tone="info">
                  {fr
                    ? 'Aucun créneau proposé pour le moment. Aucune séance n’est réservée. Vous pouvez actualiser les créneaux ou contacter notre équipe.'
                    : 'No times are available yet. No session has been booked. Refresh available times or contact our team.'}
                </Alert>
              ) : (
                <fieldset disabled={bookingSlot}>
                  <legend className="mb-4 font-semibold">
                    {fr
                      ? 'Choisissez un créneau (heure locale de votre appareil)'
                      : 'Choose a time (your device’s local time)'}
                  </legend>
                  <div className="grid gap-3 sm:grid-cols-2">
                    {firstSessionSlots.map(slot => (
                      <label
                        key={`${slot.tutorId}-${slot.startedAt}`}
                        className="border-stroke dark:border-strokedark flex items-start gap-3 rounded-lg border p-4"
                      >
                        <input
                          type="radio"
                          name="first-session-slot"
                          className="mt-1"
                          checked={
                            selectedSlot?.tutorId === slot.tutorId &&
                            selectedSlot?.startedAt === slot.startedAt
                          }
                          onChange={() => setSelectedSlot(slot)}
                        />
                        <span className="text-sm">
                          <span className="block font-semibold">
                            {new Date(slot.startedAt).toLocaleString(
                              fr ? 'fr-FR' : 'en-GB',
                              {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                hour: '2-digit',
                                minute: '2-digit',
                              }
                            )}
                          </span>
                          {slot.tutorName} · {slot.duration} min
                        </span>
                      </label>
                    ))}
                  </div>
                </fieldset>
              )}
              {slotsError && <Alert className="mt-4">{slotsError}</Alert>}
              <div className="mt-6 flex flex-wrap gap-4">
                <Button
                  disabled={!selectedSlot || slotsLoading}
                  loading={bookingSlot}
                  loadingLabel={fr ? 'Réservation…' : 'Booking…'}
                  onClick={() => void confirmSlot()}
                >
                  {fr ? 'Demander ce créneau' : 'Request this time'}
                </Button>
                <Button
                  variant="secondary"
                  disabled={slotsLoading || bookingSlot}
                  onClick={() => setSlotsVersion(current => current + 1)}
                >
                  {fr ? 'Actualiser les créneaux' : 'Refresh available times'}
                </Button>
              </div>
              <a
                className="sika-text-link mt-4"
                href="mailto:sikaschoolservice@gmail.com"
              >
                {fr ? 'Contacter l’équipe' : 'Contact our team'}
              </a>
            </>
          )}
          <div className="mt-8">
            <Button
              variant="secondary"
              onClick={() => {
                onClose();
                router.push(
                  `/auth/signin?email=${encodeURIComponent(submittedEmail.current)}`
                );
              }}
            >
              {fr ? 'Se connecter à mon espace' : 'Sign in to my account'}
            </Button>
          </div>
        </div>
      )}
    </Dialog>
  );
}
