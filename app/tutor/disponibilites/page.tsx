"use client";
import { useEffect, useState, useMemo } from 'react';

export default function TutorDisponibilites() {
  const hours = useMemo(() => [
    'Matin', '13h-14h', '14h-15h', '15h-16h', '16h-17h', '17h-18h', '18h-19h', '19h-20h'
  ], []);
  const days = useMemo(() => ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'], []);

  const [isAvailable, setIsAvailable] = useState(true);
  const [grid, setGrid] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);

  // Example: seed with weekends checked like the reference image
  useEffect(() => {
    const initial: Record<string, boolean> = {};
    for (const h of hours) {
      for (const d of days) {
        const key = `${h}|${d}`;
        initial[key] = (d === 'sam.' || d === 'dim.');
      }
    }
    setGrid(initial);
  }, [days, hours]);

  const toggle = (h: string, d: string) => {
    const key = `${h}|${d}`;
    setGrid((g) => ({ ...g, [key]: !g[key] }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch('/api/tutor/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ isAvailable, slots: grid }),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
      <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
        <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">Mes disponibilités</h1>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-para2 text-waterloo dark:text-manatee">
            La dernière mise à jour de vos disponibilités date du {new Date().toLocaleDateString('fr-FR')}. Leur mise à jour régulière nous permet de vous proposer des élèves en adéquation avec votre emploi du temps.
          </div>
          <button
            onClick={handleSave}
            className="rounded-md bg-[#6c63ff] px-4 py-2 text-white shadow hover:opacity-90"
            disabled={saving}
          >
            ✓ Mettre à jour
          </button>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            onClick={() => setIsAvailable((v) => !v)}
            className={`relative h-6 w-11 rounded-full transition ${isAvailable ? 'bg-green-500' : 'bg-gray-300 dark:bg-gray-600'}`}
            aria-pressed={isAvailable}
          >
            <span className={`absolute top-0.5 ${isAvailable ? 'right-0.5' : 'left-0.5'} h-5 w-5 rounded-full bg-white transition`}></span>
          </button>
          <span className="text-sm font-medium text-black dark:text-white">Je suis disponible</span>
        </div>

        <h2 className="mt-6 text-lg font-semibold text-black dark:text-white">Mes disponibilités journalières</h2>

        <div className="mt-4 overflow-x-auto rounded-lg border border-stroke bg-white p-5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
          <table className="min-w-[700px] w-full text-left text-para2">
            <thead>
              <tr className="border-b border-stroke text-waterloo dark:border-strokedark dark:text-manatee">
                <th className="py-3 pr-6">Horaire</th>
                {days.map((d) => (
                  <th key={d} className="py-3 pr-6">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {hours.map((h) => (
                <tr key={h} className="border-b border-stroke last:border-0 dark:border-strokedark">
                  <td className="py-3 pr-6">{h}</td>
                  {days.map((d) => (
                    <td key={d} className="py-3 pr-6">
                      <input
                        type="checkbox"
                        className="h-4 w-4 accent-[#6c63ff]"
                        checked={!!grid[`${h}|${d}`]}
                        onChange={() => toggle(h, d)}
                        aria-label={`${h} ${d}`}
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-6 text-right">
            <button
              onClick={handleSave}
              className="rounded-md border border-stroke px-4 py-1.5 font-medium text-primary transition hover:opacity-90 dark:border-strokedark"
              disabled={saving}
            >
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}


