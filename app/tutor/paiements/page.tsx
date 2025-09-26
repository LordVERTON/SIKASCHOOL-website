export default function TutorPaiements() {
  const transactions = [
    { date: "05/09/2025", desc: "Cours - Lucas (Physique)", montant: "+45€", statut: "Payé" },
    { date: "01/09/2025", desc: "Virement mensuel", montant: "+320€", statut: "Envoyé" },
    { date: "28/08/2025", desc: "Cours - Marie (Maths)", montant: "+45€", statut: "Payé" },
  ];

  return (
    <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
      <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
        <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">Paiements</h1>

        <div className="mt-10 grid gap-7.5 md:grid-cols-3">
          <div className="rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
            <div className="text-waterloo dark:text-manatee">Solde</div>
            <div className="text-2xl font-semibold text-black dark:text-white">320€</div>
          </div>
          <div className="rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
            <div className="text-waterloo dark:text-manatee">Prochain virement</div>
            <div className="text-2xl font-semibold text-black dark:text-white">30/09/2025</div>
          </div>
          <div className="rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
            <div className="text-waterloo dark:text-manatee">Gains du mois</div>
            <div className="text-2xl font-semibold text-black dark:text-white">410€</div>
          </div>
        </div>

        <div className="mt-10 overflow-x-auto rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
          <table className="w-full text-left text-para2">
            <thead>
              <tr className="border-b border-stroke dark:border-strokedark text-waterloo dark:text-manatee">
                <th className="py-3 pr-6">Date</th>
                <th className="py-3 pr-6">Description</th>
                <th className="py-3 pr-6">Montant</th>
                <th className="py-3">Statut</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, i) => (
                <tr key={i} className="border-b border-stroke last:border-0 dark:border-strokedark">
                  <td className="py-3 pr-6">{t.date}</td>
                  <td className="py-3 pr-6">{t.desc}</td>
                  <td className="py-3 pr-6">{t.montant}</td>
                  <td className="py-3">{t.statut}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}


