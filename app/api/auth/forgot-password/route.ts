import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { randomBytes } from 'node:crypto';
import { CREDENTIAL_TYPES } from '@/lib/constants';
import { sendPasswordResetEmail } from '@/lib/registration-emails';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 heure

export async function POST(request: NextRequest) {
  try {
    const genericSuccessMessage = 'Si cette adresse e-mail existe dans notre système, un lien de réinitialisation a été envoyé.';
    const body = await request.json();
    const { email } = body || {};

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: 'Adresse e-mail requise' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Vérifier si l'utilisateur existe
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, first_name, email')
      .eq('email', normalizedEmail)
      .single();

    if (userError || !user) {
      // Ne pas révéler si l'e-mail existe ou non (sécurité)
      return NextResponse.json({ 
        success: true,
        message: genericSuccessMessage
      });
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS).toISOString();
    const now = new Date().toISOString();

    const { error: tokenError } = await supabase.from('user_credentials').upsert(
      {
        user_id: user.id,
        credential_type: CREDENTIAL_TYPES.PASSWORD_RESET,
        credential_value: token,
        is_active: true,
        expires_at: expiresAt,
        updated_at: now,
      },
      { onConflict: 'user_id,credential_type' }
    );

    if (tokenError) {
      console.error('Erreur lors de la création du token de reset:', tokenError);
      return NextResponse.json({ error: 'Erreur lors de la réinitialisation' }, { status: 500 });
    }

    await sendPasswordResetEmail({
      to: user.email,
      firstName: user.first_name,
      resetToken: token,
    });

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        type: 'PASSWORD',
        title: 'Réinitialisation demandée',
        message: 'Un lien de réinitialisation de mot de passe vient d’être envoyé à votre adresse e-mail.',
        data: {
          action: 'PASSWORD_RESET_REQUESTED',
          trigger: 'FORGOT_PASSWORD',
          occurred_at: now
        }
      });

    if (notificationError) {
      console.error('Erreur lors de la création de la notification de mot de passe:', notificationError);
    }

    return NextResponse.json({ 
      success: true,
      message: genericSuccessMessage
    });

  } catch (error) {
    console.error('Erreur API forgot-password:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

