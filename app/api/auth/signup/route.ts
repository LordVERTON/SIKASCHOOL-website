import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { setUserSession } from '@/lib/auth-simple';
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

    const { firstName, lastName, email, password, phone } = await request.json();

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
        const { data: existingUser, error: _checkError } = await supabaseAdmin
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
    const normalizedPhone = typeof phone === 'string' ? phone.trim() : null;

    // Créer l'utilisateur dans la base de données
    
    const { data: newUser, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        email,
        password_hash: hashedPassword, // Ajouter le mot de passe hashé
        first_name: firstName,
        last_name: lastName,
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
        { error: `Erreur lors de la création du compte: ${userError.message}` },
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

    // Créer des notifications pour tous les admins
    // Récupérer les admins (rôle ADMIN ou tuteurs avec emails spécifiques)
    const adminEmails = ['daniel.verton@sikaschool.com', 'ruudy.mbouza-bayonne@sikaschool.com', 'admin@sikaschool.com'];
    
    const { data: adminUsers, error: adminUsersError } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .eq('role', 'ADMIN');

    // Récupérer les utilisateurs avec emails spécifiques (peu importe leur rôle)
    const { data: adminTutors, error: adminTutorsError } = await supabaseAdmin
      .from('users')
      .select('id, email, role')
      .in('email', adminEmails);

    // Log pour déboguer
    if (adminUsersError) {
      console.error('❌ Erreur lors de la récupération des admins (ADMIN):', adminUsersError);
    }
    if (adminTutorsError) {
      console.error('❌ Erreur lors de la récupération des admins (TUTOR):', adminTutorsError);
    }

    // Combiner et dédupliquer par email
    const allAdmins: Array<{ id: string; email: string; role: string }> = [
      ...(adminUsers || []),
      ...(adminTutors || [])
    ];
    const adminsMap = new Map<string, { id: string; email: string; role: string }>();
    allAdmins.forEach(admin => {
      if (admin && admin.email) {
        adminsMap.set(admin.email.toLowerCase(), admin);
      }
    });
    const admins: Array<{ id: string; email: string; role: string }> = Array.from(adminsMap.values());

    if (admins && admins.length > 0) {
      const studentName = `${newUser.first_name} ${newUser.last_name}`;
      const adminNotifications = (admins as any[]).map((admin: any) => ({
        user_id: admin.id,
        type: 'SYSTEM',
        title: 'Nouvelle inscription',
        message: `${studentName} (${newUser.email}) vient de s'inscrire sur la plateforme. Veuillez assigner un tuteur à cet élève.`,
        data: {
          action: 'NEW_STUDENT_REGISTRATION',
          student_id: newUser.id,
          student_name: studentName,
          student_email: newUser.email,
          registered_at: new Date().toISOString()
        },
        is_read: false
      }));

      const { error: adminNotificationsError } = await (supabaseAdmin as any)
        .from('notifications')
        .insert(adminNotifications);

      if (adminNotificationsError) {
        console.error('❌ Erreur lors de la création des notifications admin:', adminNotificationsError);
      }
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
