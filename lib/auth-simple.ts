/**
 * Système d’authentification simple sans NextAuth.
 * S’appuie sur Supabase pour gérer utilisateurs et identifiants.
 */

import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { supabaseAdmin } from './supabase';
// L'import dynamique de bcryptjs évite certains problèmes de build Edge
import {
  SESSION_CONFIG,
  // CREDENTIAL_TYPES,
  ERROR_MESSAGES,
  ROLE_REDIRECTS,
  type UserRole,
} from './constants';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

interface SessionPayload {
  user: User;
  issuedAt: number;
  expiresAt: number;
}

type SupabaseAuthUser = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
  password_hash: string;
};

const rawSessionSecret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET;

if (!rawSessionSecret) {
  throw new Error('Missing JWT_SECRET or NEXTAUTH_SECRET environment variable for session signing.');
}

const SESSION_SECRET = rawSessionSecret;

function toBase64Url(input: Buffer | string): string {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input, 'utf8');
  return buffer
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function fromBase64Url(value: string): Buffer {
  const padding = value.length % 4 === 0 ? '' : '='.repeat(4 - (value.length % 4));
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/') + padding;
  return Buffer.from(normalized, 'base64');
}

function signPayload(encodedPayload: string): string {
  return toBase64Url(createHmac('sha256', SESSION_SECRET).update(encodedPayload).digest());
}

function encodeSession(user: User): string {
  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + SESSION_CONFIG.MAX_AGE;
  const payload: SessionPayload = { user, issuedAt, expiresAt };
  const encodedPayload = toBase64Url(JSON.stringify(payload));
  const signature = signPayload(encodedPayload);
  return `${encodedPayload}.${signature}`;
}

function decodeSession(token: string): SessionPayload | null {
  const [encodedPayload, signature] = token.split('.');
  if (!encodedPayload || !signature) {
    return null;
  }

  const expectedSignature = signPayload(encodedPayload);
  const providedSignature = Buffer.from(signature, 'utf8');
  const expectedSignatureBuffer = Buffer.from(expectedSignature, 'utf8');

  if (
    providedSignature.length !== expectedSignatureBuffer.length ||
    !timingSafeEqual(providedSignature, expectedSignatureBuffer)
  ) {
    return null;
  }

  try {
    const decoded = JSON.parse(fromBase64Url(encodedPayload).toString('utf8')) as SessionPayload;
    if (!decoded.expiresAt || decoded.expiresAt < Math.floor(Date.now() / 1000)) {
      return null;
    }
    return decoded;
  } catch (error) {
    console.error('[auth] Échec du décodage de session :', error, ERROR_MESSAGES.SESSION_ERROR);
    return null;
  }
}

/**
 * Authentifie un utilisateur avec e-mail + mot de passe.
 * @param email - E-mail utilisateur
 * @param password - Mot de passe en clair
 * @returns Utilisateur si l’authentification réussit, sinon null
 */
export async function authenticateUser(email: string, password: string): Promise<User | null> {
  try {
    console.warn('[auth] Tentative de connexion pour :', email);

    // Récupérer l'utilisateur depuis Supabase
    const { data, error } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, role, is_active, password_hash')
      .eq('email', email)
      .eq('is_active', true)
      .single();

    const user = data as SupabaseAuthUser | null;

    if (error || !user) {
      console.warn('[auth] Utilisateur introuvable ou inactif :', email, error?.message ?? '');
      return null;
    }

    console.warn('[auth] Utilisateur trouvé :', user.email, 'Rôle :', user.role);

    // Vérifier le mot de passe stocké dans la table users
    const bcrypt = await import('bcryptjs');
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      console.warn('[auth] Mot de passe invalide pour :', user.email);
      return null;
    }

    console.warn('[auth] Connexion réussie pour :', user.email);

    return {
      id: user.id,
      email: user.email,
      name: `${user.first_name} ${user.last_name}`.trim(),
      role: user.role,
    };
  } catch (error) {
    console.error('[auth] Erreur d’authentification :', error, ERROR_MESSAGES.AUTHENTICATION_ERROR);
    return null;
  }
}

/**
 * Persiste la session utilisateur dans un cookie HTTPOnly signé.
 * @param user - Utilisateur à stocker
 */
export async function setUserSession(user: User): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_CONFIG.COOKIE_NAME, encodeSession(user), {
    httpOnly: true,
    secure: SESSION_CONFIG.SECURE,
    sameSite: SESSION_CONFIG.SAME_SITE,
    maxAge: SESSION_CONFIG.MAX_AGE,
    path: '/',
  });
}

/**
 * Récupère la session utilisateur depuis le cookie signé.
 * @returns Utilisateur si la session est valide, sinon null
 */
export async function getUserSession(): Promise<User | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get(SESSION_CONFIG.COOKIE_NAME);

    if (!sessionCookie) {
      return null;
    }

    const session = decodeSession(sessionCookie.value);
    return session?.user ?? null;
  } catch (error) {
    console.error('[auth] Erreur de session :', error, ERROR_MESSAGES.SESSION_ERROR);
    return null;
  }
}

/**
 * Supprime la session utilisateur des cookies.
 */
export async function clearUserSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_CONFIG.COOKIE_NAME);
}

/**
 * Garantit que l’utilisateur est authentifié et, optionnellement, qu’il a le bon rôle.
 * @param requiredRole - Rôle requis pour accéder à la ressource
 * @returns Utilisateur authentifié et autorisé
 */
export async function requireAuth(requiredRole?: UserRole): Promise<User> {
  const user = await getUserSession();

  if (!user) {
    redirect('/auth/signin');
  }

  if (requiredRole && user.role !== requiredRole) {
    // Rediriger vers l'espace adapté au rôle détecté
    const redirectPath = ROLE_REDIRECTS[user.role] || '/';
    redirect(redirectPath);
  }

  return user;
}

