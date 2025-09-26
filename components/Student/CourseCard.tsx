import Link from "next/link";
import Image from "next/image";

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  level: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  coverUrl?: string;
  tutor: string;
  lastAccessed: string;
  nextLesson?: string;
}

export default function CourseCard({
  id,
  title,
  description,
  level,
  progress,
  totalLessons,
  completedLessons,
  coverUrl,
  tutor,
  lastAccessed,
  nextLesson
}: CourseCardProps) {
  return (
    <div className="animate_top group relative rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection dark:shadow-none">
      {/* Course Cover */}
      <div className="mb-6 h-48 rounded-lg bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
        {coverUrl ? (
          <Image 
            src={coverUrl} 
            alt={title}
            width={400}
            height={192}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="text-4xl font-bold text-primary/60">
            {title.split(' ')[0].charAt(0)}
          </div>
        )}
      </div>

      {/* Course Info */}
      <div className="mb-4">
        <h3 className="text-xl font-semibold text-black dark:text-white mb-2">
          {title}
        </h3>
        <p className="text-waterloo dark:text-manatee text-sm mb-2">
          {description}
        </p>
        <div className="flex items-center justify-between text-sm text-waterloo dark:text-manatee">
          <span>Niveau: {level}</span>
          <span>Tuteur: {tutor}</span>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-waterloo dark:text-manatee">Progression</span>
          <span className="font-medium text-black dark:text-white">{progress}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <div className="flex items-center justify-between text-xs text-waterloo dark:text-manatee mt-1">
          <span>{completedLessons}/{totalLessons} leçons</span>
          <span>Dernière activité: {lastAccessed}</span>
        </div>
      </div>

      {/* Next Lesson Info */}
      {nextLesson && (
        <div className="mb-4 p-3 rounded-lg bg-primary/5 border border-primary/20">
          <p className="text-sm text-primary font-medium">
            Prochaine leçon: {nextLesson}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <Link
          href={`/student/courses/${id}`}
          className="flex-1 text-center rounded-md border border-stroke px-4 py-2 font-medium text-primary transition hover:opacity-90 dark:border-strokedark"
        >
          Voir le cours
        </Link>
        <Link
          href={`/student/courses/${id}/lessons/1`}
          className="flex-1 text-center rounded-md bg-primary px-4 py-2 font-medium text-white transition hover:opacity-90"
        >
          Continuer
        </Link>
      </div>
    </div>
  );
}
