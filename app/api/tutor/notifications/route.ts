import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabase, supabaseAdmin } from '@/lib/supabase';

// GET tutor notifications
export async function GET() {
  try {
    const user = await getUserSession();
    if (!user || user.role !== 'TUTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: notifications, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error as any;

    if (!notifications || notifications.length === 0) {
      return NextResponse.json([]);
    }

    const formatted = notifications.map((n: any) => ({
      id: n.id,
      title: n.title,
      message: n.message,
      type: n.type,
      isRead: n.is_read,
      createdAt: n.created_at,
      data: n.data || null,
    }));

    return NextResponse.json(formatted);
  } catch (_error) {
    return NextResponse.json({ error: 'Erreur lors de la récupération des notifications' }, { status: 500 });
  }
}

// PATCH respond to a notification (confirm/decline)
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserSession();
    if (!user || user.role !== 'TUTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, action } = body as { notificationId?: string; action?: 'CONFIRM' | 'DECLINE' };
    if (!notificationId || !action) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Load notification to get booking/session data
    const { data: notif, error: notifErr } = await supabase
      .from('notifications')
      .select('*')
      .eq('id', notificationId)
      .eq('user_id', user.id)
      .single();

    if (notifErr || !notif) {
      return NextResponse.json({ error: 'Notification introuvable' }, { status: 404 });
    }

    // Always mark notification as read when acted on
    await (supabaseAdmin as any)
      .from('notifications')
      .update({ is_read: true } as any)
      .eq('id', notificationId)
      .eq('user_id', user.id);

    if (action === 'DECLINE') {
      return NextResponse.json({ success: true, declined: true });
    }

    // For CONFIRM: create a session based on notification data
    // Expected notif.data: { student_id, scheduled_at, duration_minutes, session_type, level, course_id }
    const data = (notif as any).data || {};
    const studentId: string | undefined = data.student_id;
    const scheduledAt: string | undefined = data.scheduled_at;
    const durationMinutes: number = Number(data.duration_minutes || 60);
    const sessionType: string = data.session_type || 'TODA';
    const level: string = data.level || 'Lycée';
    const courseId: string | null = data.course_id || null;

    if (!studentId || !scheduledAt) {
      return NextResponse.json({ error: 'Données de réservation manquantes' }, { status: 400 });
    }

    const startedAtIso = new Date(scheduledAt).toISOString();

    // Try to confirm an existing scheduled session first
    const { data: existing, error: findErr } = await (supabaseAdmin as any)
      .from('sessions')
      .select('id, status')
      .eq('student_id', studentId)
      .eq('tutor_id', user.id)
      .eq('started_at', startedAtIso)
      .limit(1)
      .maybeSingle();

    if (findErr) {
      return NextResponse.json({ error: 'Erreur recherche session' }, { status: 500 });
    }

    if (existing?.id) {
      const { error: updErr } = await (supabaseAdmin as any)
        .from('sessions')
        .update({ status: 'CONFIRMED' } as any)
        .eq('id', existing.id);

      if (updErr) {
        return NextResponse.json({ error: 'Confirmation de la session impossible' }, { status: 500 });
      }

      return NextResponse.json({ success: true, confirmed: true, sessionId: existing.id });
    }

    // Otherwise create a confirmed session
    const { data: created, error: insertErr } = await (supabaseAdmin as any)
      .from('sessions')
      .insert([
        {
          booking_id: data.booking_id || null,
          student_id: studentId,
          tutor_id: user.id,
          course_id: courseId,
          session_type: sessionType,
          level,
          started_at: startedAtIso,
          duration_minutes: durationMinutes,
          status: 'CONFIRMED',
        } as any,
      ])
      .select('id')
      .single();

    if (insertErr) {
      return NextResponse.json({ error: 'Création de la session impossible' }, { status: 500 });
    }

    return NextResponse.json({ success: true, created: true, sessionId: created?.id });
  } catch (_error) {
    return NextResponse.json({ error: 'Erreur lors du traitement' }, { status: 500 });
  }
}


