"use client";
/* eslint-disable react-hooks/rules-of-hooks */
// Link not used on this page
import { useEffect, useMemo, useState } from "react";

export default function TutorCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const [sessions, setSessions] = useState<Array<{ id: string; started_at: string; course: string; type: string; status: string; student: string }>>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];
  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();
  const calendarDays: Array<number | null> = [];
  for (let i = 0; i < firstDayWeekday; i++) calendarDays.push(null);
  for (let day = 1; day <= daysInMonth; day++) calendarDays.push(day);

  useEffect(() => {
    const start = new Date(currentYear, currentMonth, 1);
    const end = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59, 999);
    const startISO = start.toISOString();
    const endISO = end.toISOString();
    const load = async () => {
      const res = await fetch(`/api/tutor/sessions?start=${encodeURIComponent(startISO)}&end=${encodeURIComponent(endISO)}`, { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        setSessions((data.sessions || []).map((s: any) => ({
          id: s.id,
          started_at: s.started_at,
          course: s.course,
          type: s.type,
          status: s.status,
          student: s.student,
        })));
      }
    };
    load();
  }, [currentMonth, currentYear]);

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

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
  };

  return (
    <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
      <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
        <div className="animate_top">
          <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">
            Calendrier (tuteur)
          </h1>
          <p className="mt-4 text-para2 text-waterloo dark:text-manatee">
            Vue des séances planifiées avec vos élèves.
          </p>
        </div>

        <div className="mt-10 grid gap-7.5 lg:grid-cols-4">
          <div className="lg:col-span-3">
            <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-black dark:text-white">
                  {monthNames[currentMonth]} {currentYear}
                </h2>
                <div className="flex gap-2">
                  <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1, 1))} className="p-2 border border-stroke rounded-lg hover:opacity-90 dark:border-strokedark">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/></svg>
                  </button>
                  <button onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1, 1))} className="p-2 border border-stroke rounded-lg hover:opacity-90 dark:border-strokedark">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/></svg>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1">
                {dayNames.map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-waterloo dark:text-manatee">{day}</div>
                ))}
                {calendarDays.map((day, index) => (
                  <div key={index} className={`min-h-[80px] p-2 border border-stroke dark:border-strokedark ${day ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer' : ''}`} onClick={() => day && setSelectedDate(`${currentYear}-${String(currentMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`)}>
                    {day && (
                      <>
                        <div className={`text-sm font-medium mb-1 ${isToday(day) ? 'text-primary' : 'text-black dark:text-white'}`}>{day}</div>
                        <div className="space-y-1">
                          {(sessionsByDay.get(`${currentYear}-${String(currentMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`) || []).slice(0,2).map((s, idx) => (
                            <div key={idx} className={`text-xs p-1 rounded text-white truncate ${s.status === 'SCHEDULED' ? 'bg-blue-500' : s.status === 'IN_PROGRESS' ? 'bg-yellow-600' : 'bg-green-600'}`} title={`${s.course} • ${s.student}`}>
                              {new Date(s.started_at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})} {s.course}
                            </div>
                          ))}
                          {(sessionsByDay.get(`${currentYear}-${String(currentMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`) || []).length > 2 && (
                            <div className="text-[10px] text-waterloo dark:text-manatee">+{(sessionsByDay.get(`${currentYear}-${String(currentMonth + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`) || []).length - 2} de plus</div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="space-y-6">
              <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Prochaines séances</h3>
                <div className="space-y-3">
                  {sessions.filter(s => new Date(s.started_at) >= new Date()).sort((a,b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime()).slice(0,4).map((s) => (
                    <div key={s.id} className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full mt-1.5 ${s.status === 'SCHEDULED' ? 'bg-blue-500' : s.status === 'IN_PROGRESS' ? 'bg-yellow-600' : 'bg-green-600'}`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black dark:text-white truncate">{s.course} • {s.student}</p>
                        <p className="text-xs text-waterloo dark:text-manatee">{new Date(s.started_at).toLocaleDateString('fr-FR')} • {new Date(s.started_at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Légende</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-500"></div><span className="text-sm text-black dark:text-white">Programmée</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-yellow-600"></div><span className="text-sm text-black dark:text-white">En cours</span></div>
                  <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-green-600"></div><span className="text-sm text-black dark:text-white">Terminée</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setSelectedDate(null)}>
          <div className="bg-white dark:bg-blacksection rounded-lg p-6 w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-black dark:text-white">Séances du {new Date(selectedDate).toLocaleDateString('fr-FR')}</h3>
              <button className="text-waterloo dark:text-manatee" onClick={() => setSelectedDate(null)}>✕</button>
            </div>
            <div className="space-y-3 max-h-[60vh] overflow-auto">
              {(() => {
                const d = new Date(selectedDate);
                const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
                return (sessionsByDay.get(key) || []).map((s, idx) => (
                  <div key={idx} className="rounded-lg border border-stroke dark:border-strokedark p-3">
                    <div className="flex items-center justify-between">
                      <div className="text-sm text-black dark:text-white font-medium">{s.course} • {s.student}</div>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${s.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-700' : s.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>{s.status}</span>
                    </div>
                    <div className="text-xs text-waterloo dark:text-manatee mt-1">{new Date(s.started_at).toLocaleTimeString('fr-FR',{hour:'2-digit',minute:'2-digit'})}</div>
                    <div className="mt-3 flex justify-end">
                      <a
                        href={`/live/${s.id}`}
                        className="inline-flex items-center rounded-md bg-primary px-3 py-1 text-xs font-medium text-white hover:opacity-90"
                      >
                        Rejoindre
                      </a>
                    </div>
                  </div>
                ));
              })()}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}


