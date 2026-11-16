type AccountRole = { role: string; email?: string } | null | undefined;

/** Authorization comes from the persisted role, never an e-mail address. */
export function hasAdminPermissions(user: AccountRole): boolean {
  return user?.role === 'ADMIN';
}

export const requireAdminPermissions = hasAdminPermissions;
export const canAccessAdminFeatures = hasAdminPermissions;

export function canAccessTutorFeatures(user: AccountRole): boolean {
  return user?.role === 'ADMIN' || user?.role === 'TUTOR';
}
