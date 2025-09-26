"use client";
// import Link from "next/link";
import { useEffect, useState } from "react";

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
}

export default function StudentProfile() {
  const [profile, setProfile] = useState<StudentProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
                    <select className="w-full p-3 border border-stroke rounded-lg focus:outline-none focus:ring-2 focus:ring-primary dark:border-strokedark dark:bg-blacksection">
                      <option value="3eme" selected={profile.level === '3eme'}>3ème</option>
                      <option value="2nde" selected={profile.level === '2nde'}>2nde</option>
                      <option value="1ere" selected={profile.level === '1ere'}>1ère</option>
                      <option value="terminale" selected={profile.level === 'terminale' || profile.level === 'Terminale'}>Terminale</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      defaultValue={profile.phone || ''}
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
                      <p className="text-xs text-waterloo dark:text-manatee">
                        Dernière modification il y a 3 mois
                      </p>
                    </div>
                    <button className="rounded-md border border-stroke px-4 py-2 text-primary transition hover:opacity-90 dark:border-strokedark">
                      Modifier
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-sm font-medium text-black dark:text-white">
                        Authentification à deux facteurs
                      </label>
                      <p className="text-xs text-waterloo dark:text-manatee">
                        Ajoutez une couche de sécurité supplémentaire
                      </p>
                    </div>
                    <button className="rounded-md border border-stroke px-4 py-2 text-primary transition hover:opacity-90 dark:border-strokedark">
                      Activer
                    </button>
                  </div>
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
