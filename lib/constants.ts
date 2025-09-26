/**
 * Constantes centralisées pour l'application
 */

// Types de rôles
export const USER_ROLES = {
  ADMIN: 'ADMIN',
  TUTOR: 'TUTOR',
  STUDENT: 'STUDENT'
} as const;

export type UserRole = typeof USER_ROLES[keyof typeof USER_ROLES];

// Routes publiques
export const PUBLIC_ROUTES = [
  '/',
  '/about',
  '/how-it-works',
  '/pricing',
  '/book',
  '/auth/signin',
  '/auth/signup',
  '/legal',
  '/api/auth/login',
  '/api/auth/logout',
  '/api/auth/me'
] as const;

// Redirections par rôle
export const ROLE_REDIRECTS = {
  [USER_ROLES.ADMIN]: '/admin',
  [USER_ROLES.TUTOR]: '/tutor',
  [USER_ROLES.STUDENT]: '/student'
} as const;

// Routes protégées par rôle
export const PROTECTED_ROUTES = {
  '/student': USER_ROLES.STUDENT,
  '/tutor': USER_ROLES.TUTOR,
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
  PASSWORD: 'password'
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
  },
  STUDENT: {
    DASHBOARD: '/api/student/dashboard',
    COURSES: '/api/student/courses',
    ASSIGNMENTS: '/api/student/assignments',
    NOTIFICATIONS: '/api/student/notifications',
    SESSIONS: '/api/student/sessions',
    TUTORS: '/api/student/tutors',
    BOOKING: '/api/student/booking'
  },
  TUTOR: {
    SESSIONS: '/api/tutor/sessions',
    PAYMENTS: '/api/tutor/payments'
  },
  ADMIN: {
    PRICING: '/api/admin/pricing',
    USER_CREDENTIALS: '/api/admin/users/credentials'
  }
} as const;

// Configuration de l'application
export const APP_CONFIG = {
  NAME: 'SikaSchool',
  DESCRIPTION: 'Plateforme de cours particuliers',
  VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@sikaschool.com'
} as const;

// Types de sessions
export const SESSION_TYPES = {
  TRIAL: 'TRIAL',
  REGULAR: 'REGULAR'
} as const;

// Statuts de réservation
export const BOOKING_STATUS = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const;

// Niveaux académiques
export const ACADEMIC_LEVELS = {
  ELEMENTARY: 'ELEMENTARY',
  MIDDLE_SCHOOL: 'MIDDLE_SCHOOL',
  HIGH_SCHOOL: 'HIGH_SCHOOL',
  UNIVERSITY: 'UNIVERSITY'
} as const;
