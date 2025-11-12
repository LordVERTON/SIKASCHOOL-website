"use client";
import { useEffect, useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

interface StudentLeadDetails {
  civility?: string;
  guardianFirstName?: string;
  guardianLastName?: string;
  email?: string;
  phone?: string;
  zip?: string;
  level?: string;
  subject?: string;
  goal?: string;
  goalOther?: string;
  goalSummary?: string;
  contest?: string;
  capturedAt?: string;
}

interface StudentData {
  id: string;
  nom: string;
  niveau: string;
  matiere: string;
  statut: string;
  dernier: string;
  avatar?: string;
  email: string;
  academic_goals: string;
  intake?: StudentLeadDetails | null;
  phone?: string;
  postalCode?: string;
}

interface StudentSessions {
  student: any;
  sessions: any[];
  sessionsByMonth: any;
  statistics: {
    totalSessions: number;
    completedSessions: number;
    totalHours: number;
    averageRating: number;
    lastSession: any;
  };
}

export default function TutorEleves() {
  const [rows, setRows] = useState<StudentData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeOnly, setActiveOnly] = useState(true);
  const [activeTabByStudent, setActiveTabByStudent] = useState<any>({});
  const [selectedMonthByStudent, setSelectedMonthByStudent] = useState<any>({});
  const [studentSessions, setStudentSessions] = useState<Record<string, StudentSessions>>({});
  const [loadingSessions, setLoadingSessions] = useState<Record<string, boolean>>({});
  
  const monthOptions = useMemo(() => {
    const now = new Date();
    const arr: Array<{ value: string; label: string }> = [];
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const value = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      const label = d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
      arr.push({ value, label });
    }
    return arr;
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch('/api/tutor/students', { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          const mapped = (data.students || []).map((s: any) => {
            const intake: StudentLeadDetails | null = s.intake || null;
            return {
              id: s.id,
              nom: s.name,
              niveau: s.level,
              matiere: s.preferredSubject || intake?.subject || s.academic_goals || 'Général',
              statut: 'Actif',
              dernier: s.assignedAt ? new Date(s.assignedAt).toLocaleDateString('fr-FR') : '—',
              avatar: s.avatar_url || '/images/user/user-01.png',
              email: s.email,
              academic_goals: s.academic_goals || '',
              intake,
              phone: s.phone || intake?.phone || '',
              postalCode: s.postalCode || intake?.zip || ''
            } as StudentData;
          });
          setRows(mapped);
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const loadStudentSessions = async (studentId: string) => {
    if (studentSessions[studentId] || loadingSessions[studentId]) return;
    
    setLoadingSessions(prev => ({ ...prev, [studentId]: true }));
    try {
      const res = await fetch(`/api/tutor/student-sessions?studentId=${studentId}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setStudentSessions(prev => ({ ...prev, [studentId]: data }));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des sessions:', error);
    } finally {
      setLoadingSessions(prev => ({ ...prev, [studentId]: false }));
    }
  };

  if (loading) {
    return (
      <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
        <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
          <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">Mes élèves</h1>
          <div className="mt-10 animate-pulse h-40 rounded-lg border border-stroke dark:border-strokedark"></div>
        </div>
      </main>
    );
  }

  return (
    <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
      <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
        <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">Mes élèves</h1>

        <div className="mt-6 flex items-center justify-between">
          <div className="text-sm text-waterloo dark:text-manatee">Élèves actifs ou récents seulement</div>
          <button onClick={() => setActiveOnly(v => !v)} className={`relative h-6 w-11 rounded-full transition ${activeOnly ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'}`} aria-pressed={activeOnly}>
            <span className={`absolute top-0.5 ${activeOnly ? 'right-0.5' : 'left-0.5'} h-5 w-5 rounded-full bg-white transition`}></span>
          </button>
        </div>

        <div className="mt-6 space-y-4">
          {rows.map((r) => (
            <div key={r.id} className="rounded-lg border border-stroke bg-white p-5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="flex items-center gap-4">
                  <Image src={r.avatar || '/images/user/user-01.png'} alt={r.nom} width={48} height={48} className="h-12 w-12 rounded-full object-cover flex-shrink-0" />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-semibold text-black dark:text-white">{r.nom}</h3>
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">{r.niveau}</span>
                      <span className="rounded bg-blue-100 px-2 py-0.5 text-xs text-blue-700 dark:bg-gray-800 dark:text-blue-300">{r.matiere}</span>
                      <span className="rounded bg-green-100 px-2 py-0.5 text-xs text-green-700 dark:bg-gray-800 dark:text-green-300">Dernier cours: {r.dernier}</span>
                    </div>
                    <div className="mt-1 text-xs text-waterloo dark:text-manatee">Statut: {r.statut}</div>
                  </div>
                </div>
                <div className="relative self-start sm:self-auto">
                  <details className="group">
                    <summary className="list-none cursor-pointer rounded-md border border-stroke px-3 py-1.5 text-sm text-black transition hover:opacity-90 dark:border-strokedark dark:text-white">Actions</summary>
                    <div className="absolute right-0 z-10 mt-2 w-56 rounded-md border border-stroke bg-white p-1 shadow-lg dark:border-strokedark dark:bg-blacksection">
                      <a href={`/tutor/eleves?declare=${encodeURIComponent(r.id)}`} className="block rounded px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Déclarer un cours</a>
                      <a href={`/tutor/eleves?end=${encodeURIComponent(r.id)}`} className="block rounded px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Signaler la fin des cours</a>
                      <Link href={`/tutor/statistics?student=${encodeURIComponent(r.id)}`} className="block rounded px-3 py-2 text-sm hover:bg-gray-50 dark:hover:bg-gray-800">Statistiques</Link>
                    </div>
                  </details>
                </div>
              </div>

              <div className="mt-4">
                <div className="flex items-center gap-4 border-b border-stroke pb-2 text-sm dark:border-strokedark overflow-x-auto">
                  <button onClick={() => {
                    setActiveTabByStudent((s: any) => ({ ...s, [r.id]: 'cours' }));
                    loadStudentSessions(r.id);
                  }} className={`${(activeTabByStudent[r.id] ?? 'cours') === 'cours' ? 'text-primary' : 'text-waterloo dark:text-manatee'}`}>Cours</button>
                  <button onClick={() => setActiveTabByStudent((s: any) => ({ ...s, [r.id]: 'coord' }))} className={`${(activeTabByStudent[r.id] ?? 'cours') === 'coord' ? 'text-primary' : 'text-waterloo dark:text-manatee'}`}>Coordonnées</button>
                </div>

                {(activeTabByStudent[r.id] ?? 'cours') === 'cours' && (
                  <div className="mt-3">
                    {loadingSessions[r.id] ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                        <span className="ml-2 text-sm text-waterloo dark:text-manatee">Chargement des sessions...</span>
                      </div>
                    ) : studentSessions[r.id] ? (
                      <>
                        <div className="mb-4 grid gap-4 md:grid-cols-4">
                          <div className="rounded-lg border border-stroke bg-gray-50 p-3 text-center dark:border-strokedark dark:bg-gray-800">
                            <div className="text-2xl font-bold text-primary">{studentSessions[r.id].statistics.totalSessions}</div>
                            <div className="text-xs text-waterloo dark:text-manatee">Sessions totales</div>
                          </div>
                          <div className="rounded-lg border border-stroke bg-gray-50 p-3 text-center dark:border-strokedark dark:bg-gray-800">
                            <div className="text-2xl font-bold text-green-600">{studentSessions[r.id].statistics.completedSessions}</div>
                            <div className="text-xs text-waterloo dark:text-manatee">Terminées</div>
                          </div>
                          <div className="rounded-lg border border-stroke bg-gray-50 p-3 text-center dark:border-strokedark dark:bg-gray-800">
                            <div className="text-2xl font-bold text-blue-600">{studentSessions[r.id].statistics.totalHours}h</div>
                            <div className="text-xs text-waterloo dark:text-manatee">Heures totales</div>
                          </div>
                          <div className="rounded-lg border border-stroke bg-gray-50 p-3 text-center dark:border-strokedark dark:bg-gray-800">
                            <div className="text-2xl font-bold text-yellow-600">{studentSessions[r.id].statistics.averageRating}/5</div>
                            <div className="text-xs text-waterloo dark:text-manatee">Note moyenne</div>
                          </div>
                        </div>
                        
                        <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                          <select
                            value={selectedMonthByStudent[r.id] || monthOptions[0]?.value}
                            onChange={(e) => setSelectedMonthByStudent((s: any) => ({ ...s, [r.id]: e.target.value }))}
                            className="w-full rounded-md border border-stroke bg-transparent px-2 py-1 text-sm dark:border-strokedark sm:w-auto"
                          >
                            {monthOptions.map(m => (
                              <option key={m.value} value={m.value}>{m.label}</option>
                            ))}
                          </select>
                        </div>
                        
                        {(() => {
                          const selectedMonth = selectedMonthByStudent[r.id] || monthOptions[0]?.value;
                          const monthSessions = studentSessions[r.id].sessionsByMonth[selectedMonth] || [];
                          const monthHours = monthSessions.filter((s: any) => s.status === 'COMPLETED').reduce((sum: number, s: any) => sum + (s.duration_minutes || 0), 0) / 60;
                          
                          return (
                            <>
                              <div className="rounded-md border border-stroke p-3 text-sm dark:border-strokedark">
                                {monthSessions.length} session(s) pour un total de {Math.round(monthHours * 10) / 10}h
                              </div>
                              {monthSessions.length > 0 ? (
                                <div className="mt-2 overflow-x-auto">
                                  <table className="w-full text-left text-sm">
                                    <thead>
                                      <tr className="text-waterloo dark:text-manatee">
                                        <th className="py-2 pr-4">Date</th>
                                        <th className="py-2 pr-4">Matière</th>
                                        <th className="py-2 pr-4">Durée</th>
                                        <th className="py-2 pr-0">Statut</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {monthSessions.map((session: any, idx: number) => (
                                        <tr key={idx} className="border-t border-stroke dark:border-strokedark">
                                          <td className="py-2 pr-4">{new Date(session.started_at).toLocaleDateString('fr-FR')}</td>
                                          <td className="py-2 pr-4">{session.subject}</td>
                                          <td className="py-2 pr-4">{session.duration_minutes}min</td>
                                          <td className="py-2 pr-0">
                                            <span className={`rounded px-2 py-0.5 text-xs ${
                                              session.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-gray-800 dark:text-green-300' :
                                              session.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700 dark:bg-gray-800 dark:text-blue-300' :
                                              session.status === 'PENDING' ? 'bg-red-100 text-red-700 dark:bg-gray-800 dark:text-red-300' :
                                              session.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700 dark:bg-gray-800 dark:text-yellow-300' :
                                              'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                                            }`}>
                                              {session.status === 'COMPLETED' ? 'Terminée' :
                                               session.status === 'SCHEDULED' ? 'Programmée' :
                                               session.status === 'PENDING' ? 'En attente' :
                                               session.status === 'IN_PROGRESS' ? 'En cours' :
                                               session.status}
                                            </span>
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              ) : (
                                <div className="text-center py-4 text-sm text-waterloo dark:text-manatee">
                                  Aucune session pour ce mois
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </>
                    ) : (
                      <div className="text-center py-4 text-sm text-waterloo dark:text-manatee">
                        Cliquez sur "Cours" pour charger les sessions
                      </div>
                    )}
                  </div>
                )}


                {(activeTabByStudent[r.id] ?? 'cours') === 'coord' && (
                  <div className="mt-3 grid gap-6 md:grid-cols-2 text-sm">
                    <div>
                      <h4 className="mb-2 font-medium text-black dark:text-white">Informations étudiant</h4>
                      <div className="space-y-2">
                        <div>
                          <span className="font-medium text-waterloo dark:text-manatee">Nom complet:</span>
                          <div className="text-black dark:text-white">{r.nom}</div>
                        </div>
                        <div>
                          <span className="font-medium text-waterloo dark:text-manatee">Email:</span>
                          <div className="text-black dark:text-white">{r.email}</div>
                        </div>
                        <div>
                          <span className="font-medium text-waterloo dark:text-manatee">Niveau:</span>
                          <div className="text-black dark:text-white">{r.niveau}</div>
                        </div>
                        <div>
                          <span className="font-medium text-waterloo dark:text-manatee">Objectifs académiques:</span>
                          <div className="text-black dark:text-white">
                            {r.intake?.goalSummary || r.intake?.goalOther || r.intake?.goal || r.academic_goals || 'Non spécifiés'}
                          </div>
                          {r.intake?.contest && (
                            <div className="text-xs text-waterloo dark:text-manatee mt-1">
                              Concours visé : {r.intake.contest}
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-medium text-waterloo dark:text-manatee">Dernière activité:</span>
                          <div className="text-black dark:text-white">{r.dernier}</div>
                        </div>
                        <div>
                          <span className="font-medium text-waterloo dark:text-manatee">Téléphone:</span>
                          <div className="text-black dark:text-white">{r.phone || '—'}</div>
                        </div>
                        <div>
                          <span className="font-medium text-waterloo dark:text-manatee">Code postal:</span>
                          <div className="text-black dark:text-white">{r.postalCode || '—'}</div>
                        </div>
                        {r.intake && (
                          <div>
                            <span className="font-medium text-waterloo dark:text-manatee">Responsable légal:</span>
                            <div className="text-black dark:text-white">
                              {r.intake.civility ? `${r.intake.civility} ` : ''}
                              {[r.intake.guardianFirstName, r.intake.guardianLastName].filter(Boolean).join(' ') || 'Non communiqué'}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="mb-2 font-medium text-black dark:text-white">Actions rapides</h4>
                      <div className="space-y-2">
                        <Link 
                          href={`/tutor/calendar?student=${encodeURIComponent(r.id)}`}
                          className="block w-full rounded-md border border-stroke px-3 py-2 text-center text-sm text-primary transition hover:opacity-90 dark:border-strokedark"
                        >
                          Voir le calendrier
                        </Link>
                        <Link 
                          href={`/tutor/statistics?student=${encodeURIComponent(r.id)}`}
                          className="block w-full rounded-md border border-stroke px-3 py-2 text-center text-sm text-primary transition hover:opacity-90 dark:border-strokedark"
                        >
                          Statistiques détaillées
                        </Link>
                        <button 
                          onClick={() => {
                            setActiveTabByStudent((s: any) => ({ ...s, [r.id]: 'cours' }));
                            loadStudentSessions(r.id);
                          }}
                          className="block w-full rounded-md border border-stroke px-3 py-2 text-center text-sm text-primary transition hover:opacity-90 dark:border-strokedark"
                        >
                          Voir les sessions
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}


