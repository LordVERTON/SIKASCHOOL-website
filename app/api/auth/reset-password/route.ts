import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { createClient } from '@supabase/supabase-js';
import { CREDENTIAL_TYPES } from '@/lib/constants';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const token = typeof body?.token === 'string' ? body.token.trim() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!token) {
      return NextResponse.json({ error: 'Jeton de réinitialisation manquant.' }, { status: 400 });
    }

    if (!password || password.length < 6) {
      return NextResponse.json({ error: 'Le mot de passe doit contenir au moins 6 caractères.' }, { status: 400 });
    }

    const { data: credential, error: credentialError } = await supabase
      .from('user_credentials')
      .select('user_id, expires_at, is_active')
      .eq('credential_type', CREDENTIAL_TYPES.PASSWORD_RESET)
      .eq('credential_value', token)
      .eq('is_active', true)
      .maybeSingle();

    if (credentialError || !credential) {
      return NextResponse.json({ error: 'Lien invalide ou expiré.' }, { status: 400 });
    }

    if (credential.expires_at && new Date(credential.expires_at).getTime() < Date.now()) {
      return NextResponse.json({ error: 'Lien expiré. Veuillez refaire une demande.' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        updated_at: now,
      })
      .eq('id', credential.user_id);

    if (updateError) {
      console.error('Erreur lors de la mise à jour du mot de passe:', updateError);
      return NextResponse.json({ error: 'Impossible de réinitialiser le mot de passe.' }, { status: 500 });
    }

    await supabase
      .from('user_credentials')
      .update({
        is_active: false,
        updated_at: now,
      })
      .eq('user_id', credential.user_id)
      .eq('credential_type', CREDENTIAL_TYPES.PASSWORD_RESET);

    await supabase.from('notifications').insert({
      user_id: credential.user_id,
      type: 'PASSWORD',
      title: 'Mot de passe réinitialisé',
      message: 'Votre mot de passe a été modifié avec succès.',
      data: {
        action: 'PASSWORD_RESET_COMPLETED',
        completed_at: now,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Votre mot de passe a bien été réinitialisé.',
    });
  } catch (error) {
    console.error('Erreur API reset-password:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
  }
}
