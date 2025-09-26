"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';

interface DashboardData {
  stats: Array<{
    label: string;
    value: string;
    color: string;
    icon: string;
  }>;
  recentSessions: Array<{
    id: string;
    type: string;
    level: string;
    date: string;
    time: string;
    duration: number;
    status: string;
    topics: string[];
    homework: string;
    tutor: string;
    tutorAvatar: string;
    studentRating: number;
    tutorRating: number;
    course: string;
  }>;
  upcomingSessions: Array<{
    id: string;
    date: string;
    time: string;
    duration: number;
    type: string;
    tutor: string;
    tutorAvatar: string;
    course: string;
    meetingUrl: string;
    notes: string;
  }>;
  tutorStats: {
    totalSessions: number;
    totalHours: number;
    totalSpent: number;
    averageRating: string;
    mainTutor: string;
  };
  quickActions: Array<{
    title: string;
    description: string;
    action: string;
    icon: string;
    color: string;
  }>;
  recentMessages: Array<{
    id: string;
    content: string;
    date: string;
    time: string;
    sender: string;
    subject: string;
  }>;
}

export default function StudentDashboard() {
  const { user, loading: authLoading, error } = useAuth('STUDENT');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [userInfo, setUserInfo] = useState<{ firstName: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      // Extraire le prénom du nom complet
      const firstName = user.name ? user.name.split(' ')[0] : '';
      setUserInfo({ firstName, name: user.name || '' });
    }
  }, [user]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) return;
      
      try {
        // Récupérer les données du dashboard
        const dashboardResponse = await fetch('/api/student/dashboard');
        if (dashboardResponse.ok) {
          const data = await dashboardResponse.json();
          setDashboardData(data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (authLoading || loading) {
    return (
      <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
        <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
          <div className="animate_top mx-auto text-center">
            <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">
              Vérification de l'authentification...
            </h1>
            <p className="mt-4 text-para2 text-waterloo dark:text-manatee">
              Veuillez patienter pendant que nous vérifions vos droits d'accès.
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
        <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
          <div className="animate_top mx-auto text-center">
            <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 xl:text-sectiontitle3">
              Accès refusé
            </h1>
            <p className="mt-4 text-para2 text-waterloo dark:text-manatee">
              {error}
            </p>
            <p className="mt-2 text-sm text-waterloo dark:text-manatee">
              Redirection en cours...
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!dashboardData) {
    return (
      <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
        <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-black dark:text-white mb-4">
              Erreur de chargement
            </h1>
            <p className="text-waterloo dark:text-manatee">
              Impossible de charger les données du tableau de bord.
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
      <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
        <div className="animate_top">
          <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">
            Bienvenue{userInfo?.firstName ? ` ${userInfo.firstName}` : ''} sur votre espace cours particuliers !
          </h1>
          <p className="mt-4 text-para2 text-waterloo dark:text-manatee">
            Suivez vos séances, communiquez avec vos tuteurs et gérez votre apprentissage.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mt-10 grid gap-7.5 md:grid-cols-2 lg:grid-cols-4">
          {dashboardData.stats.map((stat, index) => (
            <div key={index} className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
              <div className="flex items-center justify-between mb-2">
                <div className="text-waterloo dark:text-manatee text-sm">{stat.label}</div>
                <span className="text-2xl">{stat.icon}</span>
              </div>
              <div className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Actions rapides */}
        <div className="mt-10 animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
          <h2 className="text-xl font-semibold text-black dark:text-white mb-6">Actions rapides</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {dashboardData.quickActions.map((action, index) => (
              <Link
                key={index}
                href={`/student/${action.action}`}
                className={`p-6 rounded-lg ${action.color} text-white hover:opacity-90 transition-all transform hover:scale-105`}
              >
                <div className="text-3xl mb-3">{action.icon}</div>
                <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                <p className="text-sm opacity-90">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-10 grid gap-7.5 lg:grid-cols-2">
          {/* Prochaines séances */}
          <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-6">Prochaines séances</h2>
            <div className="space-y-4">
              {dashboardData.upcomingSessions.length > 0 ? (
                dashboardData.upcomingSessions.map((session) => (
                  <div key={session.id} className="flex items-center p-4 rounded-lg border border-stroke dark:border-strokedark">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mr-4">
                      <span className="text-primary font-semibold text-sm">{session.time}</span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-black dark:text-white">
                        Séance {session.type} - {session.course}
                      </h3>
                      <p className="text-sm text-waterloo dark:text-manatee">
                        avec {session.tutor} • {session.duration}min
                      </p>
                      <p className="text-xs text-waterloo dark:text-manatee mt-1">
                        {session.date}
                      </p>
                    </div>
                    {session.meetingUrl && (
                      <Link
                        href={session.meetingUrl}
                        className="ml-4 px-3 py-1 bg-primary text-white rounded-md hover:opacity-90 transition text-sm"
                      >
                        Rejoindre
                      </Link>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-waterloo dark:text-manatee mb-4">Aucune séance programmée</p>
                  <Link
                    href="/student/booking"
                    className="px-4 py-2 bg-primary text-white rounded-md hover:opacity-90 transition"
                  >
                    Réserver une séance
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Séances récentes */}
          <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-6">Séances récentes</h2>
            <div className="space-y-4">
              {dashboardData.recentSessions.length > 0 ? (
                dashboardData.recentSessions.slice(0, 3).map((session) => (
                  <div key={session.id} className="p-4 rounded-lg border border-stroke dark:border-strokedark">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="font-medium text-black dark:text-white">
                          {session.course} - {session.type}
                        </h3>
                        <p className="text-sm text-waterloo dark:text-manatee">
                          avec {session.tutor} • {session.date} à {session.time}
                        </p>
                        {session.topics.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-waterloo dark:text-manatee">Sujets abordés:</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {session.topics.slice(0, 2).map((topic, idx) => (
                                <span key={idx} className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                                  {topic}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`text-sm font-medium ${
                          session.status === 'COMPLETED' ? 'text-green-600' : 
                          session.status === 'IN_PROGRESS' ? 'text-blue-600' : 'text-gray-600'
                        }`}>
                          {session.status === 'COMPLETED' ? 'Terminée' : 
                           session.status === 'IN_PROGRESS' ? 'En cours' : session.status}
                        </div>
                        {session.studentRating && (
                          <div className="text-xs text-yellow-500 mt-1">
                            {'★'.repeat(session.studentRating)}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-waterloo dark:text-manatee">Aucune séance récente</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Messages récents */}
        {dashboardData.recentMessages.length > 0 && (
          <div className="mt-10 animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-black dark:text-white">Messages récents</h2>
              <Link href="/student/messages" className="text-primary hover:underline text-sm">
                Voir tout
              </Link>
            </div>
            <div className="space-y-4">
              {dashboardData.recentMessages.slice(0, 3).map((message) => (
                <div key={message.id} className="p-4 rounded-lg border border-stroke dark:border-strokedark">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-black dark:text-white">{message.subject}</h3>
                      <p className="text-sm text-waterloo dark:text-manatee mt-1 line-clamp-2">
                        {message.content}
                      </p>
                      <p className="text-xs text-waterloo dark:text-manatee mt-2">
                        {message.sender} • {message.date} à {message.time}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Statistiques détaillées */}
        <div className="mt-10 animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
          <h2 className="text-xl font-semibold text-black dark:text-white mb-6">Vos statistiques</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{dashboardData.tutorStats.totalSessions}</div>
              <div className="text-sm text-waterloo dark:text-manatee">Séances terminées</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{dashboardData.tutorStats.totalHours}h</div>
              <div className="text-sm text-waterloo dark:text-manatee">Heures de cours</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">{dashboardData.tutorStats.totalSpent.toFixed(0)}€</div>
              <div className="text-sm text-waterloo dark:text-manatee">Total investi</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary mb-2">
                {dashboardData.tutorStats.averageRating || 'N/A'}
              </div>
              <div className="text-sm text-waterloo dark:text-manatee">Note moyenne</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
