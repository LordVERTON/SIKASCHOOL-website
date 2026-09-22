import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { canAccessTutorFeatures } from '@/lib/admin-permissions';
import { updateUserPassword, verifyUserPassword } from '@/lib/user-management';

export async function PATCH(request: Request) {
  const user = await getUserSession();
  if (!user || !canAccessTutorFeatures(user)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  try {
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
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[tutor/password]', error);
    return NextResponse.json({ error: 'Échec de la mise à jour du mot de passe' }, { status: 500 });
  }
}
