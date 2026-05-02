"use client";

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import ConfirmationModal from "@/components/ConfirmationModal";
import AlertModal from "@/components/AlertModal";
import { useAuth } from '@/hooks/useAuth';
import { useRealtimeSessions } from '@/hooks/useRealtimeSessions';

interface DashboardData {
  stats: Array<{ label: string; value: string; color: string; icon: string }>;
  upcomingSessions: Array<{ 
    id: string; 
    date: string; 
    time: string; 
    duration: number; 
    type: string; 
    participants: string; 
    subject: string;
    status: string;
  }>;
  recentSessions: Array<{ 
    id: string; 
    course: string; 
    type: string; 
    date: string; 
    time: string; 
    duration: number; 
    status: string; 
    participants: string[];
    rating?: number;
    topics?: string;
    homework?: string;
  }>;
  quickActions: Array<{ title: string; description: string; action: string; icon: string; color: string }>;
  tutorInfo?: {
    name: string;
    email: string;
    memberSince: string;
  };
}

export default function TutorHome() {
  const { user, loading: authLoading } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancellingSessionId, setCancellingSessionId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [sessionToCancel, setSessionToCancel] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    try {
      const res = await fetch('/api/tutor/dashboard', { credentials: 'include', cache: 'no-store' });
      if (res.ok) {
        setData(await res.json());
      } else {
        setData(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  useRealtimeSessions({
    userId: user?.id,
    role: "tutor",
    enabled: !!user && !authLoading,
    onChange: () => {
      void loadDashboard();
    },
  });

  const handleCancelSession = (sessionId: string) => {
    setSessionToCancel(sessionId);
    setShowConfirmModal(true);
  };

  const confirmCancelSession = async () => {
    if (!sessionToCancel) return;

    try {
      setCancellingSessionId(sessionToCancel);
      
      const res = await fetch('/api/sessions/cancel', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ sessionId: sessionToCancel }),
      });

      if (res.ok) {
        await loadDashboard();
        setAlertTitle('Succès');
        setAlertMessage('Séance annulée avec succès. Les participants ont été notifiés.');
        setAlertType('success');
        setShowAlertModal(true);
      } else {
        const data = await res.json();
        if (data.hoursUntilSession) {
          setAlertTitle('Impossible d\'annuler');
          setAlertMessage(`Il reste moins de 24h avant le début (${data.hoursUntilSession}h restantes).`);
          setAlertType('warning');
        } else {
          setAlertTitle('Erreur');
          setAlertMessage(`Erreur lors de l'annulation: ${data.error}`);
          setAlertType('error');
        }
        setShowAlertModal(true);
      }
    } catch (error) {
      console.error('Error cancelling session:', error);
      setAlertTitle('Erreur');
      setAlertMessage('Une erreur est survenue lors de l\'annulation.');
      setAlertType('error');
      setShowAlertModal(true);
    } finally {
      setCancellingSessionId(null);
      setSessionToCancel(null);
    }
  };

  if (loading) return <div className="p-6">Chargement…</div>;
  if (!data) return <div className="p-6">Aucune donnée</div>;

  return (
    <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
      <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
        <div className="animate_top">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">
                {data.tutorInfo ? `Bonjour ${data.tutorInfo.name.split(' ')[0]} !` : 'Espace Tuteur'}
              </h1>
              <p className="mt-4 text-para2 text-waterloo dark:text-manatee">
                {data.tutorInfo ? `Membre depuis ${data.tutorInfo.memberSince}` : 'Vos séances, messages et raccourcis utiles.'}
              </p>
            </div>
            {data.tutorInfo && (
              <div className="text-right">
                <p className="text-sm text-waterloo dark:text-manatee">{data.tutorInfo.email}</p>
                <p className="text-xs text-waterloo dark:text-manatee">Tuteur certifié</p>
              </div>
            )}
          </div>
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
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-black dark:text-white">{s.subject}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        s.status === 'PENDING' ? 'bg-red-100 text-red-700' : 
                        s.status === 'IN_PROGRESS' ? 'bg-green-100 text-green-700' : 
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {s.status === 'PENDING' ? 'En attente' : 
                         s.status === 'IN_PROGRESS' ? 'En cours' : 
                         'Programmée'}
                      </span>
                    </div>
                    <p className="text-sm text-waterloo dark:text-manatee">avec {s.participants} • {s.duration}min</p>
                    <p className="text-xs text-waterloo dark:text-manatee mt-1">
                      {s.date === new Date().toLocaleDateString('fr-FR') ? 'Aujourd\'hui' : s.date} • {s.time} • {s.type}
                    </p>
                    <div className="text-xs text-waterloo dark:text-manatee mt-1">
                      {s.date === new Date().toLocaleDateString('fr-FR') ? '🕐 Aujourd\'hui' : s.date === new Date(Date.now() + 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR') ? '🕐 Demain' : '🕐 ' + s.date}
                    </div>
                    <div className="flex gap-2 mt-3">
                      {s.status === 'IN_PROGRESS' || s.status === 'SCHEDULED' ? (
                        <a
                          href={`/live/${s.id}`}
                          className="inline-flex items-center rounded-md bg-primary px-3 py-1 text-xs font-medium text-white hover:opacity-90"
                        >
                          Rejoindre
                        </a>
                      ) : null}
                      {s.status === 'SCHEDULED' || s.status === 'PENDING' ? (
                        <button
                          disabled={cancellingSessionId === s.id}
                          onClick={() => handleCancelSession(s.id)}
                          className="inline-flex items-center rounded-md bg-red-600 px-3 py-1 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50"
                        >
                          {cancellingSessionId === s.id ? 'Annulation...' : 'Annuler'}
                        </button>
                      ) : null}
                    </div>
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
                      {s.rating && (
                        <div className="flex items-center mt-2">
                          <span className="text-xs text-waterloo dark:text-manatee mr-2">Note:</span>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span key={i} className={`text-sm ${i < s.rating! ? 'text-yellow-400' : 'text-gray-300'}`}>⭐</span>
                            ))}
                            <span className="text-xs text-waterloo dark:text-manatee ml-1">({s.rating}/5)</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className={`text-sm font-medium ${s.status === 'COMPLETED' ? 'text-green-600' : s.status === 'CANCELLED' ? 'text-red-600' : 'text-gray-600'}`}>
                      {s.status === 'COMPLETED' ? 'Terminée' : s.status === 'CANCELLED' ? 'Annulée' : s.status}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmCancelSession}
        title="Annuler la séance"
        message="Êtes-vous sûr de vouloir annuler cette séance ?"
        confirmText="Annuler"
        cancelText="Garder"
        type="warning"
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={showAlertModal}
        onClose={() => setShowAlertModal(false)}
        title={alertTitle}
        message={alertMessage}
        type={alertType}
      />
    </main>
  );
}
