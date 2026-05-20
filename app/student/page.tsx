"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type UpcomingSession = {
  id: string;
  course: string;
  type: string;
  tutor: string;
  date: string;
  time: string;
  duration: number;
  meetingUrl: string;
  status: string;
};

type StudentSession = {
  id: string;
  started_at: string;
  course: string;
  type: string;
  tutor: string;
  duration: number;
  status: string;
};

type StudentSessionsResponse = {
  sessions?: StudentSession[];
};

const shortcuts = [
  { href: "/student/dashboard", label: "Réserver", detail: "Planifier une séance" },
  { href: "/student/calendar", label: "Calendrier", detail: "Voir le planning" },
  { href: "/student/messages", label: "Messages", detail: "Écrire au tuteur" },
];

const getSessionStatusLabel = (status: string) => {
  switch (status) {
    case "PENDING":
      return "En attente";
    case "SCHEDULED":
      return "Programmée";
    case "IN_PROGRESS":
      return "En cours";
    case "COMPLETED":
      return "Terminée";
    case "CANCELLED":
      return "Annulée";
    default:
      return "Statut inconnu";
  }
};

const getSessionStatusClassName = (status: string) => {
  switch (status) {
    case "PENDING":
      return "bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300";
    case "SCHEDULED":
      return "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300";
    case "IN_PROGRESS":
      return "bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-300";
    default:
      return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
  }
};

export default function StudentHome() {
  const [upcomingSessions, setUpcomingSessions] = useState<UpcomingSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;

    const loadUpcomingSessions = async () => {
      try {
        setError(null);
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const response = await fetch(`/api/student/sessions?start=${encodeURIComponent(start.toISOString())}`, {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Impossible de charger les prochaines séances.");
        }

        const data = (await response.json()) as StudentSessionsResponse;
        const now = new Date();
        const upcoming = (data.sessions ?? [])
          .filter((session) => {
            const sessionDate = new Date(session.started_at);
            const hasUpcomingStatus =
              session.status === "SCHEDULED" ||
              session.status === "PENDING" ||
              session.status === "IN_PROGRESS";

            return hasUpcomingStatus && (session.status === "IN_PROGRESS" || sessionDate >= now);
          })
          .sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime())
          .slice(0, 5)
          .map((session) => {
            const startedAt = new Date(session.started_at);

            return {
              id: session.id,
              course: session.course || "Cours",
              type: session.type || "INDIVIDUAL",
              tutor: session.tutor || "Tuteur",
              date: startedAt.toLocaleDateString("fr-FR"),
              time: startedAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }),
              duration: session.duration || 60,
              meetingUrl: `/live/${session.id}`,
              status: session.status,
            };
          });

        if (!ignore) {
          setUpcomingSessions(upcoming);
        }
      } catch (err) {
        if (!ignore) {
          setError(err instanceof Error ? err.message : "Erreur de chargement.");
          setUpcomingSessions([]);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void loadUpcomingSessions();

    return () => {
      ignore = true;
    };
  }, []);

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
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-xl font-semibold text-black dark:text-white">Prochaines séances</h2>
              <Link href="/student/calendar" className="shrink-0 text-sm font-medium text-primary">
                Voir tout
              </Link>
            </div>

            <div className="mt-5 space-y-3">
              {loading && (
                <>
                  {[0, 1, 2].map((item) => (
                    <div
                      key={item}
                      className="h-24 animate-pulse rounded-2xl border border-stroke bg-[#f7f8fb] dark:border-strokedark dark:bg-black"
                    />
                  ))}
                </>
              )}

              {!loading && error && (
                <div className="rounded-2xl border border-dashed border-stroke p-5 text-sm text-waterloo dark:border-strokedark dark:text-manatee">
                  {error}
                </div>
              )}

              {!loading && !error && upcomingSessions.length === 0 && (
                <div className="rounded-2xl border border-dashed border-stroke p-5 text-sm text-waterloo dark:border-strokedark dark:text-manatee">
                  Aucune séance affichée ici pour le moment. Utilisez Réserver pour demander un créneau.
                </div>
              )}

              {!loading &&
                !error &&
                upcomingSessions.map((session) => (
                  <div
                    key={session.id}
                    className="flex flex-col gap-4 rounded-2xl border border-stroke bg-[#f7f8fb] p-4 dark:border-strokedark dark:bg-black sm:flex-row sm:items-center"
                  >
                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <span className="text-sm font-bold">{session.time}</span>
                      <span className="text-[11px] font-medium">{session.duration}min</span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-black dark:text-white">
                          {session.course || "Cours"}
                        </h3>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${getSessionStatusClassName(session.status)}`}
                        >
                          {getSessionStatusLabel(session.status)}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-waterloo dark:text-manatee">
                        avec {session.tutor || "Tuteur"} - {session.date}
                      </p>
                    </div>

                    {(session.status === "SCHEDULED" || session.status === "IN_PROGRESS") && (
                      <Link
                        href={session.meetingUrl || `/live/${session.id}`}
                        className="rounded-lg bg-primary px-4 py-2 text-center text-sm font-semibold text-white transition hover:opacity-90"
                      >
                        Rejoindre
                      </Link>
                    )}
                  </div>
                ))}
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
