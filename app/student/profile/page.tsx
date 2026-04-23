"use client";

import { useEffect, useState } from "react";

interface StudentIntakeDetails {
  civility?: string;
  guardianFirstName?: string;
  guardianLastName?: string;
  email?: string;
  phone?: string;
  zip?: string;
  level?: string;
  subject?: string;
  goal?: string;
  goalOther?: string;
  goalSummary?: string;
  contest?: string;
  capturedAt?: string;
}

interface StudentProfileData {
  id: string;
  name: string;
  email: string;
  avatar: string;
  level: string;
  school: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  dateOfBirth?: string | null;
  joinDate: string;
  timezone: string;
  language: string;
  theme?: string;
  notifications?: { email: boolean; push: boolean; sms: boolean };
  academicGoals?: string;
  passwordUpdatedAt?: string | null;
  intake?: StudentIntakeDetails | null;
}

function getPasswordLastUpdateLabel(value?: string | null): string {
  if (!value) {
    return "Dernière modification inconnue";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Dernière modification inconnue";
  }
  const diffMs = Date.now() - date.getTime();
  const day = 24 * 60 * 60 * 1000;
  if (diffMs < day) {
    return "Dernière modification aujourd'hui";
  }
  const days = Math.floor(diffMs / day);
  if (days < 30) {
    return `Dernière modification il y a ${days} jour${days > 1 ? "s" : ""}`;
  }
  const months = Math.floor(days / 30);
  if (months < 12) {
    return `Dernière modification il y a ${months} mois`;
  }
  const years = Math.floor(months / 12);
  return `Dernière modification il y a ${years} an${years > 1 ? "s" : ""}`;
}

