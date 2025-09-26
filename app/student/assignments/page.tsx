import Link from "next/link";

export default function StudentAssignments() {
  const assignments = [
    {
      id: "1",
      title: "Exercices sur les dérivées",
      course: "Mathématiques - Terminale",
      dueDate: "2024-09-15",
      status: "pending",
      maxScore: 20,
      submittedAt: null,
      grade: null,
      instructions: "Résoudre les exercices 1 à 5 du chapitre 3"
    },
    {
      id: "2", 
      title: "Commentaire de texte",
      course: "Français - Terminale",
      dueDate: "2024-09-18",
      status: "submitted",
      maxScore: 20,
      submittedAt: "2024-09-16",
      grade: 16,
      instructions: "Analyser le texte de Victor Hugo et rédiger un commentaire structuré"
    },
    {
      id: "3",
      title: "TP de physique - Mécanique",
      course: "Physique - Terminale", 
      dueDate: "2024-09-20",
      status: "graded",
      maxScore: 20,
      submittedAt: "2024-09-19",
      grade: 18,
      instructions: "Réaliser les expériences et analyser les résultats"
    },
    {
      id: "4",
      title: "Dissertation d'histoire",
      course: "Histoire-Géographie - Terminale",
      dueDate: "2024-09-25",
      status: "pending",
      maxScore: 20,
      submittedAt: null,
      grade: null,
      instructions: "Sujet: Les causes de la Première Guerre mondiale"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'text-orange-600 bg-orange-100 dark:bg-orange-900/20';
      case 'submitted': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/20';
      case 'graded': return 'text-green-600 bg-green-100 dark:bg-green-900/20';
      default: return 'text-gray-600 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'submitted': return 'Rendu';
      case 'graded': return 'Noté';
      default: return 'Inconnu';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const isOverdue = (dueDate: string, status: string) => {
    if (status !== 'pending') return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <main className="pb-20 pt-15 lg:pb-25 xl:pb-30">
      <div className="mx-auto max-w-c-1315 px-4 md:px-8 xl:px-0">
        <div className="animate_top">
          <h1 className="text-3xl font-bold text-black dark:text-white xl:text-sectiontitle3">
            Mes devoirs
          </h1>
          <p className="mt-4 text-para2 text-waterloo dark:text-manatee">
            Consultez vos devoirs et évaluations.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mt-10 grid gap-7.5 md:grid-cols-4">
          <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
            <div className="text-waterloo dark:text-manatee">Total</div>
            <div className="text-2xl font-semibold text-black dark:text-white">{assignments.length}</div>
          </div>
          <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
            <div className="text-waterloo dark:text-manatee">En attente</div>
            <div className="text-2xl font-semibold text-orange-600">
              {assignments.filter(a => a.status === 'pending').length}
            </div>
          </div>
          <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
            <div className="text-waterloo dark:text-manatee">Rendus</div>
            <div className="text-2xl font-semibold text-blue-600">
              {assignments.filter(a => a.status === 'submitted').length}
            </div>
          </div>
          <div className="animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
            <div className="text-waterloo dark:text-manatee">Moyenne</div>
            <div className="text-2xl font-semibold text-green-600">
              {assignments.filter(a => a.grade).length > 0 
                ? (assignments.filter(a => a.grade).reduce((sum, a) => sum + (a.grade || 0), 0) / assignments.filter(a => a.grade).length).toFixed(1)
                : '-'
              }/20
            </div>
          </div>
        </div>

        {/* Assignments Table */}
        <div className="mt-10 animate_top overflow-x-auto rounded-lg border border-stroke bg-white shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
          <table className="w-full text-left text-para2">
            <thead>
              <tr className="border-b border-stroke dark:border-strokedark text-waterloo dark:text-manatee">
                <th className="py-3 px-6">Devoir</th>
                <th className="py-3 px-6">Matière</th>
                <th className="py-3 px-6">Date limite</th>
                <th className="py-3 px-6">Statut</th>
                <th className="py-3 px-6">Note</th>
                <th className="py-3 px-6">Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment.id} className="border-b border-stroke last:border-0 dark:border-strokedark">
                  <td className="py-3 px-6">
                    <div>
                      <div className="font-medium text-black dark:text-white">{assignment.title}</div>
                      <div className="text-sm text-waterloo dark:text-manatee">
                        {assignment.instructions}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-6">{assignment.course}</td>
                  <td className="py-3 px-6">
                    <div className={isOverdue(assignment.dueDate, assignment.status) ? 'text-red-600' : ''}>
                      {formatDate(assignment.dueDate)}
                      {isOverdue(assignment.dueDate, assignment.status) && (
                        <span className="ml-1 text-xs">(En retard)</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-6">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                      {getStatusText(assignment.status)}
                    </span>
                  </td>
                  <td className="py-3 px-6">
                    {assignment.grade ? (
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-black dark:text-white">
                          {assignment.grade}/{assignment.maxScore}
                        </span>
                        <span className="text-sm text-waterloo dark:text-manatee">
                          ({((assignment.grade / assignment.maxScore) * 100).toFixed(0)}%)
                        </span>
                      </div>
                    ) : (
                      <span className="text-waterloo dark:text-manatee">-</span>
                    )}
                  </td>
                  <td className="py-3 px-6">
                    <div className="flex gap-2">
                      {assignment.status === 'pending' ? (
                        <button className="rounded-md border border-stroke px-3 py-1.5 text-primary transition hover:opacity-90 dark:border-strokedark">
                          Rendre
                        </button>
                      ) : (
                        <button className="rounded-md border border-stroke px-3 py-1.5 text-primary transition hover:opacity-90 dark:border-strokedark">
                          Voir
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Empty state for completed assignments */}
        {assignments.filter(a => a.status === 'graded').length > 0 && (
          <div className="mt-10 animate_top rounded-lg border border-stroke bg-white p-7.5 shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
            <h3 className="text-lg font-semibold text-black dark:text-white mb-4">Devoirs corrigés</h3>
            <div className="space-y-3">
              {assignments.filter(a => a.status === 'graded').map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-4 rounded-lg border border-stroke dark:border-strokedark">
                  <div>
                    <h4 className="font-medium text-black dark:text-white">{assignment.title}</h4>
                    <p className="text-sm text-waterloo dark:text-manatee">{assignment.course}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium text-green-600">
                      {assignment.grade}/{assignment.maxScore}
                    </div>
                    <div className="text-sm text-waterloo dark:text-manatee">
                      Rendu le {assignment.submittedAt && formatDate(assignment.submittedAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
