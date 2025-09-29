/**
 * Hook personnalisé pour la gestion de l'authentification côté client
 * Vérifie l'authentification et l'autorisation basée sur les rôles
 */

"use client";

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  API_ENDPOINTS, 
  ROLE_REDIRECTS, 
  ERROR_MESSAGES,
  type UserRole 
} from '@/lib/constants';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface UseAuthReturn {
  user: User | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  refreshAuth: () => Promise<void>;
}

/**
 * Hook d'authentification
 * @param requiredRole - Rôle(s) requis pour accéder à la ressource
 * @returns Objet contenant l'état d'authentification et les fonctions utilitaires
 */
export function useAuth(requiredRole?: UserRole | UserRole[]): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  /**
   * Vérifie l'authentification et l'autorisation
   */
  const checkAuth = useCallback(async () => {
    // Éviter les appels multiples si déjà initialisé
    if (isInitialized && user) {
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Vérifier la session via l'API
      const response = await fetch(API_ENDPOINTS.AUTH.ME);
      
      if (!response.ok) {
        if (response.status === 401) {
          console.log('🔒 useAuth: Non authentifié, redirection vers /auth/signin');
          router.push('/auth/signin');
          return;
        }
        throw new Error(ERROR_MESSAGES.AUTH_CHECK_FAILED);
      }

      const userData: User = await response.json();
      
      // Vérifier le rôle si requis
      if (requiredRole) {
        const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
        if (!allowedRoles.includes(userData.role)) {
          console.log(`🔒 useAuth: Rôle incorrect. Requis: ${allowedRoles.join(' ou ')}, Reçu: ${userData.role}`);
          setError(`${ERROR_MESSAGES.ACCESS_DENIED} ${allowedRoles.join(' ou ')}`);
          
          // Rediriger vers l'espace approprié selon le rôle
          const redirectPath = ROLE_REDIRECTS[userData.role] || '/auth/signin';
          router.push(redirectPath);
          return;
        }
      }

      // Éviter les re-rendus inutiles en comparant les données
      setUser(prevUser => {
        if (prevUser && 
            prevUser.id === userData.id && 
            prevUser.email === userData.email && 
            prevUser.role === userData.role) {
          return prevUser; // Pas de changement, éviter le re-render
        }
        console.log(`🔒 useAuth: Utilisateur authentifié - ${userData.email} (${userData.role})`);
        return userData;
      });
      
      setIsInitialized(true);
      
    } catch (error) {
      console.error('🔒 useAuth: Erreur de vérification:', error);
      setError(ERROR_MESSAGES.AUTH_CHECK_FAILED);
      router.push('/auth/signin');
    } finally {
      setLoading(false);
    }
  }, [requiredRole, router, isInitialized, user]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  /**
   * Déconnecte l'utilisateur
   */
  const logout = useCallback(async () => {
    try {
      await fetch(API_ENDPOINTS.AUTH.LOGOUT, { method: 'POST' });
      setUser(null);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('🔒 useAuth:', ERROR_MESSAGES.LOGOUT_FAILED, error);
    }
  }, [router]);

  /**
   * Rafraîchit l'état d'authentification
   */
  const refreshAuth = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  return {
    user,
    loading,
    error,
    logout,
    isAuthenticated: !!user,
    hasRole: (role: string) => user?.role === role,
    refreshAuth
  };
}
