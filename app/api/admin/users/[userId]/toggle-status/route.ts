import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { canAccessAdminFeatures } from '@/lib/admin-permissions';
import { setUserActive } from '@/lib/user-management';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Vérifier l'authentification et les permissions admin
    const user = await getUserSession();
    if (!user || !canAccessAdminFeatures(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId } = await params;
    const { is_active } = await request.json();

    if (typeof is_active !== 'boolean') {
      return NextResponse.json({ error: 'is_active doit être un booléen' }, { status: 400 });
    }
    await setUserActive(userId, is_active);

    return NextResponse.json({ 
      success: true, 
      message: `Utilisateur ${is_active ? 'activé' : 'désactivé'} avec succès`
    });
  } catch (error) {
    console.error('Erreur dans /api/admin/users/[userId]/toggle-status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
