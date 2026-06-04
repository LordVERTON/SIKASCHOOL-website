"use client";

import { useEffect, useState } from 'react';

export default function TutorDisponibilites() {
  const [isAvailable, setIsAvailable] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let mounted = true;

    async function loadAvailability() {
      try {
        const response = await fetch('/api/tutor/profile', {
          credentials: 'include',
          cache: 'no-store',
        });
        if (!response.ok) return;
        const data = await response.json();
        if (mounted && typeof data.profile?.isAvailable === 'boolean') {
          setIsAvailable(data.profile.isAvailable);
        }
      } catch {
        // Keep the local default if the profile cannot be loaded.
      }
    }

    void loadAvailability();

    return () => {
      mounted = false;
    };
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/tutor/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isAvailable }),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
      <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
        <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">
          Mes disponibilités
        </h1>

        <div className="mt-4 flex flex-col gap-4 rounded-lg border border-stroke bg-white p-5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-para2 text-waterloo dark:text-manatee">
              Votre statut est visible par les élèves assignés. La planification détaillée se fait depuis les calendriers élève et tuteur.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAvailable((value) => !value)}
              className={`relative h-6 w-11 rounded-full transition ${isAvailable ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
              aria-pressed={isAvailable}
              aria-label="Changer le statut de disponibilité"
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${isAvailable ? 'right-0.5' : 'left-0.5'}`}
              />
            </button>
            <span className="text-sm font-medium text-black dark:text-white">
              {isAvailable ? 'Disponible' : 'Indisponible'}
            </span>
          </div>
        </div>

        <div className="mt-6 text-right">
          <button
            onClick={handleSave}
            className="rounded-md bg-primary px-4 py-2 font-medium text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={saving}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </main>
  );
}
