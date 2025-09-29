"use client";
import { useEffect, useMemo, useState } from 'react';

export default function TutorEleves() {
  const [rows, setRows] = useState<Array<{ id: string; nom: string; niveau: string; matiere: string; statut: string; dernier: string; avatar?: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [activeOnly, setActiveOnly] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeTabByStudent, setActiveTabByStudent] = useState<any>({});
  const [selectedMonthByStudent, setSelectedMonthByStudent] = useState<any>({});
  const monthOptions = useMemo(() => {
    const now = new Date();
    const arr: Array<{ value: string; label: string }> = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const label = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      arr.push({ value, label });
    }
    return arr;
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/tutor/students', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const mapped = (data.students || []).map((s: any) => ({
            id: s.id,
            nom: s.name,
            niveau: s.level,
            matiere: s.subject,
            statut: s.status,
            dernier: s.lastSessionAt ? new Date(s.lastSessionAt).toLocaleDateString('fr-FR') : '—',
            avatar: s.avatar_url || '/images/user/user-01.png'
          }));
          setRows(mapped);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
        <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
          <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">Mes élèves</h1>
          <div className="mt-10 animate-pulse h-40 rounded-lg border border-stroke dark:border-strokedark"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
      <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
        <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">Mes élèves</h1>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-waterloo dark:text-manatee">Élèves actifs ou récents seulement</div>
          <button onClick={() => setActiveOnly(v => !v)} className={`relative h-6 w-11 rounded-full transition ${activeOnly ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`} aria-pressed={activeOnly}>
            <span className={`absolute top-0.5 ${activeOnly ? 'right-0.5' : 'left-0.5'} h-5 w-5 rounded-full bg-white transition`}></span>
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {rows.map((r) => (
            <div key={r.id} className="rounded-lg border border-stroke bg-white p-5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4">
                  <img src={r.avatar || '/images/user/user-01.png'} alt={r.nom} className="h-12 w-12 rounded-full object-cover flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-black dark:text-white">{r.nom}</h3>
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">{r.niveau}</span>
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-gray-800 dark:text-blue-300">{r.matiere}</span>
                      <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-gray-800 dark:text-green-300">Dernier cours: {r.dernier}</span>
                    </div>
                    <div className="mt-1 text-xs text-waterloo dark:text-manatee">Statut: {r.statut}</div>
                  </div>
                </div>
                <div className="relative self-start sm:self-auto">
                  <details className="group">
                    <summary className="list-none cursor-pointer rounded-md border border-stroke px-3 py-1.5 text-sm text-black transition hover:opacity-90 dark:border-strokedark dark:text-white">Actions</summary>
                    <div className="absolute right-0 z-10 mt-2 w-56 rounded-md border border-stroke bg-white p-1 shadow-lg dark:border-strokedark dark:bg-blacksection">
                      <a href={`/tutor/eleves?declare=${encodeURIComponent(r.id)}`} className="block rounded px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Déclarer un cours</a>
                      <a href={`/tutor/eleves?end=${encodeURIComponent(r.id)}`} className="block rounded px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Signaler la fin des cours</a>
                    </div>
                  </details>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-4 border-b border-stroke pb-2 text-sm dark:border-strokedark overflow-x-auto">
                  <button onClick={() => setActiveTabByStudent((s: any) => ({ ...s, [r.id]: 'cours' }))} className={`${(activeTabByStudent[r.id] ?? 'cours') === 'cours' ? 'text-primary' : 'text-waterloo dark:text-manatee'}`}>Cours</button>
                  <button onClick={() => setActiveTabByStudent((s: any) => ({ ...s, [r.id]: 'suivi' }))} className={`${(activeTabByStudent[r.id] ?? 'cours') === 'suivi' ? 'text-primary' : 'text-waterloo dark:text-manatee'}`}>Suivis</button>
                  <button onClick={() => setActiveTabByStudent((s: any) => ({ ...s, [r.id]: 'coord' }))} className={`${(activeTabByStudent[r.id] ?? 'cours') === 'coord' ? 'text-primary' : 'text-waterloo dark:text-manatee'}`}>Coordonnées</button>
                </div>

                {(activeTabByStudent[r.id] ?? 'cours') === 'cours' && (
                  <div className="mt-3">
                    <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                      <select
                        value={selectedMonthByStudent[r.id] || monthOptions[0]?.value}
                        onChange={(e) => setSelectedMonthByStudent((s: any) => ({ ...s, [r.id]: e.target.value }))}
                        className="w-full rounded-md border border-stroke bg-transparent px-2 py-1 text-sm dark:border-strokedark sm:w-auto"
                      >
                        {monthOptions.map(m => (
                          <option key={m.value} value={m.value}>{m.label}</option>
                        ))}
                      </select>
                    </div>
                    <div className="rounded-md border border-stroke p-3 text-sm dark:border-strokedark">
                      Un cours déclaré pour un total de 2h00
                    </div>
                    <div className="mt-2 overflow-x-auto">
                      <table className="w-full text-left text-sm">
                        <thead>
                          <tr className="text-waterloo dark:text-manatee">
                            <th className="py-2 pr-4">Date déclaration</th>
                            <th className="py-2 pr-4">Cours</th>
                            <th className="py-2 pr-4">Heure</th>
                            <th className="py-2 pr-0">Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t border-stroke dark:border-strokedark">
                            <td className="py-2 pr-4">21/09/2025</td>
                            <td className="py-2 pr-4">Samedi 20/09/2025 – Durée : 2h00</td>
                            <td className="py-2 pr-4">2h00</td>
                            <td className="py-2 pr-0"><span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-gray-800 dark:text-green-300">Validé</span></td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                    <p className="mt-2 text-xs text-waterloo dark:text-manatee">Colonne Heure = Nombre d'heures comptabilisées en tenant compte de la gestion des 1/2 heures.</p>
                  </div>
                )}

                {(activeTabByStudent[r.id] ?? 'cours') === 'suivi' && (
                  <div className="mt-3 space-y-3 text-sm">
                    <div className="flex items-center justify-between"><span>21/09/2025</span><span>Suivi de cours</span></div>
                    <div className="flex items-center justify-between"><span>28/07/2025</span><span>Suivi de cours</span></div>
                  </div>
                )}

                {(activeTabByStudent[r.id] ?? 'cours') === 'coord' && (
                  <div className="mt-3 grid gap-6 md:grid-cols-2 text-sm">
                    <div>
                      <h4 className="mb-2 font-medium text-black dark:text-white">Famille</h4>
                      <p>10 RUE LOUIS ARAGON<br/>69120  VAULX EN VELIN</p>
                      <a className="mt-1 inline-block text-primary" href="#">Voir la carte</a>
                      <div className="mt-2">07 68 09 34 70 (Élève)<br/>06 15 15 53 50 (Mère)</div>
                    </div>
                    <div>
                      <h4 className="mb-2 font-medium text-black dark:text-white">Agence Anacours</h4>
                      <p>101 bd des Belges<br/>69006  Lyon</p>
                      <a className="mt-1 inline-block text-primary" href="#">Voir la carte</a>
                      <div className="mt-2">Sophie Navoizot<br/>04 72 75 49 49</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}