function getPasswordLastUpdateTooltip(value?: string | null): string {
  if (!value) {
    return "Date exacte indisponible";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Date exacte indisponible";
  }
  return `Dernière modification le ${date.toLocaleDateString("fr-FR")} à ${date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export default function StudentProfile() {
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [twoFactorPhoneMasked, setTwoFactorPhoneMasked] = useState<string | null>(null);
  const [twilioConfigured, setTwilioConfigured] = useState(true);
  const [showTwoFactorSetup, setShowTwoFactorSetup] = useState(false);
  const [twoFactorPhoneInput, setTwoFactorPhoneInput] = useState("");
  const [twoFactorCodeInput, setTwoFactorCodeInput] = useState("");
  const [twoFactorLoading, setTwoFactorLoading] = useState(false);
  const [twoFactorMessage, setTwoFactorMessage] = useState<string | null>(null);
  const [twoFactorError, setTwoFactorError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch('/api/student/profile', { credentials: 'include' });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Erreur ${res.status}`);
        }
        const data = await res.json();
        setProfile(data);
      } catch (e: any) {
        setError(e.message || 'Erreur de chargement du profil');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  useEffect(() => {
    const loadTwoFactor = async () => {
      try {
        const res = await fetch('/api/student/profile/2fa', { credentials: 'include' });
        if (!res.ok) return;
        const data = await res.json();
        setTwoFactorEnabled(Boolean(data.enabled));
        setTwoFactorPhoneMasked(typeof data.phoneMasked === 'string' ? data.phoneMasked : null);
        setTwilioConfigured(Boolean(data.twilioConfigured ?? true));
      } catch {
        // ignore
      }
    };
    loadTwoFactor();
  }, []);

  const handleTwoFactorSendCode = async () => {
    setTwoFactorError(null);
    setTwoFactorMessage(null);
    if (!twoFactorPhoneInput.trim()) {
      setTwoFactorError("Entrez un numéro au format international, ex: +33612345678");
      return;
    }
    setTwoFactorLoading(true);
    try {
      const res = await fetch('/api/student/profile/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'send_setup_code', phone: twoFactorPhoneInput }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setTwoFactorError(data?.error || 'Impossible d’envoyer le code SMS.');
        return;
      }
      setTwoFactorMessage(data?.message || 'Code SMS envoyé.');
    } catch {
      setTwoFactorError('Erreur réseau lors de l’envoi du code.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleTwoFactorVerify = async () => {
    setTwoFactorError(null);
    setTwoFactorMessage(null);
    if (!twoFactorCodeInput.trim()) {
      setTwoFactorError("Entrez le code reçu par SMS.");
      return;
    }
    setTwoFactorLoading(true);
    try {
      const res = await fetch('/api/student/profile/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          action: 'verify_setup_code',
          phone: twoFactorPhoneInput,
          code: twoFactorCodeInput,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setTwoFactorError(data?.error || 'Code invalide.');
        return;
      }
      setTwoFactorEnabled(true);
      setTwoFactorPhoneMasked(twoFactorPhoneInput);
      setTwoFactorMessage('2FA SMS activée avec succès.');
      setShowTwoFactorSetup(false);
      setTwoFactorCodeInput("");
    } catch {
      setTwoFactorError('Erreur réseau lors de la vérification.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleTwoFactorDisable = async () => {
    setTwoFactorError(null);
    setTwoFactorMessage(null);
    setTwoFactorLoading(true);
    try {
      const res = await fetch('/api/student/profile/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ action: 'disable' }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setTwoFactorError(data?.error || 'Impossible de désactiver la 2FA.');
        return;
      }
      setTwoFactorEnabled(false);
      setShowTwoFactorSetup(false);
      setTwoFactorCodeInput("");
      setTwoFactorMessage('2FA SMS désactivée.');
    } catch {
      setTwoFactorError('Erreur réseau lors de la désactivation.');
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handlePasswordUpdate = async () => {
    setPasswordMessage(null);
    setPasswordError(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("Tous les champs mot de passe sont requis.");
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError("Le nouveau mot de passe doit contenir au moins 8 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("La confirmation du mot de passe ne correspond pas.");
      return;
    }

    setPasswordLoading(true);
    try {
      const res = await fetch('/api/student/profile/password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPasswordError(data?.error || 'Échec de la mise à jour du mot de passe.');
        return;
      }

      setPasswordMessage('Mot de passe mis à jour avec succès.');
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch {
      setPasswordError('Erreur réseau lors de la mise à jour du mot de passe.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const preferences = [
    {
      id: "language",
      label: "Langue",
      value: profile?.language === 'en' ? 'English' : 'Français',
      options: ["Français", "English"]
    },
    {
      id: "timezone", 
      label: "Fuseau horaire",
      value: profile?.timezone || 'Europe/Paris',
      options: ["Europe/Paris", "Europe/London", "America/New_York"]
    },
    {
      id: "theme",
      label: "Thème",
      value: "Système",
      options: ["Clair", "Sombre", "Système"]
    }
  ];

  const notificationSettings = [
    {
      id: "email",
      label: "Notifications par email",
      description: "Recevoir des notifications par email",
      enabled: profile?.notifications?.email ?? true
    },
    {
      id: "push",
      label: "Notifications push",
      description: "Recevoir des notifications dans le navigateur",
      enabled: profile?.notifications?.push ?? true
    },
    {
      id: "sms",
      label: "Notifications SMS",
      description: "Recevoir des notifications par SMS",
      enabled: profile?.notifications?.sms ?? false
    }
  ];

  if (loading) {
    return (
      <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
        <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
          <div className="animate_top mx-auto text-center">
            <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">Chargement du profil…</h1>
          </div>
        </div>
      </main>
    );
  }

  if (error || !profile) {
    return (
      <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
        <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
          <div className="animate_top mx-auto text-center">
            <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">Mon profil</h1>
            <p className="mt-4 text-para2 text-waterloo dark:text-manatee">{error || "Profil indisponible"}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
      <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
        <div className="animate_top">
          <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">
            Mon profil
          </h1>
          <p className="mt-4 text-para2 text-waterloo dark:text-manatee">
            Gérez vos préférences et informations personnelles.
          </p>
        </div>

        <div className="mt-10 grid gap-7.5 lg:grid-cols-3">
          {/* Profile Info */}
          <div className="lg:col-span-1">
            <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
              <div className="text-center">
                {/* Avatar */}
                <div className="mx-auto w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-primary">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                
                <h2 className="text-xl font-semibold text-black dark:text-white mb-2">
                  {profile.name}
                </h2>
                <p className="text-waterloo dark:text-manatee mb-4">
                  {profile.email}
                </p>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-waterloo dark:text-manatee">Niveau:</span>
                    <span className="text-black dark:text-white">{profile.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-waterloo dark:text-manatee">Membre depuis:</span>
                    <span className="text-black dark:text-white">
                      {new Date(profile.joinDate).toLocaleDateString('fr-FR', { 
                        month: 'long', 
                        year: 'numeric' 
                      })}
                    </span>
                  </div>
                </div>
                
                <button className="mt-6 w-full rounded-md border border-stroke px-4 py-2 text-primary transition hover:opacity-90 dark:border-strokedark">
                  Modifier le profil
                </button>
              </div>
            </div>
          </div>

          {/* Settings */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {profile.intake && (
                <div className="animate_top rounded-lg border border-primary/20 bg-primary/5 p-7.5 shadow-solid-10 dark:border-primary/30 dark:bg-primary/10">
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-6">
                    Informations transmises lors de l'inscription
                  </h3>
                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-waterloo dark:text-manatee">Responsable légal</p>
                      <p className="mt-1 text-sm text-black dark:text-white">
                        {profile.intake.civility ? `${profile.intake.civility} ` : ''}
                        {[profile.intake.guardianFirstName, profile.intake.guardianLastName].filter(Boolean).join(' ') || 'Non communiqué'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-waterloo dark:text-manatee">Contact</p>
                      <p className="mt-1 text-sm text-black dark:text-white">
                        {profile.intake.email || profile.email}<br />
                        {profile.intake.phone || profile.phone || '—'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-waterloo dark:text-manatee">Niveau / Classe</p>
                      <p className="mt-1 text-sm text-black dark:text-white">{profile.intake.level || profile.level || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-waterloo dark:text-manatee">Code postal</p>
                      <p className="mt-1 text-sm text-black dark:text-white">{profile.intake.zip || profile.postalCode || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-waterloo dark:text-manatee">Matière principale</p>
                      <p className="mt-1 text-sm text-black dark:text-white">{profile.intake.subject || '—'}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-waterloo dark:text-manatee">Objectif</p>
                      <p className="mt-1 text-sm text-black dark:text-white">
                        {profile.intake.goalSummary || profile.intake.goalOther || profile.intake.goal || profile.academicGoals || '—'}
                      </p>
                      {profile.intake.contest && (
                        <p className="mt-1 text-xs text-waterloo dark:text-manatee">
                          Concours ciblé : {profile.intake.contest}
                        </p>
                      )}
                    </div>
                  </div>
                  {profile.academicGoals && (
                    <div className="mt-4 rounded-md border border-primary/10 bg-white/60 p-4 text-sm text-waterloo dark:border-primary/30 dark:bg-black/30 dark:text-manatee">
                      <span className="font-medium text-primary">Synthèse pédagogique :</span>{' '}
                      {profile.academicGoals}
                    </div>
                  )}
                </div>
              )}

              {/* Personal Information */}
              <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-6">
                  Informations personnelles
                </h3>
                
                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Nom complet
                    </label>
                    <input
                      type="text"
                      defaultValue={profile.name}
                      className="w-full p-3 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-blacksection"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      defaultValue={profile.email}
                      className="w-full p-3 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-blacksection"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Niveau scolaire
                    </label>
                    <select 
                      className="w-full p-3 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-blacksection"
                      defaultValue={profile.level === 'Terminale' ? 'terminale' : profile.level}
                    >
                      <option value="3eme">3ème</option>
                      <option value="2nde">2nde</option>
                      <option value="1ere">1ère</option>
                      <option value="terminale">Terminale</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      defaultValue={profile.phone || profile.intake?.phone || ''}
                      className="w-full p-3 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-blacksection"
                    />
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button
                    onClick={async () => {
                      if (!profile) return;
                      const payload = {
                        grade_level: profile.level,
                        school_name: profile.school,
                        phone: profile.phone,
                        theme: profile.theme,
                        notify_email: profile.notifications?.email,
                        notify_push: profile.notifications?.push,
                        notify_sms: profile.notifications?.sms,
                        timezone: profile.timezone,
                        language: profile.language,
                      } as any;
                      const res = await fetch('/api/student/profile', {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify(payload)
                      });
                      if (res.ok) {
                        const refreshed = await fetch('/api/student/profile', { credentials: 'include' });
                        if (refreshed.ok) {
                          const data = await refreshed.json();
                          setProfile(data);
                        }
                      } else {
                        console.error('Échec de la sauvegarde');
                      }
                    }}
                    className="rounded-md bg-primary px-6 py-2 font-medium text-white transition hover:opacity-90"
                  >
                    Sauvegarder
                  </button>
                </div>
              </div>

              {/* Preferences */}
              <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-6">
                  Préférences
                </h3>
                
                <div className="space-y-4">
                  {preferences.map((pref) => (
                    <div key={pref.id} className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-black dark:text-white">
                          {pref.label}
                        </label>
                        <p className="text-xs text-waterloo dark:text-manatee">
                          Valeur actuelle: {pref.value}
                        </p>
                      </div>
                      <select className="p-2 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-blacksection">
                        {pref.options.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              {/* Notifications */}
              <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-6">
                  Notifications
                </h3>
                
                <div className="space-y-4">
                  {notificationSettings.map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-black dark:text-white">
                          {setting.label}
                        </label>
                        <p className="text-xs text-waterloo dark:text-manatee">
                          {setting.description}
                        </p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          defaultChecked={setting.enabled}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Security */}
              <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-6">
                  Sécurité
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white">
                        Mot de passe
                      </label>
                      <p
                        className="text-xs text-waterloo dark:text-manatee"
                        title={getPasswordLastUpdateTooltip(profile.passwordUpdatedAt)}
                      >
                        {getPasswordLastUpdateLabel(profile.passwordUpdatedAt)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm((prev) => !prev);
                        setPasswordMessage(null);
                        setPasswordError(null);
                      }}
                      className="rounded-md border border-stroke px-4 py-2 text-primary transition hover:opacity-90 dark:border-strokedark"
                    >
                      Modifier
                    </button>
                  </div>
                  {showPasswordForm && (
                    <div className="rounded-lg border border-stroke p-4 dark:border-strokedark">
                      <div className="grid gap-3 md:grid-cols-3">
                        <div className="relative">
                          <input
                            type={showCurrentPassword ? "text" : "password"}
                            placeholder="Mot de passe actuel"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className="w-full rounded-lg border border-stroke p-3 pr-20 focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-blacksection"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCurrentPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary hover:underline"
                          >
                            {showCurrentPassword ? "Masquer" : "Afficher"}
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="Nouveau mot de passe"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="w-full rounded-lg border border-stroke p-3 pr-20 focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-blacksection"
                          />
                          <button
                            type="button"
                            onClick={() => setShowNewPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary hover:underline"
                          >
                            {showNewPassword ? "Masquer" : "Afficher"}
                          </button>
                        </div>
                        <div className="relative">
                          <input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirmer le mot de passe"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full rounded-lg border border-stroke p-3 pr-20 focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-blacksection"
                          />
                          <button
                            type="button"
                            onClick={() => setShowConfirmPassword((v) => !v)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-primary hover:underline"
                          >
                            {showConfirmPassword ? "Masquer" : "Afficher"}
                          </button>
                        </div>
                      </div>
                      {passwordError && (
                        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{passwordError}</p>
                      )}
                      {passwordMessage && (
                        <p className="mt-3 text-sm text-green-600 dark:text-green-400">{passwordMessage}</p>
                      )}
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={handlePasswordUpdate}
                          disabled={passwordLoading}
                          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                        >
                          {passwordLoading ? 'Mise à jour...' : 'Enregistrer'}
                        </button>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white">
                        Authentification à deux facteurs
                      </label>
                      <p className="text-xs text-waterloo dark:text-manatee">
                        {twoFactorEnabled
                          ? `Activee par SMS${twoFactorPhoneMasked ? ` (${twoFactorPhoneMasked})` : ''}`
                          : 'Ajoutez une couche de sécurité supplémentaire'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (twoFactorEnabled) {
                          void handleTwoFactorDisable();
                          return;
                        }
                        setShowTwoFactorSetup((prev) => !prev);
                        setTwoFactorError(null);
                        setTwoFactorMessage(null);
                      }}
                      className="rounded-md border border-stroke px-4 py-2 text-primary transition hover:opacity-90 dark:border-strokedark"
                    >
                      {twoFactorEnabled ? 'Desactiver' : 'Activer'}
                    </button>
                  </div>
                  {!twilioConfigured && (
                    <p className="text-xs text-red-600 dark:text-red-400">
                      Twilio n&apos;est pas configure sur le serveur. Ajoutez les variables d&apos;environnement requises.
                    </p>
                  )}
                  {!twoFactorEnabled && showTwoFactorSetup && (
                    <div className="rounded-lg border border-stroke p-4 dark:border-strokedark">
                      <div className="grid gap-3 md:grid-cols-3">
                        <input
                          type="tel"
                          placeholder="Numero (+336...)"
                          value={twoFactorPhoneInput}
                          onChange={(e) => setTwoFactorPhoneInput(e.target.value)}
                          className="w-full rounded-lg border border-stroke p-3 focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-blacksection"
                        />
                        <button
                          type="button"
                          onClick={handleTwoFactorSendCode}
                          disabled={twoFactorLoading}
                          className="rounded-md border border-stroke px-4 py-2 text-primary transition hover:opacity-90 disabled:opacity-60 dark:border-strokedark"
                        >
                          Envoyer code
                        </button>
                        <input
                          type="text"
                          inputMode="numeric"
                          placeholder="Code SMS"
                          value={twoFactorCodeInput}
                          onChange={(e) => setTwoFactorCodeInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          className="w-full rounded-lg border border-stroke p-3 focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-blacksection"
                        />
                      </div>
                      <div className="mt-3 flex justify-end">
                        <button
                          type="button"
                          onClick={handleTwoFactorVerify}
                          disabled={twoFactorLoading}
                          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                        >
                          Verifier et activer
                        </button>
                      </div>
                      {twoFactorError && (
                        <p className="mt-3 text-sm text-red-600 dark:text-red-400">{twoFactorError}</p>
                      )}
                      {twoFactorMessage && (
                        <p className="mt-3 text-sm text-green-600 dark:text-green-400">{twoFactorMessage}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Danger Zone */}
              <div className="animate_top rounded-lg border border-red-200 bg-red-50 p-7.5 dark:border-red-800 dark:bg-red-900/20">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-4">
                  Zone de danger
                </h3>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-red-800 dark:text-red-200">
                        Supprimer le compte
                      </label>
                      <p className="text-xs text-red-600 dark:text-red-300">
                        Cette action est irréversible
                      </p>
                    </div>
                    <button className="rounded-md border border-red-300 px-4 py-2 text-red-600 transition hover:opacity-90 dark:border-red-700 dark:text-red-400">
                      Supprimer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
