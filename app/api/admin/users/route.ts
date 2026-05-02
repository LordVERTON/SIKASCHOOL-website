import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { canAccessAdminFeatures } from '@/lib/admin-permissions';
import { syncSupabaseAuthIdentity } from '@/lib/supabase-auth-sync';

export async function GET() {
  try {
    // Vérifier l'authentification
    const user = await getUserSession();
    if (!user || !canAccessAdminFeatures(user)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Récupérer tous les utilisateurs
    const { data: users, error } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, role, is_active, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Impossible de récupérer les utilisateurs' }, { status: 500 });
    }

    return NextResponse.json(users || []);
      } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const user = await getUserSession();
    if (!user || !canAccessAdminFeatures(user)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { first_name, last_name, email, role, is_active } = await request.json();

    // Vérifier que l'email n'existe pas déjà
    const { data: existingUser } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json({ error: 'Un utilisateur avec cet e-mail existe déjà' }, { status: 400 });
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
      return NextResponse.json({ error: 'Impossible de créer l’utilisateur' }, { status: 500 });
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
      return NextResponse.json({ error: 'Impossible de créer les identifiants' }, { status: 500 });
    }

    const syncAdmin = await syncSupabaseAuthIdentity({
      userId: (newUser as any).id,
      email: String(email).trim().toLowerCase(),
      password: tempPassword,
    });
    if (!syncAdmin.ok) {
      console.warn('[admin/users] Sync Supabase Auth:', syncAdmin.message);
    }

    return NextResponse.json({ 
      user: newUser, 
      tempPassword,
      message: 'Utilisateur créé avec succès' 
    });
      } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
