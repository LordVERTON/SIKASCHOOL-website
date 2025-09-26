import Link from "next/link";

interface CoursePageProps {
  params: Promise<{
    courseId: string;
  }>;
}

export default async function CoursePage({ params }: CoursePageProps) {
  const { courseId } = await params;
  
  // Mock data - in real app, fetch from API
  const course = {
    id: courseId,
    title: "Mathématiques - Terminale",
    description: "Cours complet de mathématiques pour la terminale S",
    level: "Terminale",
    progress: 75,
    totalLessons: 24,
    completedLessons: 18,
    tutor: "M. Dupont",
    coverUrl: "/images/courses/math.jpg"
  };

  const lessons = [
    { id: "1", title: "Introduction aux dérivées", order: 1, duration: "45 min", completed: true, contentUrl: "/lessons/derivatives-intro" },
    { id: "2", title: "Calcul de dérivées", order: 2, duration: "60 min", completed: true, contentUrl: "/lessons/derivatives-calc" },
    { id: "3", title: "Applications des dérivées", order: 3, duration: "50 min", completed: true, contentUrl: "/lessons/derivatives-app" },
    { id: "4", title: "Dérivées et variations", order: 4, duration: "55 min", completed: false, contentUrl: "/lessons/derivatives-variations" },
    { id: "5", title: "Exercices d'application", order: 5, duration: "40 min", completed: false, contentUrl: "/lessons/derivatives-exercises" },
    { id: "6", title: "Introduction aux intégrales", order: 6, duration: "50 min", completed: false, contentUrl: "/lessons/integrals-intro" },
  ];

  const nextLesson = lessons.find(lesson => !lesson.completed);

  return (
    <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
      <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
        {/* Breadcrumbs */}
        <nav className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-waterloo dark:text-manatee">
            <li><Link href="/student" className="hover:text-primary">Espace étudiant</Link></li>
            <li>/</li>
            <li><Link href="/student/courses" className="hover:text-primary">Mes cours</Link></li>
            <li>/</li>
            <li className="text-black dark:text-white">{course.title}</li>
          </ol>
        </nav>

        <div className="grid gap-7.5 lg:grid-cols-3">
          {/* Course Info */}
          <div className="lg:col-span-2">
            <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
              {/* Course Header */}
              <div className="mb-6">
                <div className="h-48 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center mb-6">
                  <div className="text-6xl font-bold text-primary/60">
                    {course.title.split(' ')[0].charAt(0)}
                  </div>
                </div>
                
                <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3 mb-4">
                  {course.title}
                </h1>
                <p className="text-para2 text-waterloo dark:text-manatee mb-4">
                  {course.description}
                </p>
                
                <div className="flex items-center justify-between text-sm text-waterloo dark:text-manatee">
                  <span>Niveau: {course.level}</span>
                  <span>Tuteur: {course.tutor}</span>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-waterloo dark:text-manatee">Progression globale</span>
                  <span className="font-medium text-black dark:text-white">{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                  <div 
                    className="bg-primary h-3 rounded-full transition-all duration-300" 
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs text-waterloo dark:text-manatee mt-1">
                  <span>{course.completedLessons}/{course.totalLessons} leçons terminées</span>
                </div>
              </div>

              {/* Next Lesson CTA */}
              {nextLesson && (
                <div className="mb-6 p-4 rounded-lg border border-primary/20 bg-primary/5">
                  <h3 className="font-semibold text-black dark:text-white mb-2">Prochaine leçon</h3>
                  <p className="text-sm text-waterloo dark:text-manatee mb-3">
                    {nextLesson.title} • {nextLesson.duration}
                  </p>
                  <Link
                    href={`/student/courses/${courseId}/lessons/${nextLesson.id}`}
                    className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 font-medium text-white transition hover:opacity-90"
                  >
                    <span>Commencer la leçon</span>
                    <svg width="14" height="14" viewBox="0 0 14 14" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10.4767 6.16701L6.00668 1.69701L7.18501 0.518677L13.6667 7.00034L7.18501 13.482L6.00668 12.3037L10.4767 7.83368H0.333344V6.16701H10.4767Z" fill="currentColor" />
                    </svg>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Lessons List */}
          <div className="lg:col-span-1">
            <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
              <h2 className="text-xl font-semibold text-black dark:text-white mb-6">Plan du cours</h2>
              
              <div className="space-y-3">
                {lessons.map((lesson, index) => (
                  <Link
                    key={lesson.id}
                    href={`/student/courses/${courseId}/lessons/${lesson.id}`}
                    className={`block p-3 rounded-lg border transition ${
                      lesson.completed 
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                        : 'border-stroke dark:border-strokedark hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                          lesson.completed 
                            ? 'bg-green-500 text-white' 
                            : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                        }`}>
                          {lesson.completed ? '✓' : index + 1}
                        </div>
                        <div>
                          <h3 className={`text-sm font-medium ${
                            lesson.completed 
                              ? 'text-green-800 dark:text-green-200' 
                              : 'text-black dark:text-white'
                          }`}>
                            {lesson.title}
                          </h3>
                          <p className="text-xs text-waterloo dark:text-manatee">{lesson.duration}</p>
                        </div>
                      </div>
                      {lesson.completed && (
                        <div className="text-green-500">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                            <path d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"/>
                          </svg>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
