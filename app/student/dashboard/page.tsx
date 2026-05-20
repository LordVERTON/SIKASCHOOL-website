"use client";

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import CreateSessionModal from '@/components/Student/CreateSessionModal';
import { formatHours } from '@/lib/time-utils';
import { useRealtimeSessions } from '@/hooks/useRealtimeSessions';

interface DashboardData {
  stats: Array<{
    label: string;
    value: string;
    color: string;
    icon: string;
  }>;
  learningMetrics?: {
    averages: {
      concentration: number;
      participation: number;
      preparation: number;
      improvement: number;
      retention: number;
      comprehension: number;
      time_management: number;
      collaboration: number;
    };
    deltas: {
      improvement: number;
      retention: number;
    };
  };
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
    status: string;
  }>;
  tutorStats: {
    totalSessions: number;
    totalHours: number;
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
  recentNotifications: Array<{
    id: string;
    title: string;
    message: string;
    type: string;
    date: string;
    time: string;
    data: any;
  }>;
}

const getSessionStatusLabel = (status: string) => {
  switch (status) {
    case 'PENDING':
      return 'En attente';
    case 'SCHEDULED':
      return 'Programmée';
    case 'IN_PROGRESS':
      return 'En cours';
    case 'COMPLETED':
      return 'Terminée';
    case 'CANCELLED':
      return 'Annulée';
    default:
      return 'Statut inconnu';
  }
};


