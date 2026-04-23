"use client";

import { useEffect, useState } from "react";

interface TutorProfileData {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  dateOfBirth?: string | null;
  createdAt: string;
  timezone: string;
  language: string;
  bio: string;
  experienceYears: number;
  preferences?: { theme?: "light" | "dark" | "system" };
  notifications?: { email: boolean; push: boolean; sms: boolean };
  passwordUpdatedAt?: string | null;
}

function getPasswordLastUpdateLabel(value?: string | null): string {
  if (!value) return "Dernière modification inconnue";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Dernière modification inconnue";
  const diffMs = Date.now() - date.getTime();
  const day = 24 * 60 * 60 * 1000;
  if (diffMs < day) return "Dernière modification aujourd'hui";
  const days = Math.floor(diffMs / day);
  if (days < 30) return `Dernière modification il y a ${days} jour${days > 1 ? "s" : ""}`;
  const months = Math.floor(days / 30);
  if (months < 12) return `Dernière modification il y a ${months} mois`;
  const years = Math.floor(months / 12);
  return `Dernière modification il y a ${years} an${years > 1 ? "s" : ""}`;
}

function getPasswordLastUpdateTooltip(value?: string | null): string {
  if (!value) return "Date exacte indisponible";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Date exacte indisponible";
  return `Dernière modification le ${date.toLocaleDateString("fr-FR")} à ${date.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export default function TutorProfile() {
  const [profile, setProfile] = useState<TutorProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
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
  const [dangerConfirm, setDangerConfirm] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch("/api/tutor/profile", { credentials: "include", cache: "no-store" });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.error || `Erreur ${res.status}`);
        }
        setProfile(await res.json());
      } catch (e: any) {
        setError(e.message || "Erreur de chargement du profil");
      } finally {
        setLoading(false);
      }
    };
    void loadProfile();
  }, []);

  useEffect(() => {
    const loadTwoFactor = async () => {
      try {
        const res = await fetch("/api/tutor/profile/2fa", { credentials: "include" });
        if (!res.ok) return;
        const data = await res.json();
        setTwoFactorEnabled(Boolean(data.enabled));
        setTwoFactorPhoneMasked(typeof data.phoneMasked === "string" ? data.phoneMasked : null);
        setTwilioConfigured(Boolean(data.twilioConfigured ?? true));
      } catch {
        // ignore
      }
    };
    void loadTwoFactor();
  }, []);

  const handleSaveProfile = async () => {
    if (!profile) return;
    setSaveMessage(null);
    setError(null);
    setSaving(true);
    try {
      const payload = {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone || "",
        address: profile.address || "",
        city: profile.city || "",
        postalCode: profile.postalCode || "",
        country: profile.country || "",
        dateOfBirth: profile.dateOfBirth || null,
        timezone: profile.timezone,
        language: profile.language,
        bio: profile.bio,
        experienceYears: profile.experienceYears,
        preferences: profile.preferences,
        notifications: profile.notifications,
      };
      const res = await fetch("/api/tutor/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Échec de la sauvegarde");
      }
      setSaveMessage("Profil mis à jour avec succès.");
    } catch (e: any) {
      setError(e.message || "Erreur lors de la sauvegarde");
    } finally {
      setSaving(false);
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
      const res = await fetch("/api/tutor/profile/password", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setPasswordError(data?.error || "Échec de la mise à jour du mot de passe.");
        return;
      }
      setPasswordMessage("Mot de passe mis à jour avec succès.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
    } catch {
      setPasswordError("Erreur réseau lors de la mise à jour du mot de passe.");
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleTwoFactorSendCode = async () => {
    setTwoFactorError(null);
    setTwoFactorMessage(null);
    if (!twoFactorPhoneInput.trim()) {
      setTwoFactorError("Entrez un numéro au format international, ex: +33612345678");
      return;
    }
    setTwoFactorLoading(true);
    try {
      const res = await fetch("/api/tutor/profile/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "send_setup_code", phone: twoFactorPhoneInput }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setTwoFactorError(data?.error || "Impossible d’envoyer le code SMS.");
        return;
      }
      setTwoFactorMessage(data?.message || "Code SMS envoyé.");
    } catch {
      setTwoFactorError("Erreur réseau lors de l’envoi du code.");
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
      const res = await fetch("/api/tutor/profile/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: "verify_setup_code",
          phone: twoFactorPhoneInput,
          code: twoFactorCodeInput,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setTwoFactorError(data?.error || "Code invalide.");
        return;
      }
      setTwoFactorEnabled(true);
      setTwoFactorPhoneMasked(twoFactorPhoneInput);
      setTwoFactorMessage("2FA SMS activée avec succès.");
      setShowTwoFactorSetup(false);
      setTwoFactorCodeInput("");
    } catch {
      setTwoFactorError("Erreur réseau lors de la vérification.");
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleTwoFactorDisable = async () => {
    setTwoFactorError(null);
    setTwoFactorMessage(null);
    setTwoFactorLoading(true);
    try {
      const res = await fetch("/api/tutor/profile/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "disable" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setTwoFactorError(data?.error || "Impossible de désactiver la 2FA.");
        return;
      }
      setTwoFactorEnabled(false);
      setShowTwoFactorSetup(false);
      setTwoFactorCodeInput("");
      setTwoFactorMessage("2FA SMS désactivée.");
    } catch {
      setTwoFactorError("Erreur réseau lors de la désactivation.");
    } finally {
      setTwoFactorLoading(false);
    }
  };

  const handleDangerDeactivate = async () => {
    if (dangerConfirm.trim().toUpperCase() !== "SUPPRIMER") return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/tutor/profile", {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data?.error || "Impossible de désactiver le compte.");
      }
      window.location.href = "/auth/signin";
    } catch (e: any) {
      setError(e.message || "Erreur lors de la désactivation.");
    } finally {
      setDeleting(false);
    }
  };

  const preferences = [
    {
      id: "language",
      label: "Langue",
      value: profile?.language === "en" ? "English" : "Français",
      options: ["Français", "English"],
    },
    {
      id: "timezone",
      label: "Fuseau horaire",
      value: profile?.timezone || "Europe/Paris",
      options: ["Europe/Paris", "Europe/London", "America/New_York"],
    },
    {
      id: "theme",
      label: "Thème",
      value:
        profile?.preferences?.theme === "light"
          ? "Clair"
          : profile?.preferences?.theme === "dark"
            ? "Sombre"
            : "Système",
      options: ["Clair", "Sombre", "Système"],
    },
  ];

  const notificationSettings = [
    {
      id: "email",
      label: "Notifications par email",
      description: "Recevoir des notifications par email",
      enabled: profile?.notifications?.email ?? true,
    },
    {
      id: "push",
      label: "Notifications push",
      description: "Recevoir des notifications dans le navigateur",
      enabled: profile?.notifications?.push ?? true,
    },
    {
      id: "sms",
      label: "Notifications SMS",
      description: "Recevoir des notifications par SMS",
      enabled: profile?.notifications?.sms ?? false,
    },
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

  if (error && !profile) {
    return (
      <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
        <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
          <div className="animate_top mx-auto text-center">
            <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">Mon profil</h1>
            <p className="mt-4 text-para2 text-waterloo dark:text-manatee">{error}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!profile) return null;

  return (
    <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
      <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
        <div className="animate_top">
          <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">Mon profil</h1>
          <p className="mt-4 text-para2 text-waterloo dark:text-manatee">
            Gérez vos préférences et informations personnelles.
          </p>
        </div>

        {(error || saveMessage) && (
          <div className={`mt-4 rounded-md p-3 text-sm ${error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
            {error || saveMessage}
          </div>
        )}

        <div className="mt-10 grid gap-7.5 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
              <div className="text-center">
                <div className="mx-auto w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-primary">
                    {profile.fullName.split(" ").map((n) => n[0]).join("") || "T"}
                  </span>
                </div>

                <h2 className="text-xl font-semibold text-black dark:text-white mb-2">{profile.fullName}</h2>
                <p className="text-waterloo dark:text-manatee mb-4">{profile.email}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-waterloo dark:text-manatee">Rôle:</span>
                    <span className="text-black dark:text-white">Tuteur</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-waterloo dark:text-manatee">Membre depuis:</span>
                    <span className="text-black dark:text-white">
                      {new Date(profile.createdAt).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
                    </span>
                  </div>
                </div>

                <button className="mt-6 w-full rounded-md border border-stroke px-4 py-2 text-primary transition hover:opacity-90 dark:border-strokedark">
                  Modifier le profil
                </button>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-6">Informations personnelles</h3>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">Prénom</label>
                    <input
                      type="text"
                      value={profile.firstName}
                      onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                      className="w-full p-3 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-blacksection"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">Nom</label>
                    <input
                      type="text"
                      value={profile.lastName}
                      onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                      className="w-full p-3 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-blacksection"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">Email</label>
                    <input
                      type="email"
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full p-3 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-blacksection"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">Téléphone</label>
                    <input
                      type="tel"
                      value={profile.phone || ""}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full p-3 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-blacksection"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">Ville</label>
                    <input
                      type="text"
                      value={profile.city || ""}
                      onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                      className="w-full p-3 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-blacksection"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">Bio</label>
                    <textarea
                      rows={4}
                      value={profile.bio}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="w-full p-3 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-blacksection"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="rounded-md bg-primary px-6 py-2 font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                  >
                    {saving ? "Sauvegarde..." : "Sauvegarder"}
                  </button>
                </div>
              </div>

              <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-6">Préférences</h3>
                <div className="space-y-4">
                  {preferences.map((pref) => (
                    <div key={pref.id} className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-black dark:text-white">{pref.label}</label>
                        <p className="text-xs text-waterloo dark:text-manatee">Valeur actuelle: {pref.value}</p>
                      </div>
                      <select
                        className="p-2 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-blacksection"
                        value={pref.id === "language" ? (profile.language === "en" ? "English" : "Français") : pref.id === "timezone" ? profile.timezone : (profile.preferences?.theme === "light" ? "Clair" : profile.preferences?.theme === "dark" ? "Sombre" : "Système")}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (pref.id === "language") setProfile({ ...profile, language: value === "English" ? "en" : "fr" });
                          if (pref.id === "timezone") setProfile({ ...profile, timezone: value });
                          if (pref.id === "theme") {
                            const theme = value === "Clair" ? "light" : value === "Sombre" ? "dark" : "system";
                            setProfile({ ...profile, preferences: { ...profile.preferences, theme } });
                          }
                        }}
                      >
                        {pref.options.map((option) => (
                          <option key={option} value={option}>{option}</option>
                        ))}
                      </select>
                    </div>
                  ))}
                </div>
              </div>

              <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-6">Notifications</h3>
                <div className="space-y-4">
                  {notificationSettings.map((setting) => (
                    <div key={setting.id} className="flex items-center justify-between">
                      <div>
                        <label className="text-sm font-medium text-black dark:text-white">{setting.label}</label>
                        <p className="text-xs text-waterloo dark:text-manatee">{setting.description}</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean((profile.notifications as any)?.[setting.id])}
                          onChange={(e) =>
                            setProfile({
                              ...profile,
                              notifications: {
                                ...(profile.notifications || { email: true, push: true, sms: false }),
                                [setting.id]: e.target.checked,
                              },
                            })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 dark:peer-focus:ring-primary/20 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-6">Sécurité</h3>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white">Mot de passe</label>
                      <p className="text-xs text-waterloo dark:text-manatee" title={getPasswordLastUpdateTooltip(profile.passwordUpdatedAt)}>
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
                      {passwordError && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{passwordError}</p>}
                      {passwordMessage && <p className="mt-3 text-sm text-green-600 dark:text-green-400">{passwordMessage}</p>}
                      <div className="mt-4 flex justify-end">
                        <button
                          type="button"
                          onClick={handlePasswordUpdate}
                          disabled={passwordLoading}
                          className="rounded-md bg-primary px-5 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-60"
                        >
                          {passwordLoading ? "Mise à jour..." : "Enregistrer"}
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
                        Ajoutez une couche de sécurité supplémentaire
                      </p>
                      {twoFactorEnabled && (
                        <p className="text-xs text-waterloo dark:text-manatee mt-1">
                          Activée par SMS{twoFactorPhoneMasked ? ` (${twoFactorPhoneMasked})` : ""}
                        </p>
                      )}
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
                      {twoFactorEnabled ? "Desactiver" : "Activer"}
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
                          onChange={(e) => setTwoFactorCodeInput(e.target.value.replace(/\D/g, "").slice(0, 6))}
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
                      {twoFactorError && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{twoFactorError}</p>}
                      {twoFactorMessage && <p className="mt-3 text-sm text-green-600 dark:text-green-400">{twoFactorMessage}</p>}
                    </div>
                  )}
                </div>
              </div>

              <div className="animate_top rounded-lg border border-red-200 bg-red-50 p-7.5 dark:border-red-800 dark:bg-red-900/20">
                <h3 className="text-lg font-semibold text-red-800 dark:text-red-200 mb-4">Zone de danger</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-red-800 dark:text-red-200">Supprimer le compte</label>
                    <p className="text-xs text-red-600 dark:text-red-300">Cette action est irréversible</p>
                  </div>
                  <input
                    value={dangerConfirm}
                    onChange={(e) => setDangerConfirm(e.target.value)}
                    placeholder="Tapez SUPPRIMER"
                    className="w-full rounded-lg border border-red-300 px-3 py-2 text-sm"
                  />
                  <div className="flex justify-end">
                    <button
                      className="rounded-md border border-red-300 px-4 py-2 text-red-600 transition hover:opacity-90 disabled:opacity-50 dark:border-red-700 dark:text-red-400"
                      onClick={handleDangerDeactivate}
                      disabled={deleting || dangerConfirm.trim().toUpperCase() !== "SUPPRIMER"}
                    >
                      {deleting ? "Suppression..." : "Supprimer"}
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
