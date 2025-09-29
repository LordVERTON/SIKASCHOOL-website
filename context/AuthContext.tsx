"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS, ROLE_REDIRECTS, ERROR_MESSAGES, type UserRole } from '@/lib/constants';

// Types
interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  hasRole: (role: string) => boolean;
  refreshAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Cache global pour éviter les appels API répétés
let authCache: {
  user: User | null;
  loading: boolean;
  lastCheck: number;
} = {
  user: null,
  loading: false,
  lastCheck: 0
};

const CACHE_DURATION = 30000; // 30 secondes

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(authCache.user);
  const [loading, setLoading] = useState(authCache.loading);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const checkAuth = useCallback(async (force = false) => {
    const now = Date.now();
    
    // Utiliser le cache si disponible et pas expiré
    if (!force && authCache.user && (now - authCache.lastCheck) < CACHE_DURATION) {
      setUser(authCache.user);
      setLoading(false);
      return;
    }

    // Éviter les appels multiples
    if (authCache.loading) {
      return;
    }

    try {
      authCache.loading = true;
      setLoading(true);
      setError(null);

      const response = await fetch(API_ENDPOINTS.AUTH.ME);
      
      if (!response.ok) {
        if (response.status === 401) {
          authCache.user = null;
          authCache.lastCheck = now;
          setUser(null);
          router.push('/auth/signin');
          return;
        }
        throw new Error(ERROR_MESSAGES.AUTH_CHECK_FAILED);
      }

      const userData: User = await response.json();
      
      // Mettre à jour le cache
      authCache.user = userData;
      authCache.lastCheck = now;
      setUser(userData);
      
    } catch (error) {
      console.error('🔒 AuthContext: Erreur de vérification:', error);
      setError(ERROR_MESSAGES.AUTH_CHECK_FAILED);
      router.push('/auth/signin');
    } finally {
      authCache.loading = false;
      setLoading(false);
    }
  }, [router]);

  const logout = useCallback(async () => {
    try {
      await fetch(API_ENDPOINTS.AUTH.LOGOUT, { method: 'POST' });
      authCache.user = null;
      authCache.lastCheck = 0;
      setUser(null);
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('🔒 AuthContext:', ERROR_MESSAGES.LOGOUT_FAILED, error);
    }
  }, [router]);

  const refreshAuth = useCallback(async () => {
    await checkAuth(true);
  }, [checkAuth]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const value = {
    user,
    loading,
    error,
    logout,
    isAuthenticated: !!user,
    hasRole: (role: string) => user?.role === role,
    refreshAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(requiredRole?: UserRole | UserRole[]): AuthContextType {
  const context = useContext(AuthContext);
  const router = useRouter();
  
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  const { user, loading, error, logout, isAuthenticated, hasRole, refreshAuth } = context;

  // Vérifier le rôle si requis
  useEffect(() => {
    if (user && requiredRole) {
      const allowedRoles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!allowedRoles.includes(user.role)) {
        console.log(`🔒 useAuth: Rôle incorrect. Requis: ${allowedRoles.join(' ou ')}, Reçu: ${user.role}`);
        
        // Rediriger vers l'espace approprié selon le rôle
        const redirectPath = ROLE_REDIRECTS[user.role] || '/auth/signin';
        router.push(redirectPath);
      }
    }
  }, [user, requiredRole, router]);

  return {
    user,
    loading,
    error,
    logout,
    isAuthenticated,
    hasRole,
    refreshAuth
  };
}
