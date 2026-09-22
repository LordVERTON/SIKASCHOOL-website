import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { ROLE_REDIRECTS, type UserRole } from '@/lib/constants';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
}

export async function getUserSession(): Promise<User | null> {
  const session = await auth();
  const user = session?.user;
  if (!user?.id || !user.email || !user.role) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name || user.email,
    role: user.role,
  };
}

export async function requireAuth(requiredRole?: UserRole): Promise<User> {
  const user = await getUserSession();
  if (!user) redirect('/auth/signin');
  if (requiredRole && user.role !== requiredRole) {
    redirect(ROLE_REDIRECTS[user.role] || '/auth/signin');
  }
  return user;
}
