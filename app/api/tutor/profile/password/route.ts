import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { syncSupabaseAuthIdentity } from '@/lib/supabase-auth-sync';
import { canAccessTutorFeatures } from '@/lib/admin-permissions';

export async function PATCH(request: Request) {
  try {
    const user = await getUserSession();
    if (!user || !canAccessTutorFeatures(user)) {
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

    const valid = await bcrypt.compare(currentPassword, (userRow as any).password_hash);
    if (!valid) {
      return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(newPassword, 12);
    const { error: updateError } = await (supabaseAdmin as any)
      .from('users')
      .update({ password_hash: passwordHash, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (updateError) {
      console.error('Erreur update mot de passe tuteur:', updateError);
      return NextResponse.json({ error: 'Échec de la mise à jour du mot de passe' }, { status: 500 });
    }

    void syncSupabaseAuthIdentity({
      userId: user.id,
      email: user.email,
      password: newPassword,
    }).then((s) => {
      if (!s.ok) console.warn('[tutor/password] Sync Supabase Auth:', s.message);
    });

    await (supabaseAdmin as any).from('notifications').insert({
      user_id: user.id,
      type: 'PASSWORD',
      title: 'Mot de passe modifié',
      message: 'Votre mot de passe tuteur a été modifié avec succès.',
      data: { action: 'PASSWORD_CHANGED', changed_at: new Date().toISOString() },
      is_read: false,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur PATCH /api/tutor/profile/password:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
