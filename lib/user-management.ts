import { createClient } from '@supabase/supabase-js';
import { supabaseAdmin } from '@/lib/supabase';
import type { UserRole } from '@/lib/constants';

export type ApplicationUser = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_active: boolean;
};

export async function createApplicationUser(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  role: UserRole;
}): Promise<ApplicationUser> {
  const email = input.email.trim().toLowerCase();
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const phone = input.phone?.trim() || undefined;

  const { data, error } = await supabaseAdmin.auth.admin.createUser({
    email,
    password: input.password,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName },
    app_metadata: { role: input.role },
  });
  if (error || !data.user) throw error || new Error('Auth user creation failed');

  const { data: profile, error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({
      email,
      first_name: firstName,
      last_name: lastName,
      phone: phone || null,
      role: input.role,
      is_active: true,
      email_verified: true,
    })
    .eq('id', data.user.id)
    .select('id, email, first_name, last_name, role, is_active')
    .single();

  if (profileError || !profile) {
    await supabaseAdmin.auth.admin.deleteUser(data.user.id);
    throw profileError || new Error('Profile creation failed');
  }

  if (input.role === 'STUDENT') {
    const { error: studentError } = await supabaseAdmin.from('students').insert({
      user_id: data.user.id,
      email,
      phone: phone || null,
      first_name: firstName,
      last_name: lastName,
      grade_level: 'Non spécifié',
      academic_goals: 'Non spécifié',
      is_active: true,
      email_verified: true,
    });
    if (studentError) {
      await supabaseAdmin.auth.admin.deleteUser(data.user.id);
      throw studentError;
    }
  } else if (input.role === 'TUTOR') {
    const { error: tutorError } = await supabaseAdmin.from('tutors').insert({
      user_id: data.user.id,
      bio: 'Bio à compléter',
      subjects: [],
      experience_years: 0,
      is_available: true,
    });
    if (tutorError) {
      await supabaseAdmin.auth.admin.deleteUser(data.user.id);
      throw tutorError;
    }
  }

  return profile as ApplicationUser;
}

export async function verifyUserPassword(email: string, password: string): Promise<boolean> {
  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  );
  const { error } = await authClient.auth.signInWithPassword({ email, password });
  return !error;
}

export async function updateUserPassword(userId: string, password: string): Promise<void> {
  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, { password });
  if (error) throw error;
}

export async function setUserActive(userId: string, active: boolean): Promise<void> {
  const { error: authError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    ban_duration: active ? 'none' : '876000h',
  });
  if (authError) throw authError;

  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .update({ is_active: active })
    .eq('id', userId);
  if (profileError) throw profileError;
}
