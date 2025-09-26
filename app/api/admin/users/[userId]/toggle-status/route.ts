import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabase } from '@/lib/supabase';
import { hasAdminPermissions } from '@/lib/admin-permissions';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Vérifier l'authentification
    const user = await getUserSession();
    if (!user || user.role !== 'TUTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier les permissions admin
    if (!hasAdminPermissions(user)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    const { userId } = await params;
    const { is_active } = await request.json();

    // Mettre à jour le statut de l'utilisateur
    const updateData = {
      is_active: is_active,
      updated_at: new Date().toISOString()
    } as any;

    const { error } = await (supabase as any)
      .from('users')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('Erreur lors de la mise à jour du statut:', error);
      return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Utilisateur ${is_active ? 'activé' : 'désactivé'} avec succès`
    });
  } catch (error) {
    console.error('Erreur dans /api/admin/users/[userId]/toggle-status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
