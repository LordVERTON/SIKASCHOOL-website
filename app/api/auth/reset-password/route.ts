import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { updateUserPassword } from '@/lib/user-management';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const token = typeof body?.token === 'string' ? body.token.trim() : '';
  const password = typeof body?.password === 'string' ? body.password : '';
  if (!token || password.length < 8) {
    return NextResponse.json(
      { error: 'Lien valide et mot de passe de 8 caractères minimum requis' },
      { status: 400 },
    );
  }

  try {
    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
    );
    const { data, error } = await authClient.auth.verifyOtp({
      token_hash: token,
      type: 'recovery',
    });
    if (error || !data.user) {
      return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 400 });
    }

    await updateUserPassword(data.user.id, password);
    await supabaseAdmin.from('notifications').insert({
      user_id: data.user.id,
      type: 'PASSWORD',
      title: 'Mot de passe réinitialisé',
      message: 'Votre mot de passe a été modifié avec succès.',
      data: { action: 'PASSWORD_RESET_COMPLETED', completed_at: new Date().toISOString() },
    });
    return NextResponse.json({ success: true, message: 'Votre mot de passe a bien été réinitialisé' });
  } catch (error) {
    console.error('[auth/reset-password]', error);
    return NextResponse.json({ error: 'Impossible de réinitialiser le mot de passe' }, { status: 500 });
  }
}
