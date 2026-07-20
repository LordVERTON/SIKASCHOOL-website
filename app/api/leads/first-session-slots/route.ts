import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase';
import { sendTutorNewBookingRequestEmail } from '@/lib/registration-emails';
import { syncSessionParticipants } from '@/lib/session-participants';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SLOT_DURATION_MINUTES = 60;
const MAX_DAYS = 14;
const DAY_START_HOUR = 9;
const DAY_END_HOUR = 20;

const QuerySchema = z.object({
  subject: z.string().min(1),
});

const BookSchema = z.object({
  email: z.string().email(),
  subject: z.string().min(1),
  tutorId: z.string().uuid(),
  startedAt: z.string().min(1),
  campaign: z.enum(['summer_course']).optional(),
});

type SlotTutor = {
  id: string;
  user_id: string;
  subjects: string[] | null;
  users?: {
    first_name: string | null;
    last_name: string | null;
  } | null;
};

const normalizeSubject = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

const addMinutes = (date: Date, minutes: number) =>
  new Date(date.getTime() + minutes * 60 * 1000);

const overlaps = (slotStart: Date, slotEnd: Date, session: any) => {
  const sessionStart = new Date(session.started_at);
  const sessionEnd = addMinutes(sessionStart, Number(session.duration_minutes || SLOT_DURATION_MINUTES));
  return slotStart < sessionEnd && slotEnd > sessionStart;
};

async function loadEligibleTutors(subject: string) {
  const normalizedSubject = normalizeSubject(subject);

  const { data, error } = await (supabaseAdmin as any)
    .from('tutors')
    .select('id, user_id, subjects, users:user_id(first_name, last_name)')
    .eq('is_available', true);

  if (error) throw error;

  return ((data || []) as SlotTutor[]).filter((tutor) =>
    Array.isArray(tutor.subjects) &&
    tutor.subjects.some((item) => normalizeSubject(item) === normalizedSubject)
  );
}

async function loadBusySessions(tutorIds: string[], from: Date, to: Date) {
  if (tutorIds.length === 0) return [];

  const { data, error } = await (supabaseAdmin as any)
    .from('sessions')
    .select('tutor_id, started_at, duration_minutes, status')
    .in('tutor_id', tutorIds)
    .gte('started_at', from.toISOString())
    .lt('started_at', to.toISOString())
    .in('status', ['PENDING', 'SCHEDULED', 'IN_PROGRESS']);

  if (error) throw error;
  return data || [];
}

