"use client";
/* eslint-disable react-hooks/rules-of-hooks */
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import ConfirmationModal from "@/components/ConfirmationModal";
import AlertModal from "@/components/AlertModal";
import { useAuth } from "@/hooks/useAuth";
import { useRealtimeSessions } from "@/hooks/useRealtimeSessions";

export default function StudentCalendar() {
  const { user, loading: authLoading } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const [sessions, setSessions] = useState<Array<{ id: string; started_at: string; subject: string; type: string; status: string; tutor: string }>>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createDate, setCreateDate] = useState<string | null>(null);
  const [tutors, setTutors] = useState<Array<{ id: string; name: string }>>([]);
  const [cancellingSessionId, setCancellingSessionId] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showAlertModal, setShowAlertModal] = useState(false);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertTitle, setAlertTitle] = useState('');
  const [alertType, setAlertType] = useState<'success' | 'error' | 'warning' | 'info'>('info');
  const [sessionToCancel, setSessionToCancel] = useState<string | null>(null);
  
  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  const loadSessions = useMemo(() => async () => {
    const start = new Date(currentYear, currentMonth, 1);
    const end = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
    const startISO = start.toISOString();
    const endISO = end.toISOString();
    const res = await fetch(`/api/student/sessions?start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`, {
      credentials: 'include',
      cache: 'no-store',
    });
    if (res.ok) {
      const data = await res.json();
      setSessions((data.sessions || []).map((s: any) => ({
        id: s.id,
        started_at: s.started_at,
        subject: s.course,
        type: s.type,
        status: s.status,
        tutor: s.tutor,
      })));
    }
  }, [currentMonth, currentYear]);

  // Fetch sessions for current month
  useEffect(() => {
    void loadSessions();
  }, [loadSessions]);

  useRealtimeSessions({
    userId: user?.id,
    role: "student",
    enabled: !!user && !authLoading,
    onChange: () => {
      void loadSessions();
    },
  });

  useEffect(() => {
    const loadTutors = async () => {
      const res = await fetch('/api/student/assigned-tutors', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setTutors((data.tutors || []).map((t: any) => ({ id: t.id, name: t.name })));
      }
    };
    loadTutors();
  }, []);

  // Generate calendar days
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const calendarDays = [];
  
  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const sessionsByDay = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const s of sessions) {
      const d = new Date(s.started_at);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(s);
    }
    return map;
  }, [sessions]);

  const getSessionsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return sessionsByDay.get(dateStr) || [];
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
  };

  const canCancelSession = (sessionStartTime: string) => {
    const startTime = new Date(sessionStartTime);
    const now = new Date();
    const timeDifference = startTime.getTime() - now.getTime();
    const hoursUntilSession = timeDifference / (1000 * 60 * 60);
    return hoursUntilSession >= 24;
  };

  const getStatusLabel = (status: string) => {
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
        await loadSessions();
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

  return (
    <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
      <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
        <div className="animate_top">
          <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">
            Calendrier
          </h1>
          <p className="mt-4 text-para2 text-waterloo dark:text-manatee">
            Consultez votre planning et vos séances.
          </p>
        </div>

        <div className="mt-10 grid gap-7.5 grid-cols-1">
          {/* Calendar */}
          <div className="col-span-1">
            <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-black dark:text-white">
                  {monthNames[currentMonth]} {currentYear}
                </h2>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))} className="p-2 border border-stroke rounded-lg hover:opacity-90 dark:border-strokedark">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                    </svg>
                  </button>
                  <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))} className="p-2 border border-stroke rounded-lg hover:opacity-90 dark:border-strokedark">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Calendar Grid (desktop) */}
              <div className="hidden grid-cols-7 gap-1 lg:grid">
                {/* Day headers */}
                {dayNames.map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-waterloo dark:text-manatee">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {calendarDays.map((day, index) => (
                  <div key={index} className={`min-h-[80px] p-2 border border-stroke dark:border-strokedark ${
                    day ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer' : ''
                  }`} onClick={() => {
                    if (day) {
                      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
                      setSelectedDate(dateStr);
                      setCreateDate(dateStr);
                    }
                  }}>
                    {day && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${
                          isToday(day) 
                            ? 'text-primary' 
                            : 'text-black dark:text-white'
                        }`}>
                          {day}
                        </div>
                        <div className="space-y-1">
                          {getSessionsForDay(day)
                            .sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime()) // Tri chronologique
                            .slice(0,2).map((s, idx) => (
                            <div key={idx} className={`text-xs p-1 rounded text-white truncate ${s.status === 'PENDING' ? 'bg-red-300' : s.status === 'SCHEDULED' ? 'bg-blue-500' : s.status === 'IN_PROGRESS' ? 'bg-yellow-600' : 'bg-green-600'}`} title={`${s.subject} • ${s.tutor}`}>
                              {s.started_at.split('T')[1]?.split(':').slice(0,2).join(':')} {s.subject}
                            </div>
                          ))}
                          {getSessionsForDay(day).length > 2 && (
                            <div className="text-[10px] text-waterloo dark:text-manatee">+{getSessionsForDay(day).length - 2} de plus</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>

              {/* Mobile agenda list */}
              <div className="block lg:hidden">
                <div className="space-y-4">
                  <div className="sticky top-0 z-10 -mx-3 mb-2 px-3 pt-2 bg-white/80 backdrop-blur dark:bg-blacksection/80">
                    <button
                      onClick={() => {
                        const today = new Date();
                        const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2,'0')}-${String(today.getDate()).padStart(2,'0')}`;
                        setSelectedDate(dateStr);
                        setCreateDate(dateStr);
                        setShowCreateModal(true);
                      }}
                      className="w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-white hover:opacity-90"
                    >
                      Nouvelle séance
                    </button>
                  </div>
                  {[...sessionsByDay.keys()].sort().map((key) => (
                    <div key={key} className="rounded-lg border border-stroke dark:border-strokedark p-3">
                      <div className="mb-2 text-sm font-semibold text-black dark:text-white">
                        {key.split('-').reverse().join('/')}
                      </div>
                      <div className="space-y-2">
                        {(sessionsByDay.get(key) || [])
                          .sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime()) // Tri chronologique
                      .map((s, idx) => (
                          <div key={idx} className="w-full rounded-lg border border-stroke dark:border-strokedark p-3">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-black dark:text-white truncate" title={`${s.subject} • ${s.tutor}`}>
                                  {s.subject} • {s.tutor}
                                </div>
                                <div className="text-xs text-waterloo dark:text-manatee">
                                  {s.started_at.split('T')[1]?.split(':').slice(0,2).join(':')} • {s.type}
                                </div>
                              </div>
                              <div className="shrink-0 flex items-center gap-2">
                                <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === 'PENDING' ? 'bg-red-100 text-red-700' : s.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' : s.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{getStatusLabel(s.status)}</span>
                              </div>
                            </div>
                            <div className="mt-3 flex items-center justify-end gap-2">
                              {(s.status === 'SCHEDULED' || s.status === 'IN_PROGRESS') && (
                                <a
                                  href={`/live/${s.id}`}
                                  className="inline-flex items-center rounded-md bg-primary px-3 py-1 text-xs font-medium text-white hover:opacity-90"
                                >
                                  Rejoindre
                                </a>
                              )}
                              {(s.status === 'PENDING' || s.status === 'SCHEDULED') && (
                                <button
                                  disabled={!canCancelSession(s.started_at) || cancellingSessionId === s.id}
                                  onClick={() => handleCancelSession(s.id)}
                                  className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50 ${canCancelSession(s.started_at) ? 'bg-red-600' : 'bg-gray-400'}`}
                                >
                                  {cancellingSessionId === s.id ? 'Annulation...' : 'Annuler'}
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar (now stacked below on all sizes) */}
          <div className="col-span-1">
            <div className="space-y-6">
              {/* Upcoming Sessions */}
              <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Prochaines séances</h3>
                <div className="space-y-3">
                  {sessions
                    .filter(s => new Date(s.started_at) >= new Date())
                    .sort((a,b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime())
                    .slice(0,4)
                    .map((s) => (
                    <div key={s.id} className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full mt-1.5 ${s.status === 'PENDING' ? 'bg-red-300' : s.status === 'SCHEDULED' ? 'bg-blue-500' : s.status === 'IN_PROGRESS' ? 'bg-yellow-600' : 'bg-green-600'}`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black dark:text-white truncate">
                          {s.subject} • {s.tutor}
                        </p>
                        <p className="text-xs text-waterloo dark:text-manatee">
                          {s.started_at.split('T')[0].split('-').reverse().join('/')} • {s.started_at.split('T')[1]?.split(':').slice(0,2).join(':')}
                        </p>
                      </div>
                      {(s.status === 'SCHEDULED' || s.status === 'IN_PROGRESS') && (
                        <a
                          href={`/live/${s.id}`}
                          className="shrink-0 inline-flex items-center rounded-md bg-primary px-2.5 py-1 text-xs font-medium text-white hover:opacity-90"
                        >
                          Rejoindre
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Légende</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-300"></div>
                    <span className="text-sm text-black dark:text-white">En attente</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-black dark:text-white">Programmée</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-600"></div>
                    <span className="text-sm text-black dark:text-white">En cours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-600"></div>
                    <span className="text-sm text-black dark:text-white">Terminée</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Actions rapides</h3>
                <div className="space-y-2">
                  <Link
                    href="/student/messages"
                    className="block w-full text-center rounded-md border border-stroke px-4 py-2 text-primary transition hover:opacity-90 dark:border-strokedark"
                  >
                    Contacter un tuteur
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Details Modal */}
      {selectedDate && !showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedDate(null)}>
          <div className="bg-white dark:bg-blacksection rounded-lg p-6 w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black dark:text-white">Séances du {new Date(selectedDate).toLocaleDateString('fr-FR')}</h3>
              <div className="flex gap-2">
                <button 
                  onClick={() => {
                    setSelectedDate(null);
                    setShowCreateModal(true);
                  }}
                  className="inline-flex items-center rounded-md bg-primary px-3 py-1 text-xs font-medium text-white hover:opacity-90"
                >
                  Nouvelle séance
                </button>
                <button className="text-waterloo dark:text-manatee" onClick={() => setSelectedDate(null)}>✕</button>
              </div>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-auto">
              {(() => {
                const d = new Date(selectedDate);
                const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                return (sessionsByDay.get(key) || [])
                  .sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime()) // Tri chronologique
                  .map((s, idx) => (
                <div key={idx} className="rounded-lg border border-stroke dark:border-strokedark p-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-black dark:text-white font-medium">{s.subject} • {s.tutor}</div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === 'PENDING' ? 'bg-red-100 text-red-700' : s.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' : s.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                      {getStatusLabel(s.status)}
                    </span>
                  </div>
                  <div className="text-xs text-waterloo dark:text-manatee mt-1">
                    {s.started_at.split('T')[1]?.split(':').slice(0,2).join(':')}
                  </div>
                  <div className="mt-3 flex justify-end gap-2">
                    {s.status === 'PENDING' || s.status === 'SCHEDULED' ? (
                      <button
                        disabled={cancellingSessionId === s.id || !canCancelSession(s.started_at)}
                        onClick={() => handleCancelSession(s.id)}
                        className={`inline-flex items-center rounded-md px-3 py-1 text-xs font-medium text-white hover:opacity-90 disabled:opacity-50 ${
                          canCancelSession(s.started_at) 
                            ? 'bg-red-600' 
                            : 'bg-gray-400 cursor-not-allowed'
                        }`}
                        title={!canCancelSession(s.started_at) ? 'Impossible d\'annuler moins de 24h avant le début' : ''}
                      >
                        {cancellingSessionId === s.id ? 'Annulation...' : 'Annuler'}
                      </button>
                    ) : null}
                    {(s.status === 'SCHEDULED' || s.status === 'IN_PROGRESS') && (
                      <a
                        href={`/live/${s.id}`}
                        className="inline-flex items-center rounded-md bg-primary px-3 py-1 text-xs font-medium text-white hover:opacity-90"
                      >
                        Rejoindre
                      </a>
                    )}
                  </div>
                </div>
              ));
              })()}
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
        <CreateSessionModal
          date={createDate}
          tutors={tutors}
          onClose={() => {
            setShowCreateModal(false);
            setCreateDate(null);
            setSelectedDate(null);
          }}
          onSuccess={() => {
            setShowCreateModal(false);
            setCreateDate(null);
            setSelectedDate(null);
            void loadSessions();
          }}
        />
      )}

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

function CreateSessionModal({ date, tutors, onClose, onSuccess }: {
  date: string | null;
  tutors: Array<{ id: string; name: string }>;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    tutorId: '',
    subject: '',
    duration: 60,
    sessionDate: date || '',
    sessionTime: '14:00',
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Stocker l'heure exactement comme saisie par l'utilisateur
      const startedAt = `${formData.sessionDate}T${formData.sessionTime}:00`;
      
      const res = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          tutorId: formData.tutorId,
          subject: formData.subject,
          duration: formData.duration,
          startedAt: startedAt,
        }),
      });
      if (res.ok) {
        onSuccess();
      } else {
        const data = await res.json();
        console.error('Erreur lors de la création:', data.error);
        console.error('Détails de l\'erreur:', data.details);
        // Error handling will be done in the parent component
      }
        } catch {
      console.error('Erreur lors de la création');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white dark:bg-blacksection rounded-lg p-6 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-black dark:text-white">Demander une séance</h3>
          <button className="text-waterloo dark:text-manatee" onClick={onClose}>✕</button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-1">Tuteur</label>
            {tutors.length === 0 ? (
              <div className="w-full rounded-md border border-stroke bg-gray-50 px-3 py-2 text-sm text-gray-500 dark:border-strokedark dark:bg-gray-800 dark:text-gray-400">
                Aucun tuteur assigné. Contactez l'administration pour obtenir des assignations.
              </div>
            ) : (
              <select
                value={formData.tutorId}
                onChange={(e) => setFormData({ ...formData, tutorId: e.target.value })}
                className="w-full rounded-md border border-stroke bg-transparent px-3 py-2 text-sm dark:border-strokedark"
                required
              >
                <option value="">Sélectionner un tuteur</option>
                {tutors.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-1">Matière</label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full rounded-md border border-stroke bg-transparent px-3 py-2 text-sm dark:border-strokedark"
              placeholder="Mathématiques, Physique, etc."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-1">Durée (minutes)</label>
            <select
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
              className="w-full rounded-md border border-stroke bg-transparent px-3 py-2 text-sm dark:border-strokedark"
            >
              <option value={30}>30 minutes</option>
              <option value={60}>1 heure</option>
              <option value={90}>1h30</option>
              <option value={120}>2 heures</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-1">Date</label>
            <input
              type="date"
              value={formData.sessionDate}
              onChange={(e) => setFormData({ ...formData, sessionDate: e.target.value })}
              className="w-full rounded-md border border-stroke bg-transparent px-3 py-2 text-sm dark:border-strokedark"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-black dark:text-white mb-1">Heure</label>
            <input
              type="time"
              value={formData.sessionTime}
              onChange={(e) => setFormData({ ...formData, sessionTime: e.target.value })}
              className="w-full rounded-md border border-stroke bg-transparent px-3 py-2 text-sm dark:border-strokedark"
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-md border border-stroke px-4 py-2 text-sm font-medium text-black transition hover:opacity-90 dark:border-strokedark dark:text-white"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {saving ? 'Demande...' : 'Demander'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}