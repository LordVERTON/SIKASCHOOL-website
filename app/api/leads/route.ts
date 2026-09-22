import { randomBytes } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { createApplicationUser } from '@/lib/user-management';
import {
  insertAdminNewStudentNotifications,
  insertStudentPasswordChangeNotification,
  sendPasswordResetEmail,
  sendRegistrationResendEmails,
  type RegistrationIntakeDetails,
} from '@/lib/registration-emails';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const firstName = typeof body?.firstName === 'string' ? body.firstName.trim() : '';
    const lastName = typeof body?.lastName === 'string' ? body.lastName.trim() : '';
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const phone = typeof body?.phone === 'string' ? body.phone.trim() : '';
    const zip = typeof body?.zip === 'string' ? body.zip.trim() : '';
    const role = body?.accountType === 'PARENT' ? 'PARENT' : 'STUDENT';

    if (!firstName || !lastName || !email) {
      return NextResponse.json({ error: 'Champs requis manquants' }, { status: 400 });
    }

    const contest = body?.subject === 'Préparation à un concours' ? String(body?.contest || '') : '';
    const goal = body?.goal === 'Autre' ? String(body?.goalOther || '') : String(body?.goal || '');
    const academicGoals = [goal, body?.subject, contest].filter(Boolean).join(' | ') || 'Non spécifié';
    const intakeDetails: RegistrationIntakeDetails = {
      civility: body?.civility || '',
      phone,
      zip,
      level: body?.level || '',
      subject: body?.subject || '',
      goal: body?.goal || '',
      goalOther: body?.goalOther || '',
      goalSummary: goal,
      contest,
      accountType: role === 'PARENT' ? 'parent' : 'student',
      campaign: body?.campaign === 'back_to_school' ? 'back_to_school' : undefined,
      capturedAt: new Date().toISOString(),
    };

    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id, email, first_name, last_name, role, is_active')
      .eq('email', email)
      .maybeSingle();

    let profile = existing;
    let created = false;
    if (!profile) {
      profile = await createApplicationUser({
        email,
        password: `Sika-${randomBytes(18).toString('base64url')}!`,
        firstName,
        lastName,
        phone,
        role,
      });
      created = true;
    } else {
      await supabaseAdmin
        .from('profiles')
        .update({ first_name: firstName, last_name: lastName, phone: phone || null, postal_code: zip || null })
        .eq('id', profile.id);
    }

    if (profile.role === 'STUDENT') {
      await supabaseAdmin.from('students').upsert(
        {
          user_id: profile.id,
          grade_level: body?.level || 'Non spécifié',
          academic_goals: academicGoals,
          phone: phone || null,
          parent_phone: phone || null,
          parent_email: email,
          postal_code: zip || null,
          learning_style: JSON.stringify(intakeDetails),
          is_active: true,
        },
        { onConflict: 'user_id' },
      );
      await insertStudentPasswordChangeNotification(supabaseAdmin, profile.id, 'lead_form');
    }

    const userForNotifications = {
      id: profile.id,
      email,
      first_name: firstName,
      last_name: lastName,
      role: profile.role,
    };
    await insertAdminNewStudentNotifications(supabaseAdmin, userForNotifications, intakeDetails);
    void sendRegistrationResendEmails(supabaseAdmin, {
      newUser: userForNotifications,
      intakeDetails,
    }).catch((error) => console.error('[leads/email]', error));

    if (created) {
      const { data: recovery } = await supabaseAdmin.auth.admin.generateLink({ type: 'recovery', email });
      if (recovery.properties?.hashed_token) {
        void sendPasswordResetEmail({
          to: email,
          firstName,
          resetToken: recovery.properties.hashed_token,
        }).catch((error) => console.error('[leads/recovery-email]', error));
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[leads]', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
