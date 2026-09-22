import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { canAccessAdminFeatures } from '@/lib/admin-permissions';
import { setUserActive } from '@/lib/user-management';

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
      .from('profiles')
      .select('id, email')
      .eq('id', userId)
      .single();

    if (userError || !existingUser) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    // Vérifier que l'email n'est pas déjà utilisé par un autre utilisateur
    if (email !== (existingUser as any).email) {
      const { data: emailExists } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', email)
        .neq('id', userId)
        .single();

      if (emailExists) {
        return NextResponse.json({ error: 'Un utilisateur avec cet e-mail existe déjà' }, { status: 400 });
      }
    }

    // Mettre à jour l'utilisateur
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      email: normalizedEmail,
      email_confirm: true,
      app_metadata: { role },
      user_metadata: { first_name, last_name },
    });
    if (authUpdateError) {
      return NextResponse.json({ error: 'Impossible de mettre à jour l’identité Auth' }, { status: 500 });
    }

    const updateData = {
      first_name,
      last_name,
      role,
      updated_at: new Date().toISOString()
    } as any;

    const { data: updatedUser, error: updateError } = await (supabaseAdmin as any)
      .from('profiles')
      .update(updateData)
      .eq('id', userId)
      .select()
      .single();

    if (updateError) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', updateError);
      return NextResponse.json({ error: 'Impossible de mettre à jour l’utilisateur' }, { status: 500 });
    }

    if (typeof is_active === 'boolean' && is_active !== updatedUser.is_active) {
      await setUserActive(userId, is_active);
      updatedUser.is_active = is_active;
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
      .from('profiles')
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

    // Supprimer l'identité Auth ; la FK profiles(id) ON DELETE CASCADE nettoie
    // le profil et toutes les données métier dépendantes.
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(userId);

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
