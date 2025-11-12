import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sanitizeNameForPassword = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');
};

const buildInitialPassword = (firstName: string, lastName: string) => {
  const safeFirst = sanitizeNameForPassword(firstName) || 'eleve';
  const safeLast = sanitizeNameForPassword(lastName) || 'sikaschool';
  return `${safeFirst}.${safeLast}12345`;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body || {};

    if (!email || typeof email !== 'string' || !email.trim()) {
      return NextResponse.json({ error: 'Adresse e-mail requise' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, first_name, last_name, email')
      .eq('email', normalizedEmail)
      .single();

    if (userError || !user) {
      // Don't reveal if email exists or not for security
      return NextResponse.json({ 
        success: true,
        message: 'Si cette adresse e-mail existe dans notre système, un nouveau mot de passe a été généré.'
      });
    }

    // Generate new password using the same format as registration
    const initialPassword = buildInitialPassword(user.first_name || '', user.last_name || '');
    const hashedPassword = await bcrypt.hash(initialPassword, 12);

    // Update password in database
    const { error: updateError } = await supabase
      .from('users')
      .update({
        password_hash: hashedPassword,
        updated_at: new Date().toISOString()
      })
      .eq('id', user.id);

    if (updateError) {
      console.error('Erreur lors de la réinitialisation du mot de passe:', updateError);
      return NextResponse.json({ error: 'Erreur lors de la réinitialisation' }, { status: 500 });
    }

    const { error: notificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: user.id,
        type: 'PASSWORD',
        title: 'Mot de passe réinitialisé',
        message: 'Votre mot de passe vient d’être réinitialisé. Utilisez le nouveau mot de passe fourni et pensez à le modifier dans votre espace.',
        data: {
          action: 'PASSWORD_RESET',
          trigger: 'FORGOT_PASSWORD',
          occurred_at: new Date().toISOString()
        }
      });

    if (notificationError) {
      console.error('Erreur lors de la création de la notification de mot de passe:', notificationError);
    }

    // Return success with the initial password (will be shown in modal)
    return NextResponse.json({ 
      success: true, 
      initialPassword,
      message: 'Mot de passe réinitialisé avec succès'
    });

  } catch (error) {
    console.error('Erreur API forgot-password:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

