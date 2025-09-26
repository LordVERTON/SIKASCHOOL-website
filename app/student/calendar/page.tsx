import Link from "next/link";

export default function StudentCalendar() {
  const currentDate = new Date();
  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  
  const monthNames = [
    "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
    "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
  ];

  const dayNames = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  // Mock events data
  const events = [
    {
      id: "1",
      title: "Séance Maths avec M. Dupont",
      date: "2024-09-15",
      time: "14:00",
      type: "cours",
      color: "bg-blue-500"
    },
    {
      id: "2", 
      title: "Rendu devoir Physique",
      date: "2024-09-16",
      time: "23:59",
      type: "devoir",
      color: "bg-red-500"
    },
    {
      id: "3",
      title: "Séance Français avec M. Leroy", 
      date: "2024-09-18",
      time: "16:00",
      type: "cours",
      color: "bg-green-500"
    },
    {
      id: "4",
      title: "Quiz Histoire",
      date: "2024-09-20",
      time: "10:00",
      type: "évaluation",
      color: "bg-purple-500"
    }
  ];

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

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return events.filter(event => event.date === dateStr);
  };

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
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

        <div className="mt-10 grid gap-7.5 lg:grid-cols-4">
          {/* Calendar */}
          <div className="lg:col-span-3">
            <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-black dark:text-white">
                  {monthNames[currentMonth]} {currentYear}
                </h2>
                <div className="flex gap-2">
                  <button className="p-2 border border-stroke rounded-lg hover:opacity-90 dark:border-strokedark">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"/>
                    </svg>
                  </button>
                  <button className="p-2 border border-stroke rounded-lg hover:opacity-90 dark:border-strokedark">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Day headers */}
                {dayNames.map((day) => (
                  <div key={day} className="p-2 text-center text-sm font-medium text-waterloo dark:text-manatee">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {calendarDays.map((day, index) => (
                  <div key={index} className={`min-h-[80px] p-2 border border-stroke dark:border-strokedark ${
                    day ? 'hover:bg-gray-50 dark:hover:bg-gray-800/50' : ''
                  }`}>
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
                          {getEventsForDay(day).map((event) => (
                            <div
                              key={event.id}
                              className={`text-xs p-1 rounded text-white truncate ${event.color}`}
                              title={event.title}
                            >
                              {event.time} {event.title}
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-6">
              {/* Upcoming Events */}
              <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Prochains événements</h3>
                <div className="space-y-3">
                  {events.slice(0, 4).map((event) => (
                    <div key={event.id} className="flex items-start gap-3">
                      <div className={`w-3 h-3 rounded-full mt-1.5 ${event.color}`}></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-black dark:text-white truncate">
                          {event.title}
                        </p>
                        <p className="text-xs text-waterloo dark:text-manatee">
                          {new Date(event.date).toLocaleDateString('fr-FR')} • {event.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Event Types Legend */}
              <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
                <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Légende</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm text-black dark:text-white">Cours</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <span className="text-sm text-black dark:text-white">Devoirs</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-sm text-black dark:text-white">Séances</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-sm text-black dark:text-white">Évaluations</span>
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
    </main>
  );
}