export async function GET(request: NextRequest) {
  try {
    const parsed = QuerySchema.safeParse({
      subject: request.nextUrl.searchParams.get('subject') || '',
    });

    if (!parsed.success) {
      return NextResponse.json({ error: 'Matière requise' }, { status: 400 });
    }

    const tutors = await loadEligibleTutors(parsed.data.subject);
    const now = new Date();
    const from = addMinutes(now, 120);
    const to = new Date(now);
    to.setDate(to.getDate() + MAX_DAYS);
    to.setHours(DAY_END_HOUR, 0, 0, 0);

    const busySessions = await loadBusySessions(tutors.map((tutor) => tutor.user_id), from, to);
    const slots: any[] = [];

    for (let dayOffset = 0; dayOffset < MAX_DAYS; dayOffset += 1) {
      const day = new Date(now);
      day.setDate(now.getDate() + dayOffset);
      day.setHours(0, 0, 0, 0);

      if (day.getDay() === 0) continue;

      for (let hour = DAY_START_HOUR; hour < DAY_END_HOUR; hour += 1) {
        const slotStart = new Date(day);
        slotStart.setHours(hour, 0, 0, 0);
        const slotEnd = addMinutes(slotStart, SLOT_DURATION_MINUTES);

        if (slotStart <= from) continue;

        const availableTutor = tutors.find((tutor) => {
          const tutorBusySessions = busySessions.filter((session: any) => session.tutor_id === tutor.user_id);
          return !tutorBusySessions.some((session: any) => overlaps(slotStart, slotEnd, session));
        });

        if (!availableTutor) continue;

        const tutorName = [
          availableTutor.users?.first_name,
          availableTutor.users?.last_name,
        ].filter(Boolean).join(' ') || 'Tuteur SikaSchool';

        slots.push({
          tutorId: availableTutor.user_id,
          tutorName,
          startedAt: slotStart.toISOString(),
          duration: SLOT_DURATION_MINUTES,
        });

        if (slots.length >= 24) {
          return NextResponse.json({ slots });
        }
      }
    }

    return NextResponse.json({ slots });
  } catch (error) {
    console.error('[first-session-slots] GET error:', error);
    return NextResponse.json({ error: 'Erreur chargement créneaux' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const parsed = BookSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'Créneau invalide' }, { status: 400 });
    }

    const { email, subject, tutorId, startedAt, campaign } = parsed.data;
    const isSummerCourse = campaign === 'summer_course';
    const slotStart = new Date(startedAt);
    const slotEnd = addMinutes(slotStart, SLOT_DURATION_MINUTES);

    if (Number.isNaN(slotStart.getTime()) || slotStart <= addMinutes(new Date(), 60)) {
      return NextResponse.json({ error: 'Créneau invalide ou trop proche' }, { status: 400 });
    }

    const tutors = await loadEligibleTutors(subject);
    const selectedTutor = tutors.find((tutor) => tutor.user_id === tutorId);
    if (!selectedTutor) {
      return NextResponse.json({ error: 'Aucun tuteur disponible pour cette matière' }, { status: 404 });
    }

    const busySessions = await loadBusySessions([tutorId], slotStart, slotEnd);
    if (busySessions.some((session: any) => overlaps(slotStart, slotEnd, session))) {
      return NextResponse.json({ error: 'Ce créneau vient d’être réservé' }, { status: 409 });
    }

    const { data: student, error: studentError } = await (supabaseAdmin as any)
      .from('users')
      .select('id, first_name, last_name, email')
      .eq('email', email)
      .in('role', ['STUDENT', 'PARENT'])
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: 'Compte élève introuvable' }, { status: 404 });
    }

    await (supabaseAdmin as any)
      .from('tutor_student_assignments')
      .upsert(
        {
          tutor_id: tutorId,
          student_id: student.id,
          is_active: true,
          notes: isSummerCourse
            ? `Assignation automatique — demande de stage d'été (${subject})`
            : `Assignation automatique après choix de première séance gratuite (${subject})`,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'tutor_id,student_id' }
      );

    const { data: session, error: sessionError } = await (supabaseAdmin as any)
      .from('sessions')
      .insert({
        student_id: student.id,
        tutor_id: tutorId,
        level: 'Première séance gratuite',
        subject,
        started_at: slotStart.toISOString(),
        duration_minutes: SLOT_DURATION_MINUTES,
        session_type: 'TRIAL',
        status: 'PENDING',
        payment_status: 'COMPLETED',
        payment_amount_cents: 0,
      })
      .select('id')
      .single();

    if (sessionError || !session) {
      console.error('[first-session-slots] session insert error:', sessionError);
      return NextResponse.json({ error: 'Impossible de réserver ce créneau' }, { status: 500 });
    }

    const { error: participantSyncError } = await syncSessionParticipants(session.id, [student.id]);
    if (participantSyncError) {
      console.error('[first-session-slots] participant sync error:', participantSyncError);
    }

    const studentName = [student.first_name, student.last_name].filter(Boolean).join(' ') || student.email;
    const tutorName = [
      selectedTutor.users?.first_name,
      selectedTutor.users?.last_name,
    ].filter(Boolean).join(' ') || 'votre tuteur';

    await (supabaseAdmin as any).from('notifications').insert([
      {
        user_id: tutorId,
        type: 'BOOKING',
        title: isSummerCourse ? 'Demande de stage d\'été' : 'Première séance gratuite demandée',
        message: isSummerCourse
          ? `${studentName} souhaite profiter de l'offre stage d'été en ${subject}, avec un premier créneau le ${slotStart.toLocaleDateString('fr-FR')} à ${slotStart.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.`
          : `${studentName} a choisi une première séance gratuite de ${subject} le ${slotStart.toLocaleDateString('fr-FR')} à ${slotStart.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.`,
        data: {
          session_id: session.id,
          student_id: student.id,
          student_name: studentName,
          subject,
          started_at: slotStart.toISOString(),
          duration_minutes: SLOT_DURATION_MINUTES,
          source: 'lead_first_session',
          campaign: campaign || null,
        },
      },
      {
        user_id: student.id,
        type: 'BOOKING',
        title: 'Première séance gratuite demandée',
        message: `Votre demande de première séance gratuite avec ${tutorName} a bien été enregistrée.`,
        data: {
          session_id: session.id,
          tutor_id: tutorId,
          tutor_name: tutorName,
          subject,
          started_at: slotStart.toISOString(),
          duration_minutes: SLOT_DURATION_MINUTES,
          source: 'lead_first_session',
        },
      },
    ]);

    const { data: tutorUser } = await (supabaseAdmin as any)
      .from('users')
      .select('email, first_name, last_name')
      .eq('id', tutorId)
      .single();

    if (tutorUser?.email) {
      void sendTutorNewBookingRequestEmail({
        tutorEmail: tutorUser.email,
        tutorFirstName: tutorUser.first_name || tutorUser.last_name || '',
        studentName,
        subject,
        startedAt: slotStart.toISOString(),
        campaign,
      });
    }

    return NextResponse.json({ success: true, sessionId: session.id });
  } catch (error) {
    console.error('[first-session-slots] POST error:', error);
    return NextResponse.json({ error: 'Erreur réservation créneau' }, { status: 500 });
  }
}
