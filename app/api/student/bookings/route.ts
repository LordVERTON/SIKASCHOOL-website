import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';

// Create a booking request -> notify tutor
export async function POST(request: NextRequest) {
  try {
    const user = await getUserSession();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      tutorId,
      subject,
      sessionType,
      level,
      date,
      time,
      duration,
      notes,
      courseId,
    } = body as {
      tutorId: string;
      subject?: string;
      sessionType?: string;
      level?: string;
      date: string; // YYYY-MM-DD
      time: string; // HH:mm
      duration?: number;
      notes?: string;
      courseId?: string | null;
    };

    if (!tutorId || !date || !time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Basic UUID v4 format check to avoid FK errors with mock ids
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(tutorId);
    if (!isUuid) {
      return NextResponse.json({ error: 'Invalid tutor id' }, { status: 400 });
    }

    const scheduledAtIso = new Date(`${date}T${time}:00`).toISOString();

    const title = 'Nouvelle demande de séance';
    const message = `${user.name || 'Un élève'} souhaite réserver une séance${subject ? ` (${subject})` : ''} le ${new Date(scheduledAtIso).toLocaleString('fr-FR')}.`;

    const data = {
      student_id: user.id,
      scheduled_at: scheduledAtIso,
      duration_minutes: duration ?? 60,
      session_type: sessionType || 'TODA',
      level: level || 'Lycée',
      course_id: courseId || null,
      subject: subject || null,
      notes: notes || null,
    };

    const { error } = await (supabaseAdmin as any)
      .from('notifications')
      .insert([
        {
          user_id: tutorId,
          type: 'BOOKING',
          title,
          message,
          data,
          is_read: false,
        } as any,
      ]);

    if (error) {
      return NextResponse.json({ error: 'Unable to create notification', details: error.message || error }, { status: 500 });
    }

    // Also create a scheduled session immediately so calendars reflect the booking
    const { data: sessionInsert, error: sessionErr } = await (supabaseAdmin as any)
      .from('sessions')
      .insert([
        {
          booking_id: null,
          student_id: user.id,
          tutor_id: tutorId,
          course_id: data.course_id,
          session_type: data.session_type,
          level: data.level,
          started_at: data.scheduled_at,
          duration_minutes: data.duration_minutes,
          status: 'SCHEDULED',
        } as any,
      ])
      .select('id')
      .single();

    if (sessionErr) {
      return NextResponse.json({ error: 'Unable to create session', details: sessionErr.message || sessionErr }, { status: 500 });
    }

    return NextResponse.json({ success: true, sessionId: sessionInsert?.id });
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}


