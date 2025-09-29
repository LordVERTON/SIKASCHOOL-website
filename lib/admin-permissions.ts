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
  // Les utilisateurs avec le rôle ADMIN ont toujours les permissions admin
  if (user.role === 'ADMIN') {
    return true;
  }
  // Les tuteurs avec email spécifique ont aussi les permissions admin
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
 * Vérifie si un utilisateur peut accéder aux fonctionnalités tutor
 * @param user - Objet utilisateur avec email et role
 * @returns true si l'utilisateur peut accéder aux fonctionnalités tutor, false sinon
 */
export function canAccessTutorFeatures(user: { email: string; role: string }): boolean {
  // Les utilisateurs avec le rôle ADMIN ont accès aux fonctionnalités tutor
  if (user.role === 'ADMIN') {
    return true;
  }
  // Les tuteurs ont accès aux fonctionnalités tutor
  return user.role === 'TUTOR';
}

/**
 * Vérifie si un utilisateur peut accéder aux fonctionnalités admin
 * @param user - Objet utilisateur avec email et role
 * @returns true si l'utilisateur peut accéder aux fonctionnalités admin, false sinon
 */
export function canAccessAdminFeatures(user: { email: string; role: string }): boolean {
  // Les utilisateurs avec le rôle ADMIN ont toujours accès aux fonctionnalités admin
  if (user.role === 'ADMIN') {
    return true;
  }
  // Les tuteurs avec email spécifique ont aussi accès aux fonctionnalités admin
  return user.role === 'TUTOR' && isAdminTutor(user.email);
}
