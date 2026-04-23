import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';

export async function PATCH(request: Request) {
  try {
    const user = await getUserSession();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: 'Mot de passe actuel et nouveau requis' }, { status: 400 });
    }

    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Le nouveau mot de passe doit contenir au moins 8 caractères' },
        { status: 400 }
      );
    }

    const { data: userRow, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id, password_hash')
      .eq('id', user.id)
      .single();

    if (fetchError || !userRow) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, (userRow as any).password_hash);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    const { error: updateError } = await (supabaseAdmin as any)
      .from('users')
      .update({ password_hash: hashedPassword, updated_at: new Date().toISOString() } as any)
      .eq('id', user.id);

    if (updateError) {
      console.error('Erreur mise à jour mot de passe étudiant:', updateError);
      return NextResponse.json({ error: 'Échec de la mise à jour du mot de passe' }, { status: 500 });
    }

    await (supabaseAdmin as any).from('notifications').insert({
      user_id: user.id,
      type: 'PASSWORD',
      title: 'Mot de passe modifié',
      message: 'Votre mot de passe a été modifié avec succès.',
      data: {
        action: 'PASSWORD_CHANGED',
        changed_at: new Date().toISOString(),
      },
      is_read: false,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur PATCH mot de passe étudiant:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

