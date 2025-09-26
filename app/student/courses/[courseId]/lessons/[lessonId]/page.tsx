import Link from "next/link";

interface LessonPageProps {
  params: Promise<{
    courseId: string;
    lessonId: string;
  }>;
}

export default async function LessonPage({ params }: LessonPageProps) {
  const { courseId, lessonId } = await params;
  
  // Mock data - in real app, fetch from API
  const lesson = {
    id: lessonId,
    title: "Dérivées et variations",
    content: `
      <h2>Introduction</h2>
      <p>Dans cette leçon, nous allons étudier comment les dérivées nous permettent d'analyser les variations d'une fonction.</p>
      
      <h3>1. Signe de la dérivée et sens de variation</h3>
      <p>Si f'(x) > 0 sur un intervalle I, alors f est strictement croissante sur I.</p>
      <p>Si f'(x) < 0 sur un intervalle I, alors f est strictement décroissante sur I.</p>
      
      <h3>2. Exemple pratique</h3>
      <p>Considérons la fonction f(x) = x³ - 3x + 1</p>
      <p>Sa dérivée est f'(x) = 3x² - 3 = 3(x² - 1) = 3(x-1)(x+1)</p>
      
      <h3>3. Tableau de variation</h3>
      <p>Nous pouvons construire le tableau de variation en étudiant le signe de f'(x).</p>
    `,
    duration: "55 min",
    completed: false,
    progress: 0
  };

  const course = {
    id: courseId,
    title: "Mathématiques - Terminale"
  };

  const allLessons = [
    { id: "1", title: "Introduction aux dérivées", completed: true },
    { id: "2", title: "Calcul de dérivées", completed: true },
    { id: "3", title: "Applications des dérivées", completed: true },
    { id: "4", title: "Dérivées et variations", completed: false, current: true },
    { id: "5", title: "Exercices d'application", completed: false },
    { id: "6", title: "Introduction aux intégrales", completed: false },
  ];

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
            <li><Link href={`/student/courses/${courseId}`} className="hover:text-primary">{course.title}</Link></li>
            <li>/</li>
            <li className="text-black dark:text-white">{lesson.title}</li>
          </ol>
        </nav>

        <div className="grid gap-7.5 lg:grid-cols-4">
          {/* Lesson Content */}
          <div className="lg:col-span-3">
            <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
              {/* Lesson Header */}
              <div className="mb-6">
                <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3 mb-4">
                  {lesson.title}
                </h1>
                <div className="flex items-center gap-4 text-sm text-waterloo dark:text-manatee">
                  <span>Durée: {lesson.duration}</span>
                  <span>•</span>
                  <span>Progression: {lesson.progress}%</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${lesson.progress}%` }}
                  ></div>
                </div>
              </div>

              {/* Lesson Content */}
              <div className="prose prose-lg max-w-none dark:prose-invert">
                <div 
                  dangerouslySetInnerHTML={{ __html: lesson.content }}
                  className="text-black dark:text-white"
                />
              </div>

              {/* Lesson Actions */}
              <div className="mt-8 flex items-center justify-between pt-6 border-t border-stroke dark:border-strokedark">
                <button className="flex items-center gap-2 px-4 py-2 border border-stroke rounded-md hover:opacity-90 dark:border-strokedark">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    <path d="M5.255 5.786a.237.237 0 0 0 .241.247h.825c.138 0 .248-.113.266-.25.09-.656.54-1.134 1.342-1.134.686 0 1.314.343 1.314 1.168 0 .635-.374.927-.965 1.371-.673.489-1.206 1.06-1.168 1.987l.003.217a.25.25 0 0 0 .25.246h.811a.25.25 0 0 0 .25-.25v-.105c0-.718.273-.927 1.01-1.486.609-.463 1.244-.977 1.244-2.056 0-1.511-1.276-2.241-2.673-2.241-1.267 0-2.655.59-2.75 2.286zm1.557 5.763c0 .533.425.927 1.01.927.609 0 1.028-.394 1.028-.927 0-.552-.42-.94-1.029-.94-.584 0-1.009.388-1.009.94z"/>
                  </svg>
                  <span>Marquer comme terminé</span>
                </button>
                
                <div className="flex gap-2">
                  <button className="px-4 py-2 border border-stroke rounded-md hover:opacity-90 dark:border-strokedark">
                    Précédent
                  </button>
                  <button className="px-4 py-2 bg-primary text-white rounded-md hover:opacity-90">
                    Suivant
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Course Navigation */}
          <div className="lg:col-span-1">
            <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
              <h2 className="text-lg font-semibold text-black dark:text-white mb-4">Plan du cours</h2>
              
              <div className="space-y-2">
                {allLessons.map((l, index) => (
                  <Link
                    key={l.id}
                    href={`/student/courses/${courseId}/lessons/${l.id}`}
                    className={`block p-3 rounded-lg border transition ${
                      l.current 
                        ? 'border-primary bg-primary/10' 
                        : l.completed 
                          ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                          : 'border-stroke dark:border-strokedark hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                        l.completed 
                          ? 'bg-green-500 text-white' 
                          : l.current
                            ? 'bg-primary text-white'
                            : 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                      }`}>
                        {l.completed ? '✓' : index + 1}
                      </div>
                      <div>
                        <h3 className={`text-sm font-medium ${
                          l.current 
                            ? 'text-primary' 
                            : l.completed 
                              ? 'text-green-800 dark:text-green-200' 
                              : 'text-black dark:text-white'
                        }`}>
                          {l.title}
                        </h3>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Course Progress */}
              <div className="mt-6 pt-6 border-t border-stroke dark:border-strokedark">
                <h3 className="text-sm font-medium text-black dark:text-white mb-2">Progression du cours</h3>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div className="bg-primary h-2 rounded-full" style={{ width: '50%' }}></div>
                </div>
                <p className="text-xs text-waterloo dark:text-manatee mt-1">3/6 leçons terminées</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