export default function StudentDashboard() {
  const { user, loading: authLoading, error: authError } = useAuth('STUDENT');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [userInfo, setUserInfo] = useState<{ firstName: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [tutors, setTutors] = useState<Array<{ id: string; name: string }>>([]);
  const [globalNote, setGlobalNote] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      // Extraire le prénom du nom complet
      const firstName = user.name ? user.name.split(' ')[0] : '';
      setUserInfo({ firstName, name: user.name || '' });
    }
  }, [user]);

  const fetchDashboardData = useCallback(async () => {
    if (!user) {
      console.warn('❌ Pas d\'utilisateur connecté');
      setLoading(false);
      return;
    }
    
    try {
      setError(null);
      console.warn('🔄 Récupération des sessions pour le dashboard:', user);
      console.warn('👤 Utilisateur:', { id: user.id, name: user.name, role: user.role });
        
        // Récupérer toutes les sessions (même logique que /student/history)
        const sessionsResponse = await fetch('/api/student/sessions', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          cache: 'no-store',
        });
        
        console.warn('📡 Réponse API sessions:', sessionsResponse.status, sessionsResponse.statusText);
        
        if (sessionsResponse.ok) {
          const sessionsData = await sessionsResponse.json();
          console.warn('📊 Sessions reçues:', sessionsData);
          
          // Calculer les statistiques côté client
          const sessions = sessionsData.sessions || [];
          const now = new Date();
          
          // Statistiques de base
          const completedSessions = sessions.filter((s: any) => s.status === 'COMPLETED');
          const _inProgressSessions = sessions.filter((s: any) => s.status === 'IN_PROGRESS');
          
          // Heures totales (seulement les sessions terminées)
          const totalHours = completedSessions.reduce((acc: number, s: any) => acc + (s.duration || 0), 0) / 60;
          
          // Note moyenne (sessions notées par l'étudiant)
          const ratedSessions = completedSessions.filter((s: any) => s.studentRating && s.studentRating > 0);
          const averageRating = ratedSessions.length > 0 
            ? (ratedSessions.reduce((acc: number, s: any) => acc + s.studentRating, 0) / ratedSessions.length).toFixed(1)
            : 'N/A';
          
          // Séances à venir (prochaines 7 jours)
          const upcomingSessions = sessions.filter((s: any) => {
            const sessionDate = new Date(s.started_at);
            return sessionDate >= now &&
                   (s.status === 'SCHEDULED' || s.status === 'PENDING' || s.status === 'IN_PROGRESS');
          }).sort((a: any, b: any) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime());
          
          // Séances récentes (dernières 5 sessions terminées)
          const recentSessions = completedSessions
            .sort((a: any, b: any) => new Date(b.started_at).getTime() - new Date(a.started_at).getTime())
            .slice(0, 5);
          
          // Créer les données du dashboard
          const dashboardData = {
            stats: [
              {
                label: 'Séances terminées',
                value: completedSessions.length.toString(),
                color: 'text-blue-600',
                icon: '📚'
              },
              {
                label: 'Heures de cours',
                value: `${Math.round(totalHours * 10) / 10}h`,
                color: 'text-green-600',
                icon: '⏰'
              },
              {
                label: 'Séances à venir',
                value: upcomingSessions.length.toString(),
                color: 'text-purple-600',
                icon: '📅'
              },
              {
                label: 'Note moyenne',
                value: averageRating,
                color: 'text-yellow-600',
                icon: '⭐'
              }
            ],
            upcomingSessions: upcomingSessions.map((session: any) => ({
              id: session.id,
              course: session.course || 'Cours',
              type: session.type || 'INDIVIDUAL',
              tutor: session.tutor || 'Tuteur',
              tutorAvatar: session.tutorAvatar || '/images/user/user-01.png',
              date: new Date(session.started_at).toLocaleDateString('fr-FR'),
              time: new Date(session.started_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
              duration: session.duration || 60,
              meetingUrl: `/live/${session.id}`,
              notes: '',
              status: session.status
            })),
            recentSessions: recentSessions.map((session: any) => ({
              id: session.id,
              course: session.course || 'Cours',
              type: session.type || 'INDIVIDUAL',
              level: 'Niveau',
              date: new Date(session.started_at).toLocaleDateString('fr-FR'),
              time: new Date(session.started_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
              duration: session.duration || 60,
              status: session.status,
              topics: session.topics || [],
              homework: session.homework || '',
              tutor: session.tutor || 'Tuteur',
              tutorAvatar: session.tutorAvatar || '/images/user/user-01.png',
              studentRating: session.studentRating || 0,
              tutorRating: session.tutorRating || 0
            })),
            recentMessages: [],
            recentNotifications: [],
            tutorStats: {
              totalSessions: completedSessions.length,
              totalHours: totalHours,
              averageRating: averageRating,
              mainTutor: 'Tuteur principal'
            },
            quickActions: [
              {
                title: 'Réserver une séance',
                description: 'Planifier un nouveau cours',
                action: 'booking',
                icon: '📅',
                color: 'bg-blue-600 hover:bg-blue-700'
              },
              {
                title: 'Mes tuteurs',
                description: 'Voir tous les tuteurs',
                action: 'tutors',
                icon: '👨‍🏫',
                color: 'bg-green-600 hover:bg-green-700'
              },
              {
                title: 'Historique',
                description: 'Séances passées',
                action: 'history',
                icon: '📋',
                color: 'bg-purple-600 hover:bg-purple-700'
              },
              {
                title: 'Messages',
                description: 'Communiquer',
                action: 'messages',
                icon: '💬',
                color: 'bg-orange-600 hover:bg-orange-700'
              }
            ]
          };
          
          setDashboardData(dashboardData);
        } else {
          const errorData = await sessionsResponse.json().catch(() => ({}));
          console.warn('❌ Erreur API sessions:', sessionsResponse.status, errorData);
          
          if (sessionsResponse.status === 401) {
            setError('Problème d\'authentification. Veuillez vous reconnecter.');
          } else {
            setError(`Erreur lors du chargement des sessions: ${errorData.error || 'Erreur inconnue'}`);
          }
        }
    } catch (error) {
      console.warn('❌ Erreur réseau:', error);
      setError('Erreur de connexion. Veuillez vérifier votre connexion internet.');
    } finally {
      console.warn('✅ Fin du chargement');
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    void fetchDashboardData();
  }, [fetchDashboardData]);

  useRealtimeSessions({
    userId: user?.id,
    role: "student",
    enabled: !!user && !authLoading,
    onChange: () => {
      void fetchDashboardData();
    },
  });

  // Calcul de la note globale
  useEffect(() => {
    if (dashboardData?.learningMetrics?.averages) {
      const metrics = dashboardData.learningMetrics.averages;
      const values = Object.values(metrics).filter(v => typeof v === 'number' && v > 0);
      if (values.length > 0) {
        const overall = values.reduce((a, b) => a + b, 0) / values.length;
        setGlobalNote(Number.isFinite(overall) ? overall : null);
      } else {
        setGlobalNote(null);
      }
    } else {
      setGlobalNote(null);
    }
  }, [dashboardData]);

  // Charger les tuteurs attribués
  useEffect(() => {
    const fetchTutors = async () => {
      try {
        const response = await fetch('/api/student/assigned-tutors', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          setTutors(data.tutors.map((tutor: any) => ({
            id: tutor.id,
            name: tutor.name
          })));
        } else {
          // Si l'API n'est pas disponible, utiliser une liste vide
          console.warn('API assigned-tutors non disponible');
          setTutors([]);
        }
      } catch (error) {
        console.warn('Erreur lors du chargement des tuteurs:', error);
        setTutors([]);
      }
    };

    fetchTutors();
  }, []);

  const handleCreateSession = () => {
    setShowCreateSession(true);
  };

  const handleSessionSuccess = () => {
    void fetchDashboardData();
  };


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

        {/* Nouveaux indicateurs d'apprentissage */}
        {dashboardData?.learningMetrics && (
          <div className="mt-10 animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
            <h2 className="text-xl font-semibold text-black dark:text-white mb-6">Indicateurs d'apprentissage</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Metric label="Niveau de concentration" value={dashboardData.learningMetrics.averages.concentration} />
              <Metric label="Participation" value={dashboardData.learningMetrics.averages.participation} />
              <Metric label="Niveau de préparation" value={dashboardData.learningMetrics.averages.preparation} />
              <Metric label="Amélioration (vs dernière)" value={dashboardData.learningMetrics.averages.improvement} delta={dashboardData.learningMetrics.deltas.improvement} />
              <Metric label="Rétention d’information (vs dernière)" value={dashboardData.learningMetrics.averages.retention} delta={dashboardData.learningMetrics.deltas.retention} />
              <Metric label="Compréhension globale" value={dashboardData.learningMetrics.averages.comprehension} />
              <Metric label="Gestion du temps" value={dashboardData.learningMetrics.averages.time_management} />
              <Metric label="Collaboration (en groupe)" value={dashboardData.learningMetrics.averages.collaboration} />
            </div>
          </div>
        )}

      </main>
    );
  }

  if (authError) {
    return (
      <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
        <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
          <div className="animate_top mx-auto text-center">
            <h1 className="text-3xl font-bold text-red-600 dark:text-red-400 xl:text-sectiontitle3">
              Accès refusé
            </h1>
            <p className="mt-4 text-para2 text-waterloo dark:text-manatee">
              {authError}
            </p>
            <p className="mt-2 text-sm text-waterloo dark:text-manatee">
              Redirection en cours...
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
              Erreur de chargement
            </h1>
            <p className="mt-4 text-para2 text-waterloo dark:text-manatee">
              {error}
            </p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:opacity-90 transition"
            >
              Réessayer
            </button>
          </div>
        </div>
      </main>
    );
  }

  // Si pas de données, afficher un message informatif
  if (!dashboardData) {
    return (
      <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
        <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
          <div className="animate_top mx-auto text-center">
            <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">
              Bienvenue{userInfo?.firstName ? ` ${userInfo.firstName}` : ''} !
            </h1>
            <p className="mt-4 text-para2 text-waterloo dark:text-manatee">
              Votre tableau de bord se charge...
            </p>
            <div className="mt-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
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
          {dashboardData.stats.map((stat, index) => {
            const bgColors = [
              "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
              "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20", 
              "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
              "bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20"
            ];
            const borderColors = [
              "border-blue-200 dark:border-blue-700",
              "border-green-200 dark:border-green-700",
              "border-purple-200 dark:border-purple-700", 
              "border-yellow-200 dark:border-yellow-700"
            ];
            
            return (
              <div key={index} className={`animate_top rounded-lg border ${borderColors[index]} ${bgColors[index]} p-7.5 shadow-solid-10`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-waterloo dark:text-manatee text-sm">{stat.label}</div>
                  <span className="text-2xl">{stat.icon}</span>
                </div>
                <div className={`text-2xl font-semibold ${stat.color}`}>{stat.value}</div>
              </div>
            );
          })}
        </div>

        {/* Vos statistiques détaillées */}
        <div className="mt-10 animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
          <h2 className="text-xl font-semibold text-black dark:text-white mb-6">Vos statistiques</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border border-stroke bg-gray-50 p-4 text-center dark:border-strokedark dark:bg-gray-800">
              <div className="text-2xl font-bold text-blue-600">{dashboardData.tutorStats.totalSessions}</div>
              <div className="text-sm text-waterloo dark:text-manatee">Sessions terminées</div>
            </div>
            <div className="rounded-lg border border-stroke bg-gray-50 p-4 text-center dark:border-strokedark dark:bg-gray-800">
              <div className="text-2xl font-bold text-green-600">{Math.round(dashboardData.tutorStats.totalHours * 10) / 10}h</div>
              <div className="text-sm text-waterloo dark:text-manatee">Heures totales</div>
            </div>
            <div className="rounded-lg border border-stroke bg-gray-50 p-4 text-center dark:border-strokedark dark:bg-gray-800">
              <div className="text-2xl font-bold text-yellow-600">{dashboardData.tutorStats.averageRating}/5</div>
              <div className="text-sm text-waterloo dark:text-manatee">Note moyenne</div>
            </div>
          </div>
        </div>

        {/* Actions rapides */}
        <div className="mt-10 animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
          <h2 className="text-xl font-semibold text-black dark:text-white mb-6">Actions rapides</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {dashboardData.quickActions.map((action, index) => {
              // Si c'est l'action de réservation, utiliser la popup
              if (action.action === 'booking') {
                return (
                  <button
                    key={index}
                    onClick={handleCreateSession}
                    className={`p-6 rounded-lg ${action.color} text-white hover:opacity-90 transition-all transform hover:scale-105`}
                  >
                    <div className="text-3xl mb-3">{action.icon}</div>
                    <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                    <p className="text-sm opacity-90">{action.description}</p>
                  </button>
                );
              }
              
              // Pour les autres actions, utiliser les liens normaux
              return (
                <Link
                  key={index}
                  href={`/student/${action.action}`}
                  className={`p-6 rounded-lg ${action.color} text-white hover:opacity-90 transition-all transform hover:scale-105`}
                >
                  <div className="text-3xl mb-3">{action.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{action.title}</h3>
                  <p className="text-sm opacity-90">{action.description}</p>
                </Link>
              );
            })}
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
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-black dark:text-white">
                          Séance {session.type} - {session.course}
                        </h3>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          session.status === 'PENDING' ? 'bg-red-100 text-red-700' :
                          session.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' :
                          session.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {getSessionStatusLabel(session.status)}
                        </span>
                      </div>
                      <p className="text-sm text-waterloo dark:text-manatee">
                        avec {session.tutor} • {session.duration}min
                      </p>
                      <p className="text-xs text-waterloo dark:text-manatee mt-1">
                        {session.date}
                      </p>
                    </div>
                    <div className="ml-4 flex gap-2">
                      {session.status === 'IN_PROGRESS' || session.status === 'SCHEDULED' ? (
                        <Link
                          href={session.meetingUrl}
                          className="px-3 py-1 bg-primary text-white rounded-md hover:opacity-90 transition text-sm"
                        >
                          Rejoindre
                        </Link>
                      ) : session.status === 'PENDING' ? (
                        <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-md text-sm">
                          En attente
                        </span>
                      ) : null}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className="text-waterloo dark:text-manatee mb-4">Aucune séance programmée</p>
                  <button
                    onClick={handleCreateSession}
                    className="px-4 py-2 bg-primary text-white rounded-md hover:opacity-90 transition"
                  >
                    Réserver une séance
                  </button>
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
                          {getSessionStatusLabel(session.status)}
                        </div>
                        {session.studentRating > 0 && (
                          <div className="text-xs text-yellow-500 mt-1">
                            {'★'.repeat(Math.floor(session.studentRating))}
                            {session.studentRating % 1 !== 0 && '☆'}
                            <span className="ml-1 text-gray-600">({session.studentRating}/5)</span>
                          </div>
                        )}
                        {session.tutorRating > 0 && (
                          <div className="text-xs text-blue-500 mt-1">
                            Tuteur: {'★'.repeat(Math.floor(session.tutorRating))}
                            {session.tutorRating % 1 !== 0 && '☆'}
                            <span className="ml-1 text-gray-600">({session.tutorRating}/5)</span>
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

        {/* Notifications récentes */}
        {dashboardData.recentNotifications && dashboardData.recentNotifications.length > 0 && (
          <div className="mt-10 animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-black dark:text-white">Notifications récentes</h2>
              <Link href="/student/notifications" className="text-primary hover:underline text-sm">
                Voir tout
              </Link>
            </div>
            <div className="space-y-4">
              {dashboardData.recentNotifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className="p-4 rounded-lg border border-stroke dark:border-strokedark">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          notification.type === 'BOOKING' ? 'bg-blue-100 text-blue-700' :
                          notification.type === 'SESSION' ? 'bg-green-100 text-green-700' :
                          notification.type === 'PAYMENT' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {notification.type}
                        </span>
                        <h3 className="font-medium text-black dark:text-white">{notification.title}</h3>
                      </div>
                      <p className="text-sm text-waterloo dark:text-manatee mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <p className="text-xs text-waterloo dark:text-manatee mt-2">
                        {notification.date} à {notification.time}
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
              <div className="text-3xl font-bold text-blue-600 mb-2">{dashboardData.tutorStats.totalSessions}</div>
              <div className="text-sm text-waterloo dark:text-manatee">Séances terminées</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">{formatHours(dashboardData.tutorStats.totalHours)}</div>
              <div className="text-sm text-waterloo dark:text-manatee">Heures de cours</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600 mb-2">
                {globalNote !== null ? `${globalNote.toFixed(1)}/5` : (dashboardData.tutorStats.averageRating || 'N/A')}
              </div>
              <div className="text-sm text-waterloo dark:text-manatee">Note globale (selon filtre)</div>
            </div>
          </div>
        </div>
      </div>

      {/* Popup de création de séance */}
      {showCreateSession && (
        <CreateSessionModal
          tutors={tutors}
          onClose={() => setShowCreateSession(false)}
          onSuccess={handleSessionSuccess}
        />
      )}
    </main>
  );
}

function Metric({ label, value, delta }: { label: string; value: number; delta?: number }) {
  const formatted = Number.isFinite(value) && value > 0 ? value.toFixed(1) + '/5' : 'N/A';
  const hasDelta = typeof delta === 'number' && delta !== 0;
  return (
    <div className="text-center">
      <div className="text-sm text-waterloo dark:text-manatee mb-1">{label}</div>
      <div className="text-2xl font-bold text-black dark:text-white">{formatted}</div>
      {hasDelta && (
        <div className={`text-xs mt-1 ${delta! > 0 ? 'text-green-600' : 'text-red-600'}`}>
          {delta! > 0 ? '↗' : '↘'} {Math.abs(delta!).toFixed(1)} vs dernière séance
        </div>
      )}
    </div>
  );
}

