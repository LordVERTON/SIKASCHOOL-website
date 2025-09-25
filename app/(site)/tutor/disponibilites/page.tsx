export default function TutorDisponibilites() {
  const slots = ["Matin", "Après-midi", "Soir"];
  const days = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return (
    <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
      <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
        <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">Disponibilités</h1>

        <div className="mt-10 overflow-x-auto rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
          <table className="w-full text-left text-para2">
            <thead>
              <tr className="border-b border-stroke dark:border-strokedark text-waterloo dark:text-manatee">
                <th className="py-3 pr-6">Jour</th>
                {slots.map((s) => (
                  <th key={s} className="py-3 pr-6">{s}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {days.map((d) => (
                <tr key={d} className="border-b border-stroke last:border-0 dark:border-strokedark">
                  <td className="py-3 pr-6">{d}</td>
                  {slots.map((s) => (
                    <td key={s} className="py-3 pr-6">
                      <button className="rounded-md border border-stroke px-3 py-1 text-waterloo transition hover:text-primary dark:border-strokedark dark:text-manatee dark:hover:text-primary">
                        Indiquer
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="mt-6 text-right">
            <button className="rounded-md border border-stroke px-4 py-1.5 font-medium text-primary transition hover:opacity-90 dark:border-strokedark">
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}


