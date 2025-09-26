import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { hasAdminPermissions } from '@/lib/admin-permissions';

export async function GET() {
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

    // Récupérer tous les utilisateurs
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, role, is_active, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    return NextResponse.json(users || []);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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

    const { first_name, last_name, email, role, is_active } = await request.json();

    // Vérifier que l'email n'existe pas déjà
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'Email already exists' }, { status: 400 });
    }

    // Créer un mot de passe temporaire
    const tempPassword = Math.random().toString(36).slice(-8);
    const bcrypt = await import('bcryptjs');
    const hashedPassword = await bcrypt.hash(tempPassword, 12);

    // Créer l'utilisateur
    const { data: newUser, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        first_name,
        last_name,
        email,
        role,
        is_active: is_active ?? true,
        email_verified: false,
        password_hash: hashedPassword // Ajouter le hash temporaire
      } as any)
      .select()
      .single();

    if (userError) {
      console.error('Erreur lors de la création de l\'utilisateur:', userError);
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    // Ajouter les credentials (utiliser le même hash)
    const { error: credError } = await supabaseAdmin
      .from('user_credentials')
      .insert({
        user_id: (newUser as any).id,
        credential_type: 'password',
        credential_value: hashedPassword,
        is_active: true
      } as any);

    if (credError) {
      // Supprimer l'utilisateur créé si les credentials échouent
      await supabaseAdmin.from('users').delete().eq('id', (newUser as any).id);
      return NextResponse.json({ error: 'Failed to create credentials' }, { status: 500 });
    }

    return NextResponse.json({ 
      user: newUser, 
      tempPassword,
      message: 'User created successfully' 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
