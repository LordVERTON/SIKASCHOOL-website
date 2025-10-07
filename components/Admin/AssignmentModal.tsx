"use client";

import { useState } from 'react';
// import { useConfirm } from '@/components/Common/ConfirmDialog';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'STUDENT' | 'TUTOR' | 'ADMIN';
  is_active: boolean;
}

interface AssignmentModalProps {
  user: User;
  assignments: any[];
  availableUsers: any[];
  onAssign: (targetUserId: string, notes?: string) => Promise<void>;
  onUnassign: (targetUserId: string) => Promise<void>;
  onClose: () => void;
}

export default function AssignmentModal({ 
  user, 
  assignments, 
  availableUsers, 
  onAssign, 
  onUnassign, 
  onClose 
}: AssignmentModalProps) {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [notes, setNotes] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  // const { confirm, ConfirmDialog } = useConfirm();

  const handleAssign = async () => {
    if (!selectedUserId) return;
    
    setIsAssigning(true);
    try {
      await onAssign(selectedUserId, notes);
      setSelectedUserId('');
      setNotes('');
    } catch (error) {
      console.error('Erreur lors de l\'assignation:', error);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassign = async (targetUserId: string) => {
    // eslint-disable-next-line no-alert
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette assignation ?')) {
      try {
        await onUnassign(targetUserId);
      } catch (error) {
        console.error('Erreur lors de la désassignation:', error);
      }
    }
  };

  const isTutor = user.role === 'TUTOR';
  const _targetRole = isTutor ? 'STUDENT' : 'TUTOR';
  const targetRoleLabel = isTutor ? 'étudiant' : 'tuteur';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onTouchMove={(e) => e.preventDefault()}>
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto overscroll-contain" style={{ WebkitOverflowScrolling: 'touch' }}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Gestion des assignations - {user.first_name} {user.last_name}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Assignations actuelles */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              {isTutor ? 'Étudiants assignés' : 'Tuteurs assignés'} ({assignments.length})
            </h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {assignments.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Aucun {targetRoleLabel} assigné
                </p>
              ) : (
                assignments.map((assignment) => {
                  const targetUser = isTutor ? assignment.students : assignment.tutors;
                  return (
                    <div key={assignment.id} className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {targetUser?.first_name} {targetUser?.last_name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {targetUser?.email}
                          </p>
                          {assignment.notes && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                              Note: {assignment.notes}
                            </p>
                          )}
                          <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                            Assigné le {new Date(assignment.assigned_at).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleUnassign(targetUser?.id)}
                          className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
                        >
                          Supprimer
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Ajouter une assignation */}
          <div>
            <h4 className="text-md font-medium text-gray-900 dark:text-white mb-4">
              Assigner un {targetRoleLabel}
            </h4>
            
            {/* Liste de tous les utilisateurs disponibles */}
            <div className="mb-4">
              <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tous les {targetRoleLabel}s disponibles ({availableUsers.length})
              </h5>
              <div className="max-h-48 overflow-y-auto space-y-2">
                {availableUsers.map((user) => {
                  const isAlreadyAssigned = assignments.some(a => 
                    (isTutor ? a.students?.id : a.tutors?.id) === user.id
                  );
                  return (
                    <div 
                      key={user.id} 
                      className={`p-2 rounded border text-sm ${
                        isAlreadyAssigned 
                          ? 'bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400' 
                          : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{user.first_name} {user.last_name}</span>
                          <span className="text-gray-500 dark:text-gray-400 ml-2">({user.email})</span>
                        </div>
                        <span className={`text-xs px-2 py-1 rounded ${
                          isAlreadyAssigned 
                            ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' 
                            : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        }`}>
                          {isAlreadyAssigned ? 'Assigné' : 'Disponible'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Sélectionner un {targetRoleLabel}
                </label>
                <select
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Choisir un {targetRoleLabel}</option>
                  {availableUsers.map((user) => {
                    const isAlreadyAssigned = assignments.some(a => 
                      (isTutor ? a.students?.id : a.tutors?.id) === user.id
                    );
                    return (
                      <option 
                        key={user.id} 
                        value={user.id}
                        disabled={isAlreadyAssigned}
                        style={{ 
                          color: isAlreadyAssigned ? '#9CA3AF' : 'inherit',
                          fontStyle: isAlreadyAssigned ? 'italic' : 'normal'
                        }}
                      >
                        {user.first_name} {user.last_name} ({user.email})
                        {isAlreadyAssigned ? ' - Déjà assigné' : ''}
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notes (optionnel)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ajouter une note sur cette assignation..."
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
                  rows={3}
                />
              </div>

              <button
                onClick={handleAssign}
                disabled={!selectedUserId || isAssigning}
                className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAssigning ? 'Assignation...' : `Assigner le ${targetRoleLabel}`}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* <ConfirmDialog /> */}
    </div>
  );
}
