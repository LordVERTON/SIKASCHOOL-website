import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { hasAdminPermissions } from '@/lib/admin-permissions';

export async function PUT(
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
    const { first_name, last_name, email, role, is_active } = await request.json();

    // Vérifier que l'utilisateur existe
    const { data: existingUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (userError || !existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Vérifier que l'email n'est pas déjà utilisé par un autre utilisateur
    if (email !== (existingUser as any).email) {
      const { data: emailExists } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('email', email)
        .neq('id', userId)
        .single();

      if (emailExists) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
      }
    }

    // Mettre à jour l'utilisateur
    const updateData = {
      first_name,
      last_name,
      email,
      role,
      is_active,
      updated_at: new Date().toISOString()
    } as any;

    const { data: updatedUser, error: updateError } = await (supabaseAdmin as any)
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', updateError);
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    return NextResponse.json({ 
      user: updatedUser,
      message: 'User updated successfully' 
    });
  } catch (error) {
    console.error('Erreur dans /api/admin/users/[userId] PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
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

    // Vérifier que l'utilisateur existe
    const { data: existingUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('id', userId)
      .single();

    if (userError || !existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Empêcher la suppression des tuteurs admin
    if ((existingUser as any).email === 'daniel.verton@sikaschool.com' || 
        (existingUser as any).email === 'ruudy.mbouza-bayonne@sikaschool.com') {
      return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 403 });
    }

    // Supprimer l'utilisateur (cascade supprimera les credentials et autres données liées)
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', deleteError);
      return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'User deleted successfully' 
    });
  } catch (error) {
    console.error('Erreur dans /api/admin/users/[userId] DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
