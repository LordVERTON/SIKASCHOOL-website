"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { hasAdminPermissions } from '@/lib/admin-permissions';

interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'STUDENT' | 'TUTOR' | 'ADMIN';
  is_active: boolean;
  created_at: string;
  profile?: {
    // Pour les tuteurs
    bio?: string;
    experience_years?: number;
    subjects?: string[];
    is_available?: boolean;
    // Pour les étudiants
    grade_level?: string;
    academic_goals?: string;
  } | null;
}

interface Session {
  id: string;
  student_id: string;
  tutor_id: string;
  student_name: string;
  tutor_name: string;
  subject: string;
  level: string;
  type: 'NOTA' | 'AVA' | 'TODA';
  status: 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  started_at: string | null;
  completed_at: string | null;
  duration_minutes: number;
  student_rating: number | null;
}

interface Payment {
  id: string;
  session_id: string;
  student_name: string;
  tutor_name: string;
  amount_cents: number;
  tutor_commission_cents: number;
  platform_commission_cents: number;
  status: string;
  paid_at: string;
  created_at: string;
}

export default function AdministrationPage() {
  const { user, loading } = useAuth('TUTOR');
  const [activeTab, setActiveTab] = useState<'users' | 'sessions' | 'payments' | 'sync'>('users');
  const [users, setUsers] = useState<User[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingSession, setEditingSession] = useState<Session | null>(null);

  // Vérifier si l'utilisateur a les permissions admin
  const isAdmin = user ? hasAdminPermissions(user) : false;

  useEffect(() => {
    if (user && isAdmin) {
      fetchData();
    }
  }, [user, isAdmin]);

  const fetchData = async () => {
    setLoadingData(true);
    try {
      // Récupérer les utilisateurs avec profils
      const usersResponse = await fetch('/api/admin/users/with-profiles');
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        setUsers(usersData);
      }

      // Récupérer les sessions
      const sessionsResponse = await fetch('/api/admin/sessions');
      if (sessionsResponse.ok) {
        const sessionsData = await sessionsResponse.json();
        setSessions(sessionsData);
      }

      // Récupérer les paiements
      const paymentsResponse = await fetch('/api/admin/payments');
      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        setPayments(paymentsData);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleResetPassword = async (userId: string) => {
    if (confirm('Êtes-vous sûr de vouloir réinitialiser le mot de passe de cet utilisateur ?')) {
      try {
        const response = await fetch(`/api/admin/users/${userId}/reset-password`, {
          method: 'POST'
        });
        
        if (response.ok) {
          alert('Mot de passe réinitialisé avec succès');
          fetchData();
        } else {
          alert('Erreur lors de la réinitialisation du mot de passe');
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la réinitialisation du mot de passe');
      }
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/toggle-status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_active: !currentStatus })
      });
      
      if (response.ok) {
        alert(`Utilisateur ${!currentStatus ? 'activé' : 'désactivé'} avec succès`);
        fetchData();
      } else {
        alert('Erreur lors de la modification du statut');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la modification du statut');
    }
  };

  const handleCreateUser = async (userData: Partial<User>) => {
    try {
      console.log('🔄 Création utilisateur:', userData);
      
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      console.log('📡 Réponse reçue:', response.status, response.statusText);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Création réussie:', result);
        alert('Utilisateur créé avec succès');
        setShowUserModal(false);
        fetchData();
      } else {
        const errorText = await response.text();
        console.error('❌ Erreur API:', response.status, errorText);
        
        try {
          const error = JSON.parse(errorText);
          alert(`Erreur lors de la création: ${error.error}`);
        } catch (e) {
          alert(`Erreur lors de la création: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('❌ Erreur fetch:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      alert(`Erreur de connexion: ${errorMessage}`);
    }
  };

  const handleSaveUser = async (userId: string, userData: Partial<User>) => {
    if (editingUser) {
      await handleUpdateUser(userId, userData);
    } else {
      await handleCreateUser(userData);
    }
  };

  const handleSaveSession = async (sessionId: string, sessionData: Partial<Session>) => {
    if (editingSession) {
      await handleUpdateSession(sessionId, sessionData);
    } else {
      await handleCreateSession(sessionData);
    }
  };

  const handleUpdateUser = async (userId: string, userData: Partial<User>) => {
    try {
      console.log('🔄 Mise à jour utilisateur:', userId, userData);
      
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });
      
      console.log('📡 Réponse reçue:', response.status, response.statusText);
      
      if (response.ok) {
        const result = await response.json();
        console.log('✅ Mise à jour réussie:', result);
        alert('Utilisateur modifié avec succès');
        setShowUserModal(false);
        setEditingUser(null);
        fetchData();
      } else {
        const errorText = await response.text();
        console.error('❌ Erreur API:', response.status, errorText);
        
        try {
          const error = JSON.parse(errorText);
          alert(`Erreur lors de la modification: ${error.error}`);
        } catch (e) {
          alert(`Erreur lors de la modification: ${response.status} ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('❌ Erreur fetch:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      alert(`Erreur de connexion: ${errorMessage}`);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.')) {
      try {
        const response = await fetch(`/api/admin/users/${userId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          alert('Utilisateur supprimé avec succès');
          fetchData();
        } else {
          const error = await response.json();
          alert(`Erreur lors de la suppression: ${error.error}`);
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression de l\'utilisateur');
      }
    }
  };

  const handleCreateSession = async (sessionData: Partial<Session>) => {
    try {
      const response = await fetch('/api/admin/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
      });
      
      if (response.ok) {
        alert('Session créée avec succès');
        setShowSessionModal(false);
        fetchData();
      } else {
        const error = await response.json();
        alert(`Erreur lors de la création: ${error.error}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la création de la session');
    }
  };

  const handleUpdateSession = async (sessionId: string, sessionData: Partial<Session>) => {
    try {
      const response = await fetch(`/api/admin/sessions/${sessionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(sessionData)
      });
      
      if (response.ok) {
        alert('Session modifiée avec succès');
        setShowSessionModal(false);
        setEditingSession(null);
        fetchData();
      } else {
        const error = await response.json();
        alert(`Erreur lors de la modification: ${error.error}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la modification de la session');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette session ? Cette action est irréversible.')) {
      try {
        const response = await fetch(`/api/admin/sessions/${sessionId}`, {
          method: 'DELETE'
        });
        
        if (response.ok) {
          alert('Session supprimée avec succès');
          fetchData();
        } else {
          const error = await response.json();
          alert(`Erreur lors de la suppression: ${error.error}`);
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la suppression de la session');
      }
    }
  };

  const handleSyncProfiles = async () => {
    if (confirm('Êtes-vous sûr de vouloir synchroniser les profils ? Cela créera les profils manquants.')) {
      try {
        const response = await fetch('/api/admin/sync-profiles', {
          method: 'POST'
        });
        
        if (response.ok) {
          const result = await response.json();
          alert(`Synchronisation réussie !\n- Profils tuteurs créés: ${result.createdTutorProfiles}\n- Profils étudiants créés: ${result.createdStudentProfiles}`);
          fetchData();
        } else {
          const error = await response.json();
          alert(`Erreur lors de la synchronisation: ${error.error}`);
        }
      } catch (error) {
        console.error('Erreur:', error);
        alert('Erreur lors de la synchronisation');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Vérification de l'authentification...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-red-500 text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Accès refusé</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Vous n'avez pas les permissions nécessaires pour accéder à cette section.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Administration de la plateforme
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestion des utilisateurs, sessions et paiements
        </p>
      </div>

      {/* Onglets */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'users', label: 'Utilisateurs', count: users.length },
              { id: 'sessions', label: 'Sessions', count: sessions.length },
              { id: 'payments', label: 'Paiements', count: payments.length },
              { id: 'sync', label: 'Synchronisation', count: 0 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Contenu des onglets */}
      {loadingData ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <span className="ml-2">Chargement des données...</span>
        </div>
      ) : (
        <>
          {/* Onglet Utilisateurs */}
          {activeTab === 'users' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Gestion des utilisateurs
                </h2>
                <button
                  onClick={() => {
                    setEditingUser(null);
                    setShowUserModal(true);
                  }}
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                >
                  + Ajouter un utilisateur
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Utilisateur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Rôle
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date de création
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Profil
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((user) => (
                      <tr key={user.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.first_name} {user.last_name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.role === 'ADMIN' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            user.role === 'TUTOR' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            user.is_active 
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {user.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {new Date(user.created_at).toLocaleDateString('fr-FR')}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {user.profile ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              ✓ Complet
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
                              ✗ Manquant
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => {
                              setEditingUser(user);
                              setShowUserModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleResetPassword(user.id)}
                            className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                          >
                            Réinitialiser mot de passe
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(user.id, user.is_active)}
                            className={`${
                              user.is_active 
                                ? 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300'
                                : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'
                            }`}
                          >
                            {user.is_active ? 'Désactiver' : 'Activer'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Onglet Sessions */}
          {activeTab === 'sessions' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Gestion des sessions
                </h2>
                <button
                  onClick={() => {
                    setEditingSession(null);
                    setShowSessionModal(true);
                  }}
                  className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
                >
                  + Ajouter une session
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Étudiant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Tuteur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Matière
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Durée
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Note
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sessions.map((session) => (
                      <tr key={session.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {session.student_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {session.tutor_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {session.subject} ({session.level})
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            session.status === 'COMPLETED' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            session.status === 'IN_PROGRESS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            session.status === 'CANCELLED' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}>
                            {session.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {session.duration_minutes} min
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {session.student_rating ? `${session.student_rating}/5` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          <button
                            onClick={() => {
                              setEditingSession(session);
                              setShowSessionModal(true);
                            }}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            Modifier
                          </button>
                          <button
                            onClick={() => handleDeleteSession(session.id)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Onglet Paiements */}
          {activeTab === 'payments' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Gestion des paiements
                </h2>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Étudiant
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Tuteur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Montant total
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Commission tuteur
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Commission plateforme
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Date de paiement
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {payments.map((payment) => (
                      <tr key={payment.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {payment.student_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {payment.tutor_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {(payment.amount_cents / 100).toFixed(2)} €
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {(payment.tutor_commission_cents / 100).toFixed(2)} €
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {(payment.platform_commission_cents / 100).toFixed(2)} €
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            payment.status === 'PAID' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            payment.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                            'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}>
                            {payment.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {payment.paid_at ? new Date(payment.paid_at).toLocaleDateString('fr-FR') : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Onglet Synchronisation */}
          {activeTab === 'sync' && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                  Synchronisation des profils
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  Synchronisez les profils des utilisateurs avec leurs rôles
                </p>
              </div>
              <div className="p-6">
                <div className="mb-6">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                    État actuel des profils
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">👨‍🏫 Tuteurs</h4>
                      <div className="space-y-2">
                        {users.filter(u => u.role === 'TUTOR').map(tutor => (
                          <div key={tutor.id} className="flex items-center justify-between text-sm">
                            <span className="text-blue-800 dark:text-blue-200">
                              {tutor.first_name} {tutor.last_name}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              tutor.profile 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {tutor.profile ? 'Profil OK' : 'Profil manquant'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <h4 className="font-medium text-green-900 dark:text-green-100 mb-2">👨‍🎓 Étudiants</h4>
                      <div className="space-y-2">
                        {users.filter(u => u.role === 'STUDENT').map(student => (
                          <div key={student.id} className="flex items-center justify-between text-sm">
                            <span className="text-green-800 dark:text-green-200">
                              {student.first_name} {student.last_name}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              student.profile 
                                ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                                : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                            }`}>
                              {student.profile ? 'Profil OK' : 'Profil manquant'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h3 className="text-md font-medium text-gray-900 dark:text-white mb-4">
                    Actions de synchronisation
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                      <h4 className="font-medium text-yellow-900 dark:text-yellow-100 mb-2">
                        🔄 Synchroniser les profils manquants
                      </h4>
                      <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-3">
                        Cette action créera automatiquement les profils manquants pour tous les utilisateurs 
                        qui n'ont pas encore de profil associé à leur rôle.
                      </p>
                      <button
                        onClick={handleSyncProfiles}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-md transition-colors"
                      >
                        Synchroniser maintenant
                      </button>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                        📊 Statistiques
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-blue-800 dark:text-blue-200">Total utilisateurs:</span>
                          <span className="ml-2 font-medium">{users.length}</span>
                        </div>
                        <div>
                          <span className="text-blue-800 dark:text-blue-200">Tuteurs:</span>
                          <span className="ml-2 font-medium">{users.filter(u => u.role === 'TUTOR').length}</span>
                        </div>
                        <div>
                          <span className="text-blue-800 dark:text-blue-200">Étudiants:</span>
                          <span className="ml-2 font-medium">{users.filter(u => u.role === 'STUDENT').length}</span>
                        </div>
                        <div>
                          <span className="text-blue-800 dark:text-blue-200">Profils complets:</span>
                          <span className="ml-2 font-medium">{users.filter(u => u.profile).length}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}

      {/* Modal Utilisateur */}
      {showUserModal && (
        <UserModal
          user={editingUser}
          onSave={handleSaveUser}
          onClose={() => {
            setShowUserModal(false);
            setEditingUser(null);
          }}
        />
      )}

      {/* Modal Session */}
      {showSessionModal && (
        <SessionModal
          session={editingSession}
          users={users}
          onSave={handleSaveSession}
          onClose={() => {
            setShowSessionModal(false);
            setEditingSession(null);
          }}
        />
      )}
    </div>
  );
}

// Composant Modal pour les utilisateurs
function UserModal({ user, onSave, onClose }: {
  user: User | null;
  onSave: (userId: string, userData: Partial<User>) => Promise<void> | void | ((userData: Partial<User>) => Promise<void> | void);
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    role: user?.role || 'STUDENT',
    is_active: user?.is_active ?? true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      (onSave as (userId: string, userData: Partial<User>) => Promise<void>)(user.id, formData);
    } else {
      (onSave as (userData: Partial<User>) => Promise<void>)(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {user ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Prénom
            </label>
            <input
              type="text"
              value={formData.first_name}
              onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nom
            </label>
            <input
              type="text"
              value={formData.last_name}
              onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Rôle
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value as 'STUDENT' | 'TUTOR' | 'ADMIN' })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
            >
              <option value="STUDENT">Étudiant</option>
              <option value="TUTOR">Tuteur</option>
              <option value="ADMIN">Administrateur</option>
            </select>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
              className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
              Compte actif
            </label>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              {user ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Composant Modal pour les sessions
function SessionModal({ session, users, onSave, onClose }: {
  session: Session | null;
  users: User[];
  onSave: (sessionId: string, sessionData: Partial<Session>) => Promise<void> | void | ((sessionData: Partial<Session>) => Promise<void> | void);
  onClose: () => void;
}) {
  const [formData, setFormData] = useState({
    student_id: session?.student_id || '',
    tutor_id: session?.tutor_id || '',
    subject: session?.subject || '',
    level: session?.level || '',
    type: session?.type || 'NOTA' as 'NOTA' | 'AVA' | 'TODA',
    status: session?.status || 'SCHEDULED' as 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED',
    duration_minutes: session?.duration_minutes || 60,
    student_rating: session?.student_rating || undefined
  });

  const students = users.filter(u => u.role === 'STUDENT');
  const tutors = users.filter(u => u.role === 'TUTOR');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (session) {
      (onSave as (sessionId: string, sessionData: Partial<Session>) => Promise<void>)(session.id, formData);
    } else {
      (onSave as (sessionData: Partial<Session>) => Promise<void>)(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {session ? 'Modifier la session' : 'Créer une session'}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Étudiant
            </label>
            <select
              value={formData.student_id}
              onChange={(e) => setFormData({ ...formData, student_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Sélectionner un étudiant</option>
              {students.map(student => (
                <option key={student.id} value={student.id}>
                  {student.first_name} {student.last_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tuteur
            </label>
            <select
              value={formData.tutor_id}
              onChange={(e) => setFormData({ ...formData, tutor_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              required
            >
              <option value="">Sélectionner un tuteur</option>
              {tutors.map(tutor => (
                <option key={tutor.id} value={tutor.id}>
                  {tutor.first_name} {tutor.last_name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Matière
            </label>
            <input
              type="text"
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Niveau
            </label>
            <input
              type="text"
              value={formData.level}
              onChange={(e) => setFormData({ ...formData, level: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Type de session
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as "NOTA" | "AVA" | "TODA" })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
            >
              <option value="NOTA">NOTA</option>
              <option value="AVA">AVA</option>
              <option value="TODA">TODA</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Statut
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
            >
              <option value="SCHEDULED">Programmée</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="COMPLETED">Terminée</option>
              <option value="CANCELLED">Annulée</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Durée (minutes)
            </label>
            <input
              type="number"
              value={formData.duration_minutes}
              onChange={(e) => setFormData({ ...formData, duration_minutes: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              min="15"
              max="180"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Note de l'étudiant (1-5)
            </label>
            <input
              type="number"
              value={formData.student_rating || ''}
              onChange={(e) => setFormData({ ...formData, student_rating: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-primary dark:bg-gray-700 dark:text-white"
              min="1"
              max="5"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-600 rounded-md hover:bg-gray-300 dark:hover:bg-gray-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              {session ? 'Modifier' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
