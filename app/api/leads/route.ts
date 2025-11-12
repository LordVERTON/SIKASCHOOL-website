import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';
import { supabaseAdmin } from '@/lib/supabase';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sanitizeNameForPassword = (value: string) => {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '');
};

const buildInitialPassword = (firstName: string, lastName: string) => {
  const safeFirst = sanitizeNameForPassword(firstName) || 'eleve';
  const safeLast = sanitizeNameForPassword(lastName) || 'sikaschool';
  return `${safeFirst}.${safeLast}12345`;
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      zip,
      civility,
      level,
      subject,
      goal,
      goalOther,
      contest
    } = body || {};

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    const initialPassword = buildInitialPassword(firstName, lastName);
    const hashedPassword = await bcrypt.hash(initialPassword, 12);

    // Check existing user
    const { data: existing, error: existingErr } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    const normalizedContest = subject === 'Préparation à un concours' ? (contest || '') : '';
    const resolvedGoal = goal === 'Autre' ? (goalOther || '') : (goal || '');
    const academicGoals = [resolvedGoal, subject, normalizedContest].filter(Boolean).join(' | ') || 'Non spécifié';
    const intakeDetails = {
      civility: civility || '',
      guardianFirstName: firstName,
      guardianLastName: lastName,
      email,
      phone: phone || '',
      zip: zip || '',
      level: level || '',
      subject: subject || '',
      goal: goal || '',
      goalOther: goalOther || '',
      goalSummary: resolvedGoal,
      contest: normalizedContest,
      capturedAt: new Date().toISOString()
    };

    if (existing && !existingErr) {
      const { error: updateUserError } = await supabase
        .from('users')
        .update({
          first_name: firstName,
          last_name: lastName,
          phone: phone || null,
          postal_code: zip || null,
          password_hash: hashedPassword,
          is_active: true,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', existing.id);

      if (updateUserError) {
        console.error('Lead existing user update error:', updateUserError);
        return NextResponse.json({ error: 'Erreur mise à jour utilisateur' }, { status: 500 });
      }

      const { error: upsertStudentError } = await supabase
        .from('students')
        .upsert(
          {
            user_id: existing.id,
            grade_level: level || 'Non spécifié',
            academic_goals: academicGoals,
            phone: phone || null,
            parent_phone: phone || null,
            parent_email: email,
            postal_code: zip || null,
            learning_style: JSON.stringify(intakeDetails),
            is_active: true,
            updated_at: new Date().toISOString()
          } as any,
          { onConflict: 'user_id' }
        );

      if (upsertStudentError) {
        console.error('Lead existing student upsert error:', upsertStudentError);
        // continue, non blocking
      }

      const { error: resetNotificationError } = await supabase
        .from('notifications')
        .insert({
          user_id: existing.id,
          type: 'PASSWORD',
          title: 'Mot de passe réinitialisé',
          message: 'Votre mot de passe a été réinitialisé suite à une nouvelle demande de séance. Pensez à le modifier depuis votre espace une fois connecté.',
          data: {
            action: 'PASSWORD_RESET',
            source: 'lead_form',
            captured_at: intakeDetails.capturedAt
          }
        });

      if (resetNotificationError) {
        console.error('Lead password reset notification error:', resetNotificationError);
      }

      return NextResponse.json({ success: true, alreadyExists: true, initialPassword });
    }

    if (existingErr && existingErr.code !== 'PGRST116') {
      return NextResponse.json({ error: 'Erreur vérification utilisateur' }, { status: 500 });
    }

    const { data: newUser, error: userErr } = await supabase
      .from('users')
      .insert({
        email,
        password_hash: hashedPassword,
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        postal_code: zip || null,
        role: 'STUDENT',
        is_active: true
      })
      .select('id')
      .single();

    if (userErr || !newUser) {
      return NextResponse.json({ error: 'Erreur création utilisateur' }, { status: 500 });
    }

    // Create student profile (best-effort)
    const { error: studentErr } = await supabase
      .from('students')
      .insert({
        user_id: newUser.id,
        grade_level: level || 'Non spécifié',
        academic_goals: academicGoals,
        phone: phone || null,
        parent_phone: phone || null,
        parent_email: email,
        postal_code: zip || null,
        learning_style: JSON.stringify(intakeDetails),
        is_active: true
      });

    if (studentErr) {
      console.error('Lead new student insert error:', studentErr);
      // continue, non blocking
    }

    const { error: profileNotificationError } = await supabase
      .from('notifications')
      .insert({
        user_id: newUser.id,
        type: 'PROFILE',
        title: 'Bienvenue sur SikaSchool 🎉',
        message: 'Votre compte a été créé avec succès. Nous vous contacterons prochainement pour organiser une première séance.',
        data: {
          action: 'PROFILE_CREATED',
          source: 'lead_form',
          captured_at: intakeDetails.capturedAt
        }
      });

    if (profileNotificationError) {
      console.error('Lead profile notification error:', profileNotificationError);
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
      const studentName = `${firstName} ${lastName}`;
      const adminNotifications = (admins as any[]).map((admin: any) => ({
        user_id: admin.id,
        type: 'SYSTEM',
        title: 'Nouvelle inscription',
        message: `${studentName} (${email}) vient de s'inscrire via le formulaire de contact. Veuillez assigner un tuteur à cet élève.`,
        data: {
          action: 'NEW_STUDENT_REGISTRATION',
          student_id: newUser.id,
          student_name: studentName,
          student_email: email,
          source: 'lead_form',
          registered_at: new Date().toISOString(),
          intake_details: intakeDetails
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

    return NextResponse.json({ success: true, initialPassword });
  } catch (error) {
    console.error('Lead create error:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}


