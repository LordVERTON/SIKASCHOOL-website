import { supabaseAdmin } from '@/lib/supabase';

/**
 * Aligne auth.users avec public.users : même id UUID et même mot de passe,
 * pour que le client puisse utiliser signInWithPassword et que Realtime respecte RLS (auth.uid).
 */
export async function syncSupabaseAuthIdentity(params: {
  userId: string;
  email: string;
  password: string;
}): Promise<{ ok: true } | { ok: false; message: string }> {
  const normalizedEmail = params.email.trim().toLowerCase();

  const { data: existing, error: getErr } = await supabaseAdmin.auth.admin.getUserById(params.userId);

  if (getErr && !String(getErr.message || '').toLowerCase().includes('not found')) {
    console.warn('[supabase-auth-sync] getUserById:', getErr.message);
  }

  if (existing?.user) {
    const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(params.userId, {
      email: normalizedEmail,
      password: params.password,
      email_confirm: true,
    });
    if (updErr) {
      console.warn('[supabase-auth-sync] updateUserById:', updErr.message);
      return { ok: false, message: updErr.message };
    }
    return { ok: true };
  }

  const { error: createErr } = await supabaseAdmin.auth.admin.createUser({
    id: params.userId,
    email: normalizedEmail,
    password: params.password,
    email_confirm: true,
  });

  if (createErr) {
    console.warn('[supabase-auth-sync] createUser:', createErr.message);
    return { ok: false, message: createErr.message };
  }

  return { ok: true };
}
