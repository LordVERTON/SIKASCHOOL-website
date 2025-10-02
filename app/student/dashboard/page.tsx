"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import CreateSessionModal from '@/components/Student/CreateSessionModal';
import { formatHours } from '@/lib/time-utils';

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
}


export default function StudentDashboard() {
  const { user, loading: authLoading, error: authError } = useAuth('STUDENT');
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [userInfo, setUserInfo] = useState<{ firstName: string; name: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [tutors, setTutors] = useState<Array<{ id: string; name: string }>>([]);
  const [assessments, setAssessments] = useState<any[]>([]);
  const [period, setPeriod] = useState<'session' | 'week' | 'month' | 'year'>('month');
  const [globalNote, setGlobalNote] = useState<number | null>(null);

  useEffect(() => {
    if (user) {
      // Extraire le prénom du nom complet
      const firstName = user.name ? user.name.split(' ')[0] : '';
      setUserInfo({ firstName, name: user.name || '' });
    }
  }, [user]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user) {
        console.warn('❌ Pas d\'utilisateur connecté');
        setLoading(false);
        return;
      }
      
      try {
        console.warn('🔄 Récupération des données du dashboard pour:', user);
        console.warn('👤 Utilisateur:', { id: user.id, name: user.name, role: user.role });
        
        // Récupérer les données du dashboard
        const dashboardResponse = await fetch('/api/student/dashboard', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include', // Important pour les cookies de session
        });
        
        console.warn('📡 Réponse API:', dashboardResponse.status, dashboardResponse.statusText);
        
        if (dashboardResponse.ok) {
          const data = await dashboardResponse.json();
          console.warn('📊 Données reçues:', data);
          setDashboardData(data);
        } else {
          const errorData = await dashboardResponse.json().catch(() => ({}));
          console.warn('❌ Erreur API:', dashboardResponse.status, errorData);
          
          // Si erreur 401, l'utilisateur n'est pas authentifié
          if (dashboardResponse.status === 401) {
            console.warn('🔐 Problème d\'authentification - redirection vers la connexion');
            // Optionnel: rediriger vers la page de connexion
            // window.location.href = '/auth/signin';
          }
        }
      } catch (error) {
        console.warn('❌ Erreur réseau:', error);
      } finally {
        console.warn('✅ Fin du chargement');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  // Charger les évaluations pour le graphe
  useEffect(() => {
    const loadAssessments = async () => {
      if (!user) return;
      try {
        const res = await fetch('/api/student/assessments', { credentials: 'include' });
        if (!res.ok) return;
        const json = await res.json();
        setAssessments(json.assessments || []);
      } catch {}
    };
    loadAssessments();
  }, [user]);

  // Calcul de la note globale selon le filtre
  useEffect(() => {
    if (!assessments || assessments.length === 0) {
      setGlobalNote(null);
      return;
    }
    const filtered = filterAssessmentsByPeriod(assessments, period);
    if (filtered.length === 0) {
      setGlobalNote(null);
      return;
    }
    const metricsKeys: Array<keyof typeof filtered[number]> = [
      'concentration',
      'participation',
      'preparation',
      'improvement',
      'retention',
      'comprehension',
      'time_management',
      'collaboration',
    ];
    const averages = metricsKeys.map((k) => average(filtered.map((a: any) => a[k] as number)));
    const overall = average(averages);
    setGlobalNote(Number.isFinite(overall) ? overall : null);
  }, [assessments, period]);

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
    // Recharger les données du dashboard
    window.location.reload();
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

        {/* Diagramme en barres filtrable */}
        <div className="mt-10 animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-black dark:text-white">Évolution des indicateurs</h2>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value as any)}
              className="border border-stroke dark:border-strokedark bg-transparent rounded px-2 py-1 text-sm"
            >
              <option value="session">Par séance</option>
              <option value="week">Par semaine</option>
              <option value="month">Par mois</option>
              <option value="year">Par année</option>
            </select>
          </div>
          <BarChart assessments={assessments} period={period} />
        </div>
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

  // Si pas de données, ne rien afficher (design original sans fallback étendu)
  if (!dashboardData) {
    return null;
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

function BarChart({ assessments, period }: { assessments: any[]; period: 'session' | 'week' | 'month' | 'year' }) {
  const buckets = groupAssessments(assessments, period);
  const categories = [
    { key: 'concentration', label: 'Concentration' },
    { key: 'participation', label: 'Participation' },
    { key: 'preparation', label: 'Préparation' },
    { key: 'improvement', label: 'Amélioration' },
    { key: 'retention', label: 'Rétention' },
    { key: 'comprehension', label: 'Compréhension' },
    { key: 'time_management', label: 'Gestion du temps' },
    { key: 'collaboration', label: 'Collaboration' },
  ] as const;

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[720px]">
        {Object.keys(buckets).length === 0 ? (
          <div className="text-waterloo dark:text-manatee text-sm">Aucune donnée disponible.</div>
        ) : (
          Object.entries(buckets).map(([label, items]) => (
            <div key={label} className="mb-6">
              <div className="text-sm text-waterloo dark:text-manatee mb-2">{label}</div>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                {categories.map((cat) => {
                  const avg = average(items.map((a: any) => a[cat.key] as number));
                  return (
                    <div key={cat.key} className="p-3 rounded border border-stroke dark:border-strokedark">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm">{cat.label}</span>
                        <span className="text-sm font-medium">{avg.toFixed(1)}/5</span>
                      </div>
                      <Bar value={avg} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function Bar({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded">
      <div
        className="h-3 bg-primary rounded"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

function groupAssessments(list: any[], period: 'session' | 'week' | 'month' | 'year') {
  const map: Record<string, any[]> = {};
  for (const a of list) {
    const dt = new Date(a.created_at || a.updated_at || Date.now());
    let key = '';
    if (period === 'session') key = new Date(dt).toLocaleString('fr-FR');
    if (period === 'week') key = `${dt.getFullYear()}-S${getWeek(dt)}`;
    if (period === 'month') key = `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, '0')}`;
    if (period === 'year') key = `${dt.getFullYear()}`;
    if (!map[key]) map[key] = [];
    map[key].push(a);
  }
  return map;
}

function filterAssessmentsByPeriod(list: any[], period: 'session' | 'week' | 'month' | 'year') {
  if (!list || list.length === 0) return [];
  if (period === 'session') {
    // dernière séance évaluée
    return [list[0]];
  }
  const now = new Date();
  let from = new Date(now);
  if (period === 'week') from.setDate(now.getDate() - 7);
  if (period === 'month') from.setDate(now.getDate() - 30);
  if (period === 'year') from.setDate(now.getDate() - 365);
  return list.filter((a) => {
    const dt = new Date(a.created_at || a.updated_at || Date.now());
    return dt >= from && dt <= now;
  });
}

function getWeek(date: Date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((target as any) - (yearStart as any)) / 86400000 + 1) / 7);
  return weekNo;
}

function average(arr: number[]) {
  if (!arr || arr.length === 0) return 0;
  return arr.reduce((a, b) => a + b, 0) / arr.length;
}
