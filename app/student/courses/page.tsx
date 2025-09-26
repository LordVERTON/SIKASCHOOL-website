import Link from "next/link";

export default function StudentCourses() {
  const courses = [
    {
      id: "1",
      title: "Mathématiques - Terminale",
      description: "Cours complet de mathématiques pour la terminale",
      level: "Terminale",
      progress: 75,
      totalLessons: 24,
      completedLessons: 18,
      coverUrl: "/images/courses/math.jpg",
      tutor: "M. Dupont",
      lastAccessed: "Il y a 2 jours"
    },
    {
      id: "2", 
      title: "Physique - Terminale",
      description: "Mécanique, électricité et optique",
      level: "Terminale",
      progress: 60,
      totalLessons: 20,
      completedLessons: 12,
      coverUrl: "/images/courses/physics.jpg",
      tutor: "Mme Martin",
      lastAccessed: "Il y a 1 semaine"
    },
    {
      id: "3",
      title: "Français - Terminale", 
      description: "Préparation au bac de français",
      level: "Terminale",
      progress: 90,
      totalLessons: 15,
      completedLessons: 14,
      coverUrl: "/images/courses/french.jpg",
      tutor: "M. Leroy",
      lastAccessed: "Aujourd'hui"
    },
    {
      id: "4",
      title: "Histoire-Géographie - Terminale",
      description: "Histoire et géographie du monde contemporain",
      level: "Terminale", 
      progress: 45,
      totalLessons: 18,
      completedLessons: 8,
      coverUrl: "/images/courses/history.jpg",
      tutor: "Mme Dubois",
      lastAccessed: "Il y a 3 jours"
    }
  ];

  return (
    <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
      <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
        <div className="animate_top">
          <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">
            Mes cours
          </h1>
          <p className="mt-4 text-para2 text-waterloo dark:text-manatee">
            Consultez vos cours et progressez dans votre apprentissage.
          </p>
        </div>

        <div className="mt-10 grid gap-7.5 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div key={course.id} className="animate_top group relative rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection dark:shadow-none">
              {/* Course Cover */}
              <div className="mb-6 h-48 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <div className="text-4xl font-bold text-primary/60">
                  {course.title.split(' ')[0].charAt(0)}
                </div>
              </div>

              {/* Course Info */}
              <div className="mb-4">
                <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
                  {course.title}
                </h3>
                <p className="text-waterloo dark:text-manatee text-sm mb-2">
                  {course.description}
                </p>
                <div className="flex items-center justify-between text-sm text-waterloo dark:text-manatee">
                  <span>Niveau: {course.level}</span>
                  <span>Tuteur: {course.tutor}</span>
                </div>
              </div>

              {/* Progress */}
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-waterloo dark:text-manatee">Progression</span>
                  <span className="font-medium text-black dark:text-white">{course.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${course.progress}%` }}
                  ></div>
                </div>
                <div className="flex items-center justify-between text-xs text-waterloo dark:text-manatee mt-1">
                  <span>{course.completedLessons}/{course.totalLessons} leçons</span>
                  <span>Dernière activité: {course.lastAccessed}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2">
                <Link
                  href={`/student/courses/${course.id}`}
                  className="flex-1 text-center rounded-md border border-stroke px-4 py-2 font-medium text-primary transition hover:opacity-90 dark:border-strokedark"
                >
                  Voir le cours
                </Link>
                <button className="flex-1 rounded-md bg-primary px-4 py-2 font-medium text-white transition hover:opacity-90">
                  Continuer
                </button>
              </div>
            </div>
          ))}
        </div>

      </div>
    </main>
  );
}
