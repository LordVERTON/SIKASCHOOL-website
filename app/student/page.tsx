import Link from "next/link";

const shortcuts = [
  { href: "/student/dashboard", label: "Réserver", detail: "Planifier une séance" },
  { href: "/student/calendar", label: "Calendrier", detail: "Voir le planning" },
  { href: "/student/messages", label: "Messages", detail: "Écrire au tuteur" },
];

export default function StudentHome() {
  return (
    <main className="pb-20 lg:pb-25 xl:pb-30">
      <div className="mx-auto max-w-c-1315 px-1 md:px-8 xl:px-0">
        <section className="rounded-[28px] bg-white px-5 py-6 shadow-[0_16px_40px_rgba(15,23,42,0.06)] dark:bg-blacksection sm:px-7 lg:rounded-lg lg:border lg:border-stroke lg:p-8 lg:dark:border-strokedark">
          <p className="text-sm font-medium text-primary">Espace étudiant</p>
          <h1 className="mt-3 text-3xl font-bold leading-tight text-black dark:text-white lg:text-4xl">
            Votre semaine, simplement.
          </h1>
          <p className="mt-3 max-w-2xl text-base text-waterloo dark:text-manatee">
            Retrouvez vos séances, vos tuteurs et les actions utiles sans surcharge.
          </p>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {shortcuts.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-2xl border border-stroke bg-[#f7f8fb] p-4 transition hover:border-primary/40 hover:bg-primary/5 dark:border-strokedark dark:bg-black lg:rounded-lg"
              >
                <span className="text-base font-semibold text-black dark:text-white">{item.label}</span>
                <span className="mt-1 block text-sm text-waterloo dark:text-manatee">{item.detail}</span>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-5 grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
          <div className="rounded-[24px] bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)] dark:bg-blacksection lg:rounded-lg lg:border lg:border-stroke lg:p-7 lg:dark:border-strokedark">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-black dark:text-white">Prochaines séances</h2>
              <Link href="/student/calendar" className="text-sm font-medium text-primary">
                Voir tout
              </Link>
            </div>
            <div className="mt-5 rounded-2xl border border-dashed border-stroke p-5 text-sm text-waterloo dark:border-strokedark dark:text-manatee">
              Aucune séance affichée ici pour le moment. Utilisez Réserver pour demander un créneau.
            </div>
          </div>

          <div className="rounded-[24px] bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)] dark:bg-blacksection lg:rounded-lg lg:border lg:border-stroke lg:p-7 lg:dark:border-strokedark">
            <h2 className="text-xl font-semibold text-black dark:text-white">Accès rapide</h2>
            <div className="mt-5 space-y-3">
              <Link href="/student/tutors" className="block rounded-2xl bg-primary/10 px-4 py-3 text-sm font-semibold text-primary">
                Mes tuteurs
              </Link>
              <Link href="/student/paiements" className="block rounded-2xl bg-gray-100 px-4 py-3 text-sm font-semibold text-black dark:bg-gray-800 dark:text-white">
                Paiements
              </Link>
              <Link href="/student/profile" className="block rounded-2xl bg-gray-100 px-4 py-3 text-sm font-semibold text-black dark:bg-gray-800 dark:text-white">
                Profil
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
