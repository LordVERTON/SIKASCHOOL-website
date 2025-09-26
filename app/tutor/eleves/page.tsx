export default function TutorEleves() {
  const rows = [
    { id: "1", nom: "Marie Dupont", niveau: "Terminale", matiere: "Mathématiques", statut: "Actif", dernier: "15/09/2025" },
    { id: "2", nom: "Lucas Martin", niveau: "Première", matiere: "Physique", statut: "Actif", dernier: "12/09/2025" },
    { id: "3", nom: "Sofia Leroy", niveau: "Collège", matiere: "Français", statut: "En pause", dernier: "28/08/2025" },
  ];

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


