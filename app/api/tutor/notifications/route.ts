import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { canAccessTutorFeatures } from '@/lib/admin-permissions';
import { sendStudentSessionDecisionEmail } from '@/lib/registration-emails';
import { publishUserMercureUpdate } from '@/lib/mercure';

// GET tutor notifications
export async function GET() {
  try {
    const user = await getUserSession();
    if (!user || !canAccessTutorFeatures(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: notifications, error } = await supabaseAdmin
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur lors de la récupération des notifications:', error);
      throw error as any;
    }

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
  } catch (error) {
    console.error('Erreur dans GET /api/tutor/notifications:', error);
    return NextResponse.json({ error: 'Erreur lors de la récupération des notifications' }, { status: 500 });
  }
}

// PATCH respond to a notification (confirm/decline)
export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserSession();
    if (!user || !canAccessTutorFeatures(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { notificationId, action, markAsRead } = body as { notificationId?: string; action?: 'CONFIRM' | 'DECLINE'; markAsRead?: boolean };
    if (!notificationId) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Si on veut juste marquer comme lu
    if (markAsRead) {
      await (supabaseAdmin as any)
        .from('notifications')
        .update({ is_read: true } as any)
        .eq('id', notificationId)
        .eq('user_id', user.id);
      await publishUserMercureUpdate([user.id], {
        type: 'notification',
        action: 'read',
        userId: user.id,
      });
      return NextResponse.json({ success: true });
    }

    if (!action) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Load notification to get booking/session data
    const { data: notif, error: notifErr } = await supabaseAdmin
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
    await publishUserMercureUpdate([user.id], {
      type: 'notification',
      action: 'read',
      userId: user.id,
    });

    // Get notification data
    const data = (notif as any).data || {};
    const studentId: string | null = data.student_id || null;
    const subjectLabel: string = data.subject || 'Séance';
    const startedAtValue: string = data.started_at || new Date().toISOString();

    let studentEmail: string | null = null;
    let studentFirstName = '';
    if (studentId) {
      const { data: studentData } = await (supabaseAdmin as any)
        .from('users')
        .select('email, first_name')
        .eq('id', studentId)
        .single();

      if (studentData?.email) {
        studentEmail = studentData.email;
        studentFirstName = studentData.first_name || '';
      }
    }
    const { data: tutorData } = await (supabaseAdmin as any)
      .from('users')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single();
    const tutorName = [tutorData?.first_name, tutorData?.last_name].filter(Boolean).join(' ') || 'Votre tuteur';

    if (action === 'DECLINE') {
      // Update session status to CANCELLED
      const { error: updateError } = await (supabaseAdmin as any)
        .from('sessions')
        .update({ status: 'CANCELLED' })
        .eq('id', data.session_id);

      if (updateError) {
        console.error('Error updating session status:', updateError);
        return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
      }

      // Create notification for student
      const { error: notificationError } = await (supabaseAdmin as any)
        .from('notifications')
        .insert({
          user_id: data.student_id,
          type: 'BOOKING',
          title: 'Séance refusée',
          message: `${tutorName} a refusé votre demande de séance de ${data.subject} le ${new Date(data.started_at).toLocaleDateString('fr-FR')}. Réservez une nouvelle séance depuis votre espace étudiant.`,
          data: {
            session_id: data.session_id,
            action: 'REJECTED',
            tutor_name: tutorName
          }
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't fail the request if notification fails
      }

      await publishUserMercureUpdate([data.student_id, user.id], {
        type: 'session',
        action: 'declined',
        userId: user.id,
        sessionId: data.session_id,
      });

      if (studentEmail) {
        void sendStudentSessionDecisionEmail({
          studentEmail,
          studentFirstName,
          tutorName,
          action: 'REJECTED',
          subject: subjectLabel,
          startedAt: startedAtValue,
        });
      }

      return NextResponse.json({ success: true, declined: true });
    }

    // For CONFIRM: update existing PENDING session to SCHEDULED
    const { error: updateError } = await (supabaseAdmin as any)
      .from('sessions')
      .update({ status: 'SCHEDULED' })
      .eq('id', data.session_id);

    if (updateError) {
      console.error('Error updating session status:', updateError);
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    }

    // Create notification for student
    const { error: notificationError } = await (supabaseAdmin as any)
      .from('notifications')
      .insert({
        user_id: data.student_id,
        type: 'BOOKING',
        title: 'Séance confirmée',
        message: `${tutorName} a confirmé votre demande de séance de ${data.subject} le ${new Date(data.started_at).toLocaleDateString('fr-FR')} à ${new Date(data.started_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.`,
        data: {
          session_id: data.session_id,
          action: 'ACCEPTED',
          tutor_name: tutorName
        }
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the request if notification fails
    }

    await publishUserMercureUpdate([data.student_id, user.id], {
      type: 'session',
      action: 'confirmed',
      userId: user.id,
      sessionId: data.session_id,
    });

    if (studentEmail) {
      void sendStudentSessionDecisionEmail({
        studentEmail,
        studentFirstName,
        tutorName,
        action: 'ACCEPTED',
        subject: subjectLabel,
        startedAt: startedAtValue,
      });
    }

    return NextResponse.json({ success: true, confirmed: true, sessionId: data.session_id });
      } catch {
    return NextResponse.json({ error: 'Erreur lors du traitement' }, { status: 500 });
  }
}


