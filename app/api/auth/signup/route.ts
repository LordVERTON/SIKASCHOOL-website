import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    // Vérifier la configuration Supabase
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.error('❌ Variables d\'environnement Supabase manquantes');
      return NextResponse.json(
        { error: 'Configuration serveur manquante' },
        { status: 500 }
      );
    }

    const { firstName, lastName, email, password } = await request.json();

    // Validation des données
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Format d\'email invalide' },
        { status: 400 }
      );
    }

    // Validation du mot de passe (minimum 6 caractères)
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte avec cet email existe déjà' },
        { status: 409 }
      );
    }

    // Hasher le mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur dans la base de données
    console.log('🔄 Tentative de création d\'utilisateur dans Supabase...');
    
    const { data: newUser, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        password_hash: hashedPassword, // Ajouter le mot de passe hashé
        first_name: firstName,
        last_name: lastName,
        role: 'STUDENT',
        is_active: true,
        email_verified: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      } as any)
      .select('id, email, first_name, last_name, role')
      .single() as any;

    if (userError) {
      console.error('❌ Erreur lors de la création de l\'utilisateur:', userError);
      return NextResponse.json(
        { error: `Erreur lors de la création du compte: ${userError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Compte étudiant créé avec succès:', newUser.email);

    return NextResponse.json({
      success: true,
      message: 'Compte créé avec succès',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: `${newUser.first_name} ${newUser.last_name}`,
        role: newUser.role
      }
    });

  } catch (error) {
    console.error('❌ Erreur lors de l\'inscription:', error);
    
    // Gestion spécifique des erreurs de connexion
    if (error instanceof Error && error.message.includes('fetch failed')) {
      return NextResponse.json(
        { error: 'Erreur de connexion à la base de données. Veuillez réessayer.' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
