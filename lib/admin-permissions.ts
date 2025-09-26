/**
 * Utilitaires pour la gestion des permissions administrateur
 * Permet de vérifier si un utilisateur a les droits d'administration
 */

// Emails des tuteurs ayant les permissions administrateur
const ADMIN_TUTOR_EMAILS = [
  'daniel.verton@sikaschool.com',
  'ruudy.mbouza-bayonne@sikaschool.com'
];

/**
 * Vérifie si un email correspond à un tuteur administrateur
 * @param email - Email de l'utilisateur à vérifier
 * @returns true si l'utilisateur est un tuteur admin, false sinon
 */
export function isAdminTutor(email: string): boolean {
  return ADMIN_TUTOR_EMAILS.includes(email);
}

/**
 * Vérifie si un utilisateur a les permissions administrateur
 * @param user - Objet utilisateur avec email et role
 * @returns true si l'utilisateur a les permissions admin, false sinon
 */
export function hasAdminPermissions(user: { email: string; role: string }): boolean {
  return user.role === 'TUTOR' && isAdminTutor(user.email);
}

/**
 * Middleware pour vérifier les permissions administrateur
 * @param user - Objet utilisateur
 * @returns true si autorisé, false sinon
 */
export function requireAdminPermissions(user: { email: string; role: string }): boolean {
  if (!user) {
    return false;
  }
  
  return hasAdminPermissions(user);
}

/**
 * Retourne la liste des emails des tuteurs administrateur
 * @returns Array des emails des tuteurs admin
 */
export function getAdminTutorEmails(): string[] {
  return [...ADMIN_TUTOR_EMAILS];
}

/**
 * Vérifie si un utilisateur peut accéder à une fonctionnalité admin
 * @param userEmail - Email de l'utilisateur
 * @param userRole - Rôle de l'utilisateur
 * @returns true si l'accès est autorisé, false sinon
 */
export function canAccessAdminFeatures(userEmail: string, userRole: string): boolean {
  return userRole === 'TUTOR' && isAdminTutor(userEmail);
}
