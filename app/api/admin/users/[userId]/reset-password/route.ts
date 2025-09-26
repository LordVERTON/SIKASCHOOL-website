import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabase } from '@/lib/supabase';
import { hasAdminPermissions } from '@/lib/admin-permissions';
import bcrypt from 'bcryptjs';

export async function POST(
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

    // Générer un nouveau mot de passe temporaire
    const tempPassword = Math.random().toString(36).slice(-8);
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Mettre à jour le mot de passe dans user_credentials
    const updateData = {
      credential_value: hashedPassword,
      updated_at: new Date().toISOString()
    } as any;

    const { error: updateError } = await (supabase as any)
      .from('user_credentials')
      .update(updateData)
      .eq('user_id', userId)
      .eq('credential_type', 'password');

    if (updateError) {
      console.error('Erreur lors de la mise à jour du mot de passe:', updateError);
      return NextResponse.json({ error: 'Failed to reset password' }, { status: 500 });
    }

    // Retourner le mot de passe temporaire (en production, il faudrait l'envoyer par email)
    return NextResponse.json({ 
      success: true, 
      tempPassword: tempPassword,
      message: 'Mot de passe réinitialisé avec succès'
    });
  } catch (error) {
    console.error('Erreur dans /api/admin/users/[userId]/reset-password:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
