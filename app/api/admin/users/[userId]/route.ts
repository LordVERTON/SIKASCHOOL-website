import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { canAccessAdminFeatures } from '@/lib/admin-permissions';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Vérifier l'authentification et les permissions admin
    const user = await getUserSession();
    if (!user || !canAccessAdminFeatures(user)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
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
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
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
        return NextResponse.json({ error: 'Un utilisateur avec cet e-mail existe déjà' }, { status: 400 });
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
      return NextResponse.json({ error: 'Impossible de mettre à jour l’utilisateur' }, { status: 500 });
    }

    return NextResponse.json({ 
      user: updatedUser,
      message: 'Utilisateur mis à jour avec succès' 
    });
  } catch (error) {
    console.error('Erreur dans /api/admin/users/[userId] PUT:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Vérifier l'authentification et les permissions admin
    const user = await getUserSession();
    if (!user || !canAccessAdminFeatures(user)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { userId } = await params;

    // Vérifier que l'utilisateur existe
    const { data: existingUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name')
      .eq('id', userId)
      .single();

    if (userError || !existingUser) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    // Empêcher la suppression des tuteurs admin
    if ((existingUser as any).email === 'daniel.verton@sikaschool.com' || 
        (existingUser as any).email === 'ruudy.mbouza-bayonne@sikaschool.com') {
      return NextResponse.json({ error: 'Suppression des administrateurs interdite' }, { status: 403 });
    }

    // Supprimer l'utilisateur (cascade supprimera les credentials et autres données liées)
    const { error: deleteError } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId);

    if (deleteError) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', deleteError);
      return NextResponse.json({ error: 'Impossible de supprimer l’utilisateur' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Utilisateur supprimé avec succès' 
    });
  } catch (error) {
    console.error('Erreur dans /api/admin/users/[userId] DELETE:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
