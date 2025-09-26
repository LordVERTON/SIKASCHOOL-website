import Link from "next/link";

export default function StudentHome() {
  return (
    <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
      <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
        <div className="animate_top mx-auto text-center">
          <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">
            Espace étudiant
          </h1>
          <p className="mt-4 text-para2 text-waterloo dark:text-manatee">
            Accédez rapidement à vos sections principales.
          </p>
        </div>

        <div className="relative mx-auto mt-15 max-w-[1207px] px-4 md:px-8 xl:mt-20 xl:px-0">
          <div className="grid gap-7.5 xl:gap-12.5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="animate_top group relative rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection dark:shadow-none xl:p-12.5">
              <h2 className="text-xl font-semibold text-black dark:text-white">Mes cours</h2>
              <p className="mt-2 text-waterloo dark:text-manatee">Consultez vos cours et progressez dans votre apprentissage.</p>
              <div className="mt-9 border-t border-stroke pt-9 dark:border-strokedark">
                <Link
                  href="/student/courses"
                  className="group/btn inline-flex items-center gap-2.5 font-medium text-primary transition-all duration-300 dark:text-white dark:hover:text-primary"
                >
                  <span className="duration-300 group-hover/btn:pr-2">Consulter</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.4767 6.16701L6.00668 1.69701L7.18501 0.518677L13.6667 7.00034L7.18501 13.482L6.00668 12.3037L10.4767 7.83368H0.333344V6.16701H10.4767Z" fill="currentColor" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="animate_top group relative rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection dark:shadow-none xl:p-12.5">
              <h2 className="text-xl font-semibold text-black dark:text-white">Mes devoirs</h2>
              <p className="mt-2 text-waterloo dark:text-manatee">Consultez vos devoirs et évaluations.</p>
              <div className="mt-9 border-t border-stroke pt-9 dark:border-strokedark">
                <Link
                  href="/student/assignments"
                  className="group/btn inline-flex items-center gap-2.5 font-medium text-primary transition-all duration-300 dark:text-white dark:hover:text-primary"
                >
                  <span className="duration-300 group-hover/btn:pr-2">Voir</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.4767 6.16701L6.00668 1.69701L7.18501 0.518677L13.6667 7.00034L7.18501 13.482L6.00668 12.3037L10.4767 7.83368H0.333344V6.16701H10.4767Z" fill="currentColor" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="animate_top group relative rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection dark:shadow-none xl:p-12.5">
              <h2 className="text-xl font-semibold text-black dark:text-white">Messages</h2>
              <p className="mt-2 text-waterloo dark:text-manatee">Communiquez avec vos tuteurs.</p>
              <div className="mt-9 border-t border-stroke pt-9 dark:border-strokedark">
                <Link
                  href="/student/messages"
                  className="group/btn inline-flex items-center gap-2.5 font-medium text-primary transition-all duration-300 dark:text-white dark:hover:text-primary"
                >
                  <span className="duration-300 group-hover/btn:pr-2">Accéder</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.4767 6.16701L6.00668 1.69701L7.18501 0.518677L13.6667 7.00034L7.18501 13.482L6.00668 12.3037L10.4767 7.83368H0.333344V6.16701H10.4767Z" fill="currentColor" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="animate_top group relative rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection dark:shadow-none xl:p-12.5">
              <h2 className="text-xl font-semibold text-black dark:text-white">Calendrier</h2>
              <p className="mt-2 text-waterloo dark:text-manatee">Consultez votre planning et vos séances.</p>
              <div className="mt-9 border-t border-stroke pt-9 dark:border-strokedark">
                <Link
                  href="/student/calendar"
                  className="group/btn inline-flex items-center gap-2.5 font-medium text-primary transition-all duration-300 dark:text-white dark:hover:text-primary"
                >
                  <span className="duration-300 group-hover/btn:pr-2">Voir</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.4767 6.16701L6.00668 1.69701L7.18501 0.518677L13.6667 7.00034L7.18501 13.482L6.00668 12.3037L10.4767 7.83368H0.333344V6.16701H10.4767Z" fill="currentColor" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="animate_top group relative rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection dark:shadow-none xl:p-12.5">
              <h2 className="text-xl font-semibold text-black dark:text-white">Notifications</h2>
              <p className="mt-2 text-waterloo dark:text-manatee">Consultez vos notifications et alertes.</p>
              <div className="mt-9 border-t border-stroke pt-9 dark:border-strokedark">
                <Link
                  href="/student/notifications"
                  className="group/btn inline-flex items-center gap-2.5 font-medium text-primary transition-all duration-300 dark:text-white dark:hover:text-primary"
                >
                  <span className="duration-300 group-hover/btn:pr-2">Voir</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.4767 6.16701L6.00668 1.69701L7.18501 0.518677L13.6667 7.00034L7.18501 13.482L6.00668 12.3037L10.4767 7.83368H0.333344V6.16701H10.4767Z" fill="currentColor" />
                  </svg>
                </Link>
              </div>
            </div>

            <div className="animate_top group relative rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection dark:shadow-none xl:p-12.5">
              <h2 className="text-xl font-semibold text-black dark:text-white">Mon profil</h2>
              <p className="mt-2 text-waterloo dark:text-manatee">Gérez vos préférences et informations.</p>
              <div className="mt-9 border-t border-stroke pt-9 dark:border-strokedark">
                <Link
                  href="/student/profile"
                  className="group/btn inline-flex items-center gap-2.5 font-medium text-primary transition-all duration-300 dark:text-white dark:hover:text-primary"
                >
                  <span className="duration-300 group-hover/btn:pr-2">Modifier</span>
                  <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                    <path d="M10.4767 6.16701L6.00668 1.69701L7.18501 0.518677L13.6667 7.00034L7.18501 13.482L6.00668 12.3037L10.4767 7.83368H0.333344V6.16701H10.4767Z" fill="currentColor" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
