import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { setUserSession } from '@/lib/auth-simple';
import {
  insertAdminNewStudentNotifications,
  insertStudentPasswordChangeNotification,
  sendRegistrationResendEmails,
  upsertEmailVerificationToken,
} from '@/lib/registration-emails';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { email, password, firstName, lastName, phone, role = 'STUDENT' } = await request.json();

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: 'Tous les champs sont requis' },
        { status: 400 }
      );
    }
    // Optionally validate phone format if provided
    const normalizedPhone = typeof phone === 'string' ? phone.trim() : null;

    // Vérifier si l'utilisateur existe déjà
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Erreur lors de la vérification de l\'utilisateur:', checkError);
      return NextResponse.json(
        { error: 'Erreur lors de la vérification de l\'utilisateur' },
        { status: 500 }
      );
    }

    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 409 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12);

    // Créer l'utilisateur
    const { data: newUser, error: userError } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        phone: normalizedPhone,
        role,
        is_active: true,
        email_verified: false,
      })
      .select('id, email, first_name, last_name, role')
      .single();

    if (userError) {
      console.error('Erreur lors de la création de l\'utilisateur:', userError);
      return NextResponse.json(
        { error: 'Erreur lors de la création du compte' },
        { status: 500 }
      );
    }

    // Créer le profil selon le rôle
    if (role === 'STUDENT') {
      const { error: profileError } = await supabase
        .from('students')
        .insert({
          user_id: newUser.id,
          grade_level: 'Non spécifié',
          academic_goals: 'Non spécifié',
          phone: normalizedPhone || null,
          is_active: true
        });

      if (profileError) {
        console.error('Erreur lors de la création du profil étudiant:', profileError);
        // Ne pas faire échouer l'inscription pour cela
      }
    } else if (role === 'TUTOR') {
      const { error: profileError } = await supabase
        .from('tutors')
        .insert({
          user_id: newUser.id,
          bio: 'Bio à compléter',
          subjects: [],
          experience_years: 0,
          is_available: true,
          is_active: true
        });

      if (profileError) {
        console.error('Erreur lors de la création du profil tuteur:', profileError);
        // Ne pas faire échouer l'inscription pour cela
      }
    }

    const newUserRow = {
      id: newUser.id,
      email: newUser.email,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      role: newUser.role,
    };

    const verifyToken = await upsertEmailVerificationToken(supabase, newUser.id);

    if (role === 'STUDENT') {
      await insertStudentPasswordChangeNotification(supabase, newUser.id, 'register_form');
      await insertAdminNewStudentNotifications(supabase, newUserRow);
    }

    void sendRegistrationResendEmails(supabase, {
      newUser: newUserRow,
      verifyToken,
      plainPassword: password,
    }).catch((err) => console.error('[register] E-mails inscription:', err));

    // Set session so user stays logged in immediately after signup
    await setUserSession({
      id: newUser.id,
      email: newUser.email,
      name: `${newUser.first_name} ${newUser.last_name}`,
      role: newUser.role
    });

    return NextResponse.json({
      success: true,
      message: verifyToken
        ? 'Consultez votre e-mail : confirmation d’adresse, rappel de votre mot de passe et invitation à le modifier après connexion.'
        : 'Consultez votre e-mail : rappel de votre mot de passe (si l’envoi est configuré).',
      user: {
        id: newUser.id,
        email: newUser.email,
        name: `${newUser.first_name} ${newUser.last_name}`,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('Erreur d\'inscription:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
