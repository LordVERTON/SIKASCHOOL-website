import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { setUserSession } from '@/lib/auth-simple';
import bcrypt from 'bcryptjs';
import {
  insertAdminNewStudentNotifications,
  insertStudentPasswordChangeNotification,
  sendRegistrationResendEmails,
  upsertEmailVerificationToken,
} from '@/lib/registration-emails';
import { syncSupabaseAuthIdentity } from '@/lib/supabase-auth-sync';

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

    const { firstName, lastName, email, password, phone } = await request.json();
    const normalizedFirstName = typeof firstName === 'string' ? firstName.trim() : '';
    const normalizedLastName = typeof lastName === 'string' ? lastName.trim() : '';
    const normalizedEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    const rawPassword = typeof password === 'string' ? password : '';

    // Validation des données
    if (!normalizedFirstName || !normalizedLastName || !normalizedEmail || !rawPassword) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Format d\'e-mail invalide' },
        { status: 400 }
      );
    }

    // Validation du mot de passe (minimum 6 caractères)
    if (rawPassword.length < 6) {
      return NextResponse.json(
        { error: 'Le mot de passe doit contenir au moins 6 caractères' },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
        const { data: existingUser, error: _checkError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .single();

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un compte avec cet e-mail existe déjà' },
        { status: 409 }
      );
    }

    // Hasher le mot de passe
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(rawPassword, saltRounds);
    const normalizedPhone = typeof phone === 'string' ? phone.trim() : null;

    // Créer l'utilisateur dans la base de données
    
    const { data: newUser, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        email: normalizedEmail,
        password_hash: hashedPassword, // Ajouter le mot de passe hashé
        first_name: normalizedFirstName,
        last_name: normalizedLastName,
        phone: normalizedPhone,
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
        { error: 'Erreur lors de la création du compte' },
        { status: 500 }
      );
    }

    // Créer un profil étudiant minimal (ignorer erreur si déjà présent)
    const { error: _studentProfileError } = await (supabaseAdmin as any)
      .from('students')
      .insert({
        user_id: newUser.id,
        phone: normalizedPhone || null,
        grade_level: 'Non spécifié',
        academic_goals: 'Non spécifié',
        is_active: true
      } as any)
      .select()
      .single();
    // On ignore volontairement studentProfileError

    // Créer une notification de bienvenue pour l'étudiant
    const profileNotification = {
      user_id: newUser.id,
      type: 'PROFILE',
      title: 'Bienvenue sur SikaSchool 🎉',
      message: 'Votre profil a bien été créé. Vous pouvez planifier vos séances et découvrir vos tuteurs.',
      data: {
        action: 'PROFILE_CREATED',
        created_at: new Date().toISOString()
      },
    };

    const { error: profileNotificationError } = await (supabaseAdmin as any)
      .from('notifications')
      .insert(profileNotification as any);

    if (profileNotificationError) {
      console.error('❌ Erreur lors de la création de la notification de profil:', profileNotificationError);
    }

    const newUserRow = {
      id: newUser.id,
      email: newUser.email,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      role: newUser.role,
    };

    await insertStudentPasswordChangeNotification(supabaseAdmin, newUser.id, 'signup_form');
    await insertAdminNewStudentNotifications(supabaseAdmin, newUserRow);

    const verifyToken = await upsertEmailVerificationToken(supabaseAdmin, newUser.id);
    void sendRegistrationResendEmails(supabaseAdmin, {
      newUser: newUserRow,
      verifyToken,
      plainPassword: rawPassword,
    }).catch((err) => console.error('[signup] E-mails inscription:', err));

    const sync = await syncSupabaseAuthIdentity({
      userId: newUser.id,
      email: newUser.email,
      password: rawPassword,
    });
    if (!sync.ok) {
      console.warn('[signup] Sync Supabase Auth:', sync.message);
    }

    // Définir la session pour garder l'utilisateur connecté
    await setUserSession({
      id: newUser.id,
      email: newUser.email,
      name: `${newUser.first_name} ${newUser.last_name}`,
      role: newUser.role
    });

    // Compte étudiant créé avec succès
    return NextResponse.json({
      success: true,
      message: verifyToken
        ? 'Compte créé. Consultez votre e-mail : validation de l’adresse, rappel de votre mot de passe et invitation à le modifier après connexion.'
        : 'Compte créé. Consultez votre e-mail (rappel de votre mot de passe si l’envoi est configuré).',
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
        { error: 'Erreur de connexion à la base de données, veuillez réessayer' },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
