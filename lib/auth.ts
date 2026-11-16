import { redirect } from 'next/navigation';
import { auth } from '@/auth';
import { ROLE_REDIRECTS, type UserRole } from '@/lib/constants';
import { supabaseAdmin } from '@/lib/supabase';

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

  // JWT roles can remain valid for days. Recheck revocation and role changes
  // before an API/service grants access using the service-role database client.
  const { data: profile, error } = await supabaseAdmin.from('profiles')
    .select('role, is_active').eq('id', user.id)
    .abortSignal(AbortSignal.timeout(5000)).maybeSingle();
  if (error) throw new Error('Authorization temporarily unavailable');
  if (!profile?.is_active) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name || user.email,
    role: profile.role,
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
