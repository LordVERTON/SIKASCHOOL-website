import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const user = await getUserSession();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = user.id;

    const [
      { data: userRow, error: userError },
      { data: studentRow, error: studentError },
      { data: passwordNotifications, error: passwordNotificationsError },
    ] = await Promise.all([
      supabaseAdmin
        .from('users')
        .select('id, email, first_name, last_name, avatar_url, timezone, language, created_at, postal_code, phone')
        .eq('id', userId)
        .single(),
      supabaseAdmin
        .from('students')
        .select('grade_level, school_name, theme, notify_email, notify_push, notify_sms, phone, address, city, postal_code, country, date_of_birth, academic_goals, learning_style, parent_phone, parent_email')
        .eq('user_id', userId)
        .single(),
      (supabaseAdmin as any)
        .from('notifications')
        .select('created_at, data')
        .eq('user_id', userId)
        .eq('type', 'PASSWORD')
        .order('created_at', { ascending: false })
        .limit(20)
    ]);

    if (userError) {
      console.error('Erreur utilisateur:', userError);
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    if (studentError && studentError.code !== 'PGRST116') {
      // PGRST116: No rows found for single() — acceptable if no student profile yet
      console.error('Erreur étudiant:', studentError);
    }
    if (passwordNotificationsError) {
      console.error('Erreur notifications mot de passe:', passwordNotificationsError);
    }

    const u: any = userRow as any;
    const s: any = (studentRow as any) || {};

    let intakeDetails: any = null;
    if (s.learning_style) {
      try {
        intakeDetails = JSON.parse(s.learning_style);
      } catch (parseErr) {
        console.warn('Impossible de parser les informations d\'inscription:', parseErr);
      }
    }

    const latestPasswordNotification = (passwordNotifications || [])[0] as any;
    const latestPasswordChange =
      (passwordNotifications || []).find((item: any) => item?.data?.action === 'PASSWORD_CHANGED') ||
      latestPasswordNotification ||
      null;

    const profile = {
      id: u.id,
      name: `${u.first_name || ''} ${u.last_name || ''}`.trim() || user.name,
      email: u.email,
      avatar: u.avatar_url || '/images/user/user-01.png',
      level: s.grade_level || intakeDetails?.level || '—',
      school: s.school_name || '—',
      phone: s.phone || u.phone || intakeDetails?.phone || '',
      address: s.address || '',
      city: s.city || '',
      postalCode: s.postal_code || u.postal_code || intakeDetails?.zip || '',
      country: s.country || 'France',
      dateOfBirth: s.date_of_birth || null,
      joinDate: u.created_at,
      timezone: u.timezone || 'Europe/Paris',
      language: u.language || 'fr',
      theme: s.theme || 'system',
      academicGoals: s.academic_goals || '',
      passwordUpdatedAt:
        latestPasswordChange?.data?.changed_at ||
        latestPasswordChange?.created_at ||
        null,
      intake: intakeDetails,
      notifications: {
        email: s.notify_email ?? true,
        push: s.notify_push ?? true,
        sms: s.notify_sms ?? false
      }
    };

    return NextResponse.json(profile);
  } catch (error) {
    console.error('❌ Erreur API profil étudiant:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getUserSession();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const updatableFields = [
      'grade_level', 'school_name', 'phone', 'address', 'city', 'postal_code', 'country', 'date_of_birth',
      'theme', 'notify_email', 'notify_push', 'notify_sms', 'timezone', 'language'
    ];

    const payload: Record<string, any> = {};
    for (const key of updatableFields) {
      if (Object.prototype.hasOwnProperty.call(body, key)) {
        payload[key] = body[key];
      }
    }

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: 'Aucun champ à mettre à jour' }, { status: 400 });
    }

    const { error } = await (supabaseAdmin as any)
      .from('students')
      .update(payload)
      .eq('user_id', user.id);

    if (error) {
      console.error('Erreur mise à jour profil étudiant:', error);
      return NextResponse.json({ error: 'Échec de la mise à jour' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Erreur PATCH profil étudiant:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}


