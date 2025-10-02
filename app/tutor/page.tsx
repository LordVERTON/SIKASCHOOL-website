"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface DashboardData {
  stats: Array<{ label: string; value: string; color: string; icon: string }>;
  upcomingSessions: Array<{ id: string; date: string; time: string; duration: number; type: string; participants: string; meetingUrl?: string }>;
  recentSessions: Array<{ id: string; course: string; type: string; date: string; time: string; duration: number; status: string; participants: string[] }>;
  quickActions: Array<{ title: string; description: string; action: string; icon: string; color: string }>;
}

export default function TutorHome() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/tutor/dashboard', { credentials: 'include' });
        if (res.ok) {
          setData(await res.json());
        } else {
          setData(null);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-6">Chargement…</div>;
  if (!data) return <div className="p-6">Aucune donnée</div>;

  return (
    <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
      <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
        <div className="animate_top">
          <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">Espace Tuteur</h1>
          <p className="mt-4 text-para2 text-waterloo dark:text-manatee">Vos séances, messages et raccourcis utiles.</p>
        </div>

        {/* Stats Cards */}
        <div className="mt-10 grid gap-7.5 md:grid-cols-2 lg:grid-cols-4">
          {data.stats.map((stat, index) => (
            <div key={index} className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-waterloo dark:text-manatee text-sm">{stat.label}</div>
                  <div className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</div>
                </div>
                <div className="text-primary/60">{stat.icon}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick actions */}
        <div className="mt-10 animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
          <h2 className="text-xl font-semibold text-black dark:text-white mb-6">Actions rapides</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {data.quickActions.map((a, idx) => (
              <Link key={idx} href={a.action} className={`p-6 rounded-lg ${a.color} text-white hover:opacity-90 transition-all`}>
                <div className="text-3xl mb-3">{a.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{a.title}</h3>
                <p className="text-sm opacity-90">{a.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-7.5 lg:grid-cols-2">
          {/* Upcoming */}
          <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-6">Prochaines séances</h2>
            <div className="space-y-4">
              {data.upcomingSessions.map((s) => (
                <div key={s.id} className="flex items-center p-4 rounded-lg border border-stroke dark:border-strokedark">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                    <span className="text-primary font-semibold text-sm">{s.time}</span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-black dark:text-white">Séance {s.type}</h3>
                    <p className="text-sm text-waterloo dark:text-manatee">avec {s.participants} • {s.duration}min</p>
                    <p className="text-xs text-waterloo dark:text-manatee mt-1">{s.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent */}
          <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-6">Séances récentes</h2>
            <div className="space-y-4">
              {data.recentSessions.map((s) => (
                <div key={s.id} className="p-4 rounded-lg border border-stroke dark:border-strokedark">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="font-medium text-black dark:text-white">{s.course} - {s.type}</h3>
                      <p className="text-sm text-waterloo dark:text-manatee">{s.participants.join(', ')}</p>
                      <p className="text-xs text-waterloo dark:text-manatee mt-1">{s.date} • {s.time} • {s.duration}min</p>
                    </div>
                    <div className={`text-sm font-medium ${s.status === 'COMPLETED' ? 'text-green-600' : s.status === 'IN_PROGRESS' ? 'text-blue-600' : 'text-gray-600'}`}>{s.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
