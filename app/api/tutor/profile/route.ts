import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { supabaseAdmin } from '@/lib/supabase';
import { canAccessTutorFeatures } from '@/lib/admin-permissions';
import { TUTOR_SUBJECTS } from '@/lib/tutor-subjects';
import { setUserActive } from '@/lib/user-management';

type PreferencesPayload = {
  theme?: 'light' | 'dark' | 'system';
};

type NotificationsPayload = {
  email: boolean;
  push: boolean;
  sms: boolean;
};

function parseSettingValue<T>(raw: unknown, fallback: T): T {
  if (!raw) return fallback;
  if (typeof raw === 'object') return raw as T;
  try {
    return JSON.parse(String(raw)) as T;
  } catch {
    return fallback;
  }
}

export async function GET() {
  try {
    const user = await getUserSession();
    if (!user || !canAccessTutorFeatures(user)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const userId = user.id;
    const results = await Promise.all([
      supabaseAdmin
        .from('profiles')
        .select(
          'id, email, first_name, last_name, avatar_url, phone, address, city, postal_code, country, date_of_birth, timezone, language, created_at'
        )
        .eq('id', userId)
        .single(),
      (supabaseAdmin as any)
        .from('tutors')
        .select('bio, experience_years, subjects, is_available, hourly_rate_cents')
        .eq('user_id', userId)
        .maybeSingle(),
      supabaseAdmin
        .from('user_settings')
        .select('preferences, notifications')
        .eq('user_id', userId)
        .maybeSingle(),
      (supabaseAdmin as any)
        .from('notifications')
        .select('created_at, data')
        .eq('user_id', userId)
        .eq('type', 'PASSWORD')
        .order('created_at', { ascending: false })
        .limit(20),
    ]);
    const userRes = results[0] as any;
    const tutorRes = results[1] as any;
    const settingsRes = results[2] as any;
    const passwordNotificationsRes = results[3] as any;

    if (userRes.error || !userRes.data) {
      return NextResponse.json({ error: 'Utilisateur introuvable' }, { status: 404 });
    }

    const defaultNotifications: NotificationsPayload = { email: true, push: true, sms: false };
    const defaultPreferences: PreferencesPayload = { theme: 'system' };

    const notifications = parseSettingValue<NotificationsPayload>(
      settingsRes.data?.notifications,
      defaultNotifications
    );
    const preferences = parseSettingValue<PreferencesPayload>(
      settingsRes.data?.preferences,
      defaultPreferences
    );

    const u = userRes.data as any;
    const t = (tutorRes.data || {}) as any;
    const latestPasswordChange =
      (passwordNotificationsRes.data || []).find((item: any) => item?.data?.action === 'PASSWORD_CHANGED') ||
      (passwordNotificationsRes.data || [])[0] ||
      null;

    return NextResponse.json({
      id: u.id,
      firstName: u.first_name || '',
      lastName: u.last_name || '',
      fullName: `${u.first_name || ''} ${u.last_name || ''}`.trim(),
      email: u.email,
      avatar: u.avatar_url || '/images/user/user-01.png',
      phone: u.phone || '',
      address: u.address || '',
      city: u.city || '',
      postalCode: u.postal_code || '',
      country: u.country || 'France',
      dateOfBirth: u.date_of_birth || null,
      timezone: u.timezone || 'Europe/Paris',
      language: u.language || 'fr',
      createdAt: u.created_at,
      bio: t.bio || '',
      experienceYears: Number(t.experience_years) || 0,
      subjects: Array.isArray(t.subjects) ? t.subjects : [],
      isAvailable: t.is_available ?? true,
      hourlyRateCents: Number(t.hourly_rate_cents) || 0,
      passwordUpdatedAt:
        latestPasswordChange?.data?.changed_at ||
        latestPasswordChange?.created_at ||
        null,
      preferences,
      notifications,
    });
  } catch (error) {
    console.error('Erreur GET /api/tutor/profile:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await getUserSession();
    if (!user || !canAccessTutorFeatures(user)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const userId = user.id;

    const userPayload: Record<string, any> = {};
    const tutorPayload: Record<string, any> = {};

    if (typeof body.firstName === 'string') userPayload.first_name = body.firstName.trim();
    if (typeof body.lastName === 'string') userPayload.last_name = body.lastName.trim();
    if (typeof body.email === 'string') {
      const normalizedEmail = body.email.trim().toLowerCase();
      if (!normalizedEmail) {
        return NextResponse.json({ error: 'Email invalide' }, { status: 400 });
      }
      const { data: emailOwnerRow, error: emailCheckError } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('email', normalizedEmail)
        .maybeSingle();
      const emailOwner = emailOwnerRow as { id: string } | null;

      if (emailCheckError) {
        console.error('Erreur vérification email tuteur:', emailCheckError);
        return NextResponse.json({ error: 'Impossible de vérifier l’email' }, { status: 500 });
      }
      if (emailOwner && emailOwner.id !== userId) {
        return NextResponse.json({ error: 'Cet email est déjà utilisé' }, { status: 409 });
      }
      const { error: authEmailError } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        email: normalizedEmail,
        email_confirm: true,
      });
      if (authEmailError) {
        return NextResponse.json({ error: 'Échec de la mise à jour de l’email' }, { status: 500 });
      }
    }
    if (typeof body.phone === 'string') userPayload.phone = body.phone.trim();
    if (typeof body.address === 'string') userPayload.address = body.address.trim();
    if (typeof body.city === 'string') userPayload.city = body.city.trim();
    if (typeof body.postalCode === 'string') userPayload.postal_code = body.postalCode.trim();
    if (typeof body.country === 'string') userPayload.country = body.country.trim();
    if (typeof body.dateOfBirth === 'string' || body.dateOfBirth === null) {
      userPayload.date_of_birth = body.dateOfBirth;
    }
    if (typeof body.timezone === 'string') userPayload.timezone = body.timezone;
    if (typeof body.language === 'string') userPayload.language = body.language;

    if (typeof body.bio === 'string') tutorPayload.bio = body.bio.trim();
    if (typeof body.experienceYears === 'number') tutorPayload.experience_years = body.experienceYears;
    if (Array.isArray(body.subjects)) {
      const { data: tutorSubjectRows } = await (supabaseAdmin as any)
        .from('tutors')
        .select('subjects');
      const taughtSubjects = (tutorSubjectRows || []).flatMap((row: any) =>
        Array.isArray(row.subjects) ? row.subjects : []
      );
      const allowedSubjects = new Set<string>([...TUTOR_SUBJECTS, ...taughtSubjects]);
      tutorPayload.subjects = body.subjects
        .map((s: any) => String(s).trim())
        .filter((subject: string) => allowedSubjects.has(subject));
    }
    if (typeof body.isAvailable === 'boolean') tutorPayload.is_available = body.isAvailable;
    if (typeof body.hourlyRateCents === 'number') tutorPayload.hourly_rate_cents = Math.max(0, body.hourlyRateCents);

    if (Object.keys(userPayload).length > 0) {
      userPayload.updated_at = new Date().toISOString();
      const { error: userUpdateError } = await (supabaseAdmin as any)
        .from('profiles')
        .update(userPayload)
        .eq('id', userId);
      if (userUpdateError) {
        console.error('Erreur update users tutor:', userUpdateError);
        return NextResponse.json({ error: 'Échec de la mise à jour du profil utilisateur' }, { status: 500 });
      }
    }

    if (Object.keys(tutorPayload).length > 0) {
      tutorPayload.updated_at = new Date().toISOString();
      const { data: updatedTutor, error: tutorUpdateError } = await (supabaseAdmin as any)
        .from('tutors')
        .update(tutorPayload)
        .eq('user_id', userId)
        .select('user_id')
        .maybeSingle();
      if (tutorUpdateError) {
        console.error('Erreur update tutors:', tutorUpdateError);
        return NextResponse.json({ error: 'Échec de la mise à jour du profil tuteur' }, { status: 500 });
      }

      if (!updatedTutor) {
        const { error: tutorInsertError } = await (supabaseAdmin as any)
          .from('tutors')
          .insert({
            user_id: userId,
            subjects: [],
            is_available: true,
            ...tutorPayload,
          });

        if (tutorInsertError) {
          console.error('Erreur création tutors:', tutorInsertError);
          return NextResponse.json({ error: 'Échec de la création du profil tuteur' }, { status: 500 });
        }
      }
    }

    if (body.preferences && typeof body.preferences === 'object') {
      const prefs = {
        theme:
          body.preferences.theme === 'light' || body.preferences.theme === 'dark'
            ? body.preferences.theme
            : 'system',
      } as PreferencesPayload;
      await supabaseAdmin.from('user_settings').upsert(
        {
          user_id: userId,
          preferences: prefs,
        },
        { onConflict: 'user_id' }
      );
    }

    if (body.notifications && typeof body.notifications === 'object') {
      const notifications: NotificationsPayload = {
        email: Boolean(body.notifications.email),
        push: Boolean(body.notifications.push),
        sms: Boolean(body.notifications.sms),
      };
      await supabaseAdmin.from('user_settings').upsert(
        {
          user_id: userId,
          notifications,
        },
        { onConflict: 'user_id' }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur PATCH /api/tutor/profile:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const user = await getUserSession();
    if (!user || !canAccessTutorFeatures(user)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    await setUserActive(user.id, false);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erreur DELETE /api/tutor/profile:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
