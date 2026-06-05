/**
 * Constantes centralisées pour l'application
 */

// Types de rôles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  TUTOR: 'TUTOR',
  STUDENT: 'STUDENT',
  PARENT: 'PARENT'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Routes publiques
export const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/how-it-works',
  '/pricing',
  '/packs',
  '/book',
  '/auth/signin',
  '/auth/signup',
  '/auth/reset-password',
  '/auth/verify-email',
  '/legal',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/me',
  '/api/auth/register',
  '/api/auth/signup',
  '/api/auth/forgot-password',
  '/api/auth/reset-password',
  '/api/auth/verify-email',
  '/api/webhooks/stripe'
] as const;

// Redirections par rôle
export const ROLE_REDIRECTS = {
  [USER_ROLES.ADMIN]: '/tutor', // Les admins accèdent à l'espace tuteur avec administration
  [USER_ROLES.TUTOR]: '/tutor',
  [USER_ROLES.STUDENT]: '/student',
  [USER_ROLES.PARENT]: '/family'
} as const;

// Routes protégées par rôle
export const PROTECTED_ROUTES = {
  '/student': USER_ROLES.STUDENT,
  '/family': USER_ROLES.PARENT,
  '/tutor': [USER_ROLES.TUTOR, USER_ROLES.ADMIN], // Les admins peuvent aussi accéder à l'espace tuteur
  '/admin': USER_ROLES.ADMIN
} as const;

// Configuration des cookies
export const SESSION_CONFIG = {
  COOKIE_NAME: 'user-session',
  MAX_AGE: 60 * 60 * 24 * 7, // 7 jours
  SECURE: process.env.NODE_ENV === 'production',
  SAME_SITE: 'lax' as const
} as const;

// Types de credentials
export const CREDENTIAL_TYPES = {
  PASSWORD: 'password',
  EMAIL_VERIFICATION: 'email_verification',
  PASSWORD_RESET: 'password_reset',
  SMS_2FA_ENABLED: 'sms_2fa_enabled',
  SMS_2FA_PHONE: 'sms_2fa_phone',
  SMS_2FA_SETUP: 'sms_2fa_setup',
  SMS_2FA_LOGIN: 'sms_2fa_login'
} as const;

// Messages d'erreur
export const ERROR_MESSAGES = {
  // Authentification
  USER_NOT_FOUND: 'Utilisateur non trouvé ou inactif',
  CREDENTIALS_NOT_FOUND: 'Credentials non trouvés',
  INVALID_PASSWORD: 'Mot de passe invalide',
  AUTHENTICATION_ERROR: 'Erreur d\'authentification',
  SESSION_ERROR: 'Erreur de session',
  AUTH_CHECK_FAILED: 'Erreur de vérification d\'authentification',
  ACCESS_DENIED: 'Accès refusé. Rôle requis:',
  LOGOUT_FAILED: 'Erreur de déconnexion',
  
  // Général
  UNKNOWN_ERROR: 'Une erreur inattendue s\'est produite',
  NETWORK_ERROR: 'Erreur de connexion réseau',
  VALIDATION_ERROR: 'Erreur de validation des données'
} as const;

// Endpoints API
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    ME: '/api/auth/me'
  }
} as const;

// Configuration de l'application
export const APP_CONFIG = {
  NAME: 'SikaSchool',
  DESCRIPTION: 'Plateforme de cours particuliers',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@sikaschool.com'
} as const;


