"use client";
import { useEffect, useState } from 'react';

export default function TutorEleves() {
  const [rows, setRows] = useState<Array<{ id: string; nom: string; niveau: string; matiere: string; statut: string; dernier: string }>>([]);
  const [loading, setLoading] = useState(true);

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
            dernier: s.lastSessionAt ? new Date(s.lastSessionAt).toLocaleDateString('fr-FR') : '—'
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

        <div className="mt-10 overflow-x-auto rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
          <table className="w-full text-left text-para2">
            <thead>
              <tr className="border-b border-stroke dark:border-strokedark text-waterloo dark:text-manatee">
                <th className="py-3 pr-6">Nom</th>
                <th className="py-3 pr-6">Niveau</th>
                <th className="py-3 pr-6">Matière</th>
                <th className="py-3 pr-6">Statut</th>
                <th className="py-3 pr-6">Dernier cours</th>
                <th className="py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b border-stroke last:border-0 dark:border-strokedark">
                  <td className="py-3 pr-6">{r.nom}</td>
                  <td className="py-3 pr-6">{r.niveau}</td>
                  <td className="py-3 pr-6">{r.matiere}</td>
                  <td className="py-3 pr-6">{r.statut}</td>
                  <td className="py-3 pr-6">{r.dernier}</td>
                  <td className="py-3">
                    <a
                      href={`/tutor/eleves?declare=${encodeURIComponent(r.id)}`}
                      className="rounded-md border border-stroke px-3 py-1.5 text-primary transition hover:opacity-90 dark:border-strokedark"
                      aria-label={`Déclarer une séance avec ${r.nom}`}
                    >
                      Déclarer une séance
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}


