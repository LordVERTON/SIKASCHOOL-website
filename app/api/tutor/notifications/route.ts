import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { canAccessTutorFeatures } from '@/lib/admin-permissions';

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

    // Get notification data
    const data = (notif as any).data || {};

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
          message: `Votre demande de séance de ${data.subject} le ${new Date(data.started_at).toLocaleDateString('fr-FR')} a été refusée par votre tuteur.`,
          data: {
            session_id: data.session_id,
            action: 'REJECTED'
          }
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't fail the request if notification fails
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
        message: `Votre demande de séance de ${data.subject} le ${new Date(data.started_at).toLocaleDateString('fr-FR')} à ${new Date(data.started_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} a été acceptée par votre tuteur.`,
        data: {
          session_id: data.session_id,
          action: 'ACCEPTED'
        }
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the request if notification fails
    }

    return NextResponse.json({ success: true, confirmed: true, sessionId: data.session_id });
      } catch {
    return NextResponse.json({ error: 'Erreur lors du traitement' }, { status: 500 });
  }
}


