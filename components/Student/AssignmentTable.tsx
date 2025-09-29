// import Link from "next/link";

interface Assignment {
  id: string;
  title: string;
  course: string;
  dueDate: string;
  status: 'pending' | 'submitted' | 'graded';
  maxScore: number;
  submittedAt?: string;
  grade?: number;
  instructions: string;
}

interface AssignmentTableProps {
  assignments: Assignment[];
  showActions?: boolean;
}

export default function AssignmentTable({ assignments, showActions = true }: AssignmentTableProps) {
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
    <div className="rounded-lg border border-stroke bg-white shadow-solid-10 dark:border-strokedark dark:bg-blacksection">
      {/* Table (desktop) */}
      <table className="hidden w-full text-left text-para2 md:table">
        <thead>
          <tr className="border-b border-stroke dark:border-strokedark text-waterloo dark:text-manatee">
            <th className="py-3 px-6">Devoir</th>
            <th className="py-3 px-6">Matière</th>
            <th className="py-3 px-6">Date limite</th>
            <th className="py-3 px-6">Statut</th>
            <th className="py-3 px-6">Note</th>
            {showActions && <th className="py-3 px-6">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {assignments.map((assignment) => (
            <tr key={assignment.id} className="border-b border-stroke last:border-0 dark:border-strokedark hover:bg-gray-50 dark:hover:bg-gray-800/50">
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
              {showActions && (
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
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Cards (mobile) */}
      <div className="block md:hidden divide-y divide-stroke dark:divide-strokedark">
        {assignments.map((a) => (
          <div key={a.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="font-medium text-black dark:text-white truncate">{a.title}</div>
                <div className="text-xs text-waterloo dark:text-manatee truncate">{a.instructions}</div>
              </div>
              <span className={`shrink-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(a.status)}`}>{getStatusText(a.status)}</span>
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
              <div className="text-waterloo dark:text-manatee">Matière</div>
              <div className="text-right text-black dark:text-white">{a.course}</div>
              <div className="text-waterloo dark:text-manatee">Date limite</div>
              <div className={`text-right ${isOverdue(a.dueDate, a.status) ? 'text-red-600' : 'text-black dark:text-white'}`}>
                {formatDate(a.dueDate)}
                {isOverdue(a.dueDate, a.status) && <span className="ml-1 text-xs">(En retard)</span>}
              </div>
              <div className="text-waterloo dark:text-manatee">Note</div>
              <div className="text-right text-black dark:text-white">
                {a.grade ? `${a.grade}/${a.maxScore} (${((a.grade / a.maxScore) * 100).toFixed(0)}%)` : '-'}
              </div>
            </div>
            {showActions && (
              <div className="mt-3 flex justify-end">
                {a.status === 'pending' ? (
                  <button className="rounded-md border border-stroke px-3 py-1.5 text-primary transition hover:opacity-90 dark:border-strokedark">Rendre</button>
                ) : (
                  <button className="rounded-md border border-stroke px-3 py-1.5 text-primary transition hover:opacity-90 dark:border-strokedark">Voir</button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
