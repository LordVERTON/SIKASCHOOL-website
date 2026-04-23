"use client";

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatMinutes } from '@/lib/time-utils';
import AssessmentModal from '@/components/Tutor/AssessmentModal';
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeSessions } from '@/hooks/useRealtimeSessions';

interface TutorSessionItem {
  id: string;
  started_at: string;
  course: string;
  type: string;
  level: string;
  participants: string[];
  studentAvatar: string;
  duration: number;
  status: string;
  topics: string[];
  homework: string;
  studentRating: number;
  student_id?: string;
}

export default function TutorHistoryPage() {
  const { user, loading: authLoading } = useAuth();
  const [sessions, setSessions] = useState<TutorSessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [modalSession, setModalSession] = useState<{ id: string; studentId: string; label: string } | null>(null);

  const fetchSessions = useCallback(async () => {
    try {
      const statusParam = filter === 'all' ? '' : (filter === 'completed' ? 'COMPLETED' : 'IN_PROGRESS');
      const url = `/api/tutor/sessions${statusParam ? `?status=${statusParam}` : ''}`;
      const response = await fetch(url, { credentials: 'include', cache: 'no-store' });
      if (response.ok) {
        const data = await response.json();
        setSessions(data.sessions || []);
      }
    } catch (error) {
      console.error('Error fetching tutor sessions:', error);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    setLoading(true);
    void fetchSessions();
  }, [fetchSessions]);

  useRealtimeSessions({
    userId: user?.id,
    role: "tutor",
    enabled: !!user && !authLoading,
    onChange: () => {
      void fetchSessions();
    },
  });

  const reload = () => {
    void fetchSessions();
  };

  const filteredSessions = sessions.filter(session => {
    if (filter === 'all') return true;
    if (filter === 'completed') return session.status === 'COMPLETED';
    if (filter === 'pending') return session.status === 'IN_PROGRESS';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 bg-green-100 dark:bg-green-900';
      case 'IN_PROGRESS':
        return 'text-blue-600 bg-blue-100 dark:bg-blue-900';
      case 'CANCELLED':
        return 'text-red-600 bg-red-100 dark:bg-red-900';
      default:
        return 'text-gray-600 bg-gray-100 dark:bg-gray-900';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Terminée';
      case 'IN_PROGRESS':
        return 'En cours';
      case 'CANCELLED':
        return 'Annulée';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
        <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
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
            Historique des séances
          </h1>
          <p className="mt-4 text-para2 text-waterloo dark:text-manatee">
            Consultez les séances vous concernant.
          </p>
        </div>

        {/* Filtres */}
        <div className="mt-10 animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'all'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Toutes ({sessions.length})
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'completed'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              Terminées ({sessions.filter(s => s.status === 'COMPLETED').length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg transition ${
                filter === 'pending'
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              En cours ({sessions.filter(s => s.status === 'IN_PROGRESS').length})
            </button>
          </div>
        </div>

        {/* Liste des séances */}
        <div className="mt-10 space-y-6">
          {filteredSessions.length > 0 ? (
            filteredSessions.map((session) => {
              const date = new Date(session.started_at);
              const dateStr = date.toLocaleDateString('fr-FR');
              const timeStr = date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
              const studentNames = session.participants && session.participants.length > 0
                ? session.participants.join(', ')
                : 'Étudiant';
              return (
                <div
                  key={session.id}
                  className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start space-x-4">
                      <Image
                        src={session.studentAvatar || '/images/user/user-01.png'}
                        alt={studentNames}
                        width={48}
                        height={48}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-black dark:text-white">
                          {session.course} - {session.type}
                        </h3>
                        <p className="text-waterloo dark:text-manatee">
                          avec {studentNames} • {session.level}
                        </p>
                        <p className="text-sm text-waterloo dark:text-manatee">
                          {dateStr} à {timeStr} • {formatMinutes(session.duration)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(session.status)}`}>
                        {getStatusText(session.status)}
                      </span>
                    </div>
                  </div>

                  {session.topics.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-black dark:text-white mb-2">
                        Sujets abordés:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {session.topics.map((topic, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-primary/10 text-primary text-sm rounded-full"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {session.homework && (
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-black dark:text-white mb-2">
                        Devoirs assignés:
                      </h4>
                      <p className="text-sm text-waterloo dark:text-manatee bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                        {session.homework}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-stroke dark:border-strokedark">
                    <div className="flex items-center space-x-4">
                      {session.studentRating && (
                        <div className="flex items-center">
                          <span className="text-sm text-waterloo dark:text-manatee mr-2">Note de l'étudiant:</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-sm ${
                                  i < session.studentRating ? 'text-yellow-500' : 'text-gray-300'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex space-x-2">
                      {session.status === 'COMPLETED' && (
                        <button
                          onClick={() => {
                            setModalSession({ id: session.id, studentId: session.student_id || '', label: `${session.course} - ${new Date(session.started_at).toLocaleString('fr-FR')}` });
                            setModalOpen(true);
                          }}
                          className="px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition text-sm"
                        >
                          Noter la séance
                        </button>
                      )}
                      <button className="px-4 py-2 border border-stroke dark:border-strokedark text-black dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition text-sm">
                        Voir détails
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection text-center">
              <div className="py-12">
                <div className="text-6xl mb-4">👨‍🏫</div>
                <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                  Aucune séance trouvée
                </h3>
                <p className="text-waterloo dark:text-manatee mb-6">
                  {filter === 'all' 
                    ? "Vous n'avez pas encore de séances enregistrées."
                    : `Aucune séance ${filter === 'completed' ? 'terminée' : 'en cours'} trouvée.`
                  }
                </p>
                <Link
                  href="/tutor"
                  className="inline-flex items-center px-6 py-3 bg-primary text-white rounded-lg hover:opacity-90 transition"
                >
                  Aller au tableau de bord
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Retour au dashboard */}
        <div className="mt-10 text-center">
          <Link
            href="/tutor"
            className="inline-flex items-center px-6 py-3 border border-stroke text-black dark:text-white rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition"
          >
            ← Retour au tableau de bord
          </Link>
        </div>
      </div>
      {modalOpen && (
        <AssessmentModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          sessionId={modalSession?.id || null}
          studentId={modalSession?.studentId || null}
          sessionLabel={modalSession ? `Séance du ${modalSession.label}` : undefined}
          onSuccess={reload}
        />
      )}
    </main>
  );
}


