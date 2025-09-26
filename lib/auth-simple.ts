/**
 * Système d'authentification simple sans NextAuth
 * Utilise Supabase pour la gestion des utilisateurs et des credentials
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from './supabase';
// Import dynamique de bcryptjs pour éviter les problèmes de build
import { 
  SESSION_CONFIG, 
  CREDENTIAL_TYPES, 
  ERROR_MESSAGES, 
  ROLE_REDIRECTS,
  type UserRole 
} from './constants';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

/**
 * Authentifie un utilisateur avec son email et mot de passe
 * @param email - Email de l'utilisateur
 * @param password - Mot de passe en clair
 * @returns User object si authentification réussie, null sinon
 */
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    console.log('🔐 Tentative d\'authentification pour:', email);

    // Récupérer l'utilisateur depuis Supabase
    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, role, is_active')
      .eq('email', email)
      .eq('is_active', true)
      .single() as any;

    if (error || !user) {
      console.log('❌', ERROR_MESSAGES.USER_NOT_FOUND, ':', email, error?.message);
      return null;
    }

    // Type assertion explicite pour résoudre le problème de type Supabase
    const validUser = user as {
      id: string;
      email: string;
      first_name: string;
      last_name: string;
      role: UserRole;
      is_active: boolean;
    };
    
    console.log('✅ Utilisateur trouvé:', validUser.email, 'Rôle:', validUser.role);

    // Récupérer les credentials depuis la table user_credentials
    const { data: credentials, error: credError } = await supabaseAdmin
      .from('user_credentials')
      .select('credential_value')
      .eq('user_id', validUser.id)
      .eq('credential_type', CREDENTIAL_TYPES.PASSWORD)
      .eq('is_active', true)
      .single() as any;

    if (credError || !credentials) {
      console.log('❌', ERROR_MESSAGES.CREDENTIALS_NOT_FOUND, ':', validUser.email, credError?.message);
      return null;
    }

    // Type assertion explicite pour les credentials
    const validCredentials = credentials as {
      credential_value: string;
    };

    console.log('✅ Credentials trouvés pour:', validUser.email);

    // Vérifier le mot de passe
    const bcrypt = await import('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, validCredentials.credential_value);

    if (!isValidPassword) {
      console.log('❌', ERROR_MESSAGES.INVALID_PASSWORD, ':', validUser.email);
      return null;
    }

    console.log('🎉 Authentification réussie pour:', validUser.email);

    return {
      id: validUser.id,
      email: validUser.email,
      name: `${validUser.first_name} ${validUser.last_name}`,
      role: validUser.role
    };
  } catch (error) {
    console.error('❌', ERROR_MESSAGES.AUTHENTICATION_ERROR, ':', error);
    return null;
  }
}

/**
 * Définit la session utilisateur dans un cookie
 * @param user - Objet utilisateur à stocker
 */
export async function setUserSession(user: User): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_CONFIG.COOKIE_NAME, JSON.stringify(user), {
    httpOnly: true,
    secure: SESSION_CONFIG.SECURE,
    sameSite: SESSION_CONFIG.SAME_SITE,
    maxAge: SESSION_CONFIG.MAX_AGE
  });
}

/**
 * Récupère la session utilisateur depuis le cookie
 * @returns User object si session valide, null sinon
 */
export async function getUserSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_CONFIG.COOKIE_NAME);
    
    if (!sessionCookie) {
      return null;
    }

    return JSON.parse(sessionCookie.value);
  } catch (error) {
    console.error('❌', ERROR_MESSAGES.SESSION_ERROR, ':', error);
    return null;
  }
}

/**
 * Supprime la session utilisateur
 */
export async function clearUserSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_CONFIG.COOKIE_NAME);
}

/**
 * Vérifie l'authentification et redirige si nécessaire
 * @param requiredRole - Rôle requis pour accéder à la ressource
 * @returns User object si authentifié et autorisé
 */
export async function requireAuth(requiredRole?: UserRole): Promise<User> {
  const user = await getUserSession();
  
  if (!user) {
    redirect('/auth/signin');
  }

  if (requiredRole && user.role !== requiredRole) {
    // Rediriger vers l'espace approprié selon le rôle
    const redirectPath = ROLE_REDIRECTS[user.role] || '/';
    redirect(redirectPath);
  }

  return user;
}
