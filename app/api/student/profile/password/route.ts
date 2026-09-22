import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { canAccessStudentFeatures } from '@/lib/student-access';
import { updateUserPassword, verifyUserPassword } from '@/lib/user-management';

export async function PATCH(request: Request) {
  try {
    const user = await getUserSession();
    if (!canAccessStudentFeatures(user)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const currentPassword = typeof body.currentPassword === 'string' ? body.currentPassword : '';
    const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';
    if (!currentPassword || newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Mot de passe actuel et nouveau mot de passe de 8 caractères minimum requis' },
        { status: 400 },
      );
    }

    if (!(await verifyUserPassword(user.email, currentPassword))) {
      return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 400 });
    }

    await updateUserPassword(user.id, newPassword);
    await supabaseAdmin.from('notifications').insert({
      user_id: user.id,
      type: 'PASSWORD',
      title: 'Mot de passe modifié',
      message: 'Votre mot de passe a été modifié avec succès.',
      data: { action: 'PASSWORD_CHANGED', changed_at: new Date().toISOString() },
      is_read: false,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[student/password]', error);
    return NextResponse.json({ error: 'Échec de la mise à jour du mot de passe' }, { status: 500 });
  }
}
