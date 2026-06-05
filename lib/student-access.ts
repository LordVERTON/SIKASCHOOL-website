import type { User } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';

export function canAccessStudentFeatures<T extends Pick<User, 'role'>>(
  user: T | null | undefined
): user is T {
  return user?.role === 'STUDENT' || user?.role === 'PARENT';
}

export function getStudentSpaceBasePath(role: string | null | undefined): '/student' | '/family' {
  return role === 'PARENT' ? '/family' : '/student';
}

export interface EffectiveStudentAccess {
  accountUserId: string;
  effectiveStudentId: string;
  isParent: boolean;
  linkedStudent: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  } | null;
}

export async function getEffectiveStudentAccess(
  user: Pick<User, 'id' | 'role'>
): Promise<EffectiveStudentAccess | null> {
  if (user.role === 'STUDENT') {
    return {
      accountUserId: user.id,
      effectiveStudentId: user.id,
      isParent: false,
      linkedStudent: null,
    };
  }

  if (user.role !== 'PARENT') {
    return null;
  }

  const { data, error } = await (supabaseAdmin as any)
    .from('students')
    .select(`
      user_id,
      users:user_id (
        id,
        email,
        first_name,
        last_name,
        avatar_url
      )
    `)
    .eq('parents_linked', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Erreur résolution élève lié au parent:', error);
    return null;
  }

  const linked = Array.isArray(data?.users) ? data.users[0] : data?.users;
  if (!data?.user_id || !linked) {
    return null;
  }

  return {
    accountUserId: user.id,
    effectiveStudentId: data.user_id,
    isParent: true,
    linkedStudent: {
      id: linked.id,
      email: linked.email,
      firstName: linked.first_name,
      lastName: linked.last_name,
      avatarUrl: linked.avatar_url,
    },
  };
}
