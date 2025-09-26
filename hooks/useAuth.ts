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
 * @param requiredRole - Rôle requis pour accéder à la ressource
 * @returns Objet contenant l'état d'authentification et les fonctions utilitaires
 */
export function useAuth(requiredRole?: UserRole): UseAuthReturn {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  /**
   * Vérifie l'authentification et l'autorisation
   */
  const checkAuth = useCallback(async () => {
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
      if (requiredRole && userData.role !== requiredRole) {
        console.log(`🔒 useAuth: Rôle incorrect. Requis: ${requiredRole}, Reçu: ${userData.role}`);
        setError(`${ERROR_MESSAGES.ACCESS_DENIED} ${requiredRole}`);
        
        // Rediriger vers l'espace approprié selon le rôle
        const redirectPath = ROLE_REDIRECTS[userData.role] || '/auth/signin';
        router.push(redirectPath);
        return;
      }

      setUser(userData);
      console.log(`🔒 useAuth: Utilisateur authentifié - ${userData.email} (${userData.role})`);
      
    } catch (error) {
      console.error('🔒 useAuth: Erreur de vérification:', error);
      setError(ERROR_MESSAGES.AUTH_CHECK_FAILED);
      router.push('/auth/signin');
    } finally {
      setLoading(false);
    }
  }, [requiredRole, router]);

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
