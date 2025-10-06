import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { canAccessTutorFeatures } from '@/lib/admin-permissions';

export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserSession();
    if (!user || !canAccessTutorFeatures(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, action } = body as { sessionId?: string; action?: 'ACCEPT' | 'REJECT' };
    
    if (!sessionId || !action) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // Verify the session belongs to this tutor
    const { data: session, error: sessionError } = await (supabaseAdmin as any)
      .from('sessions')
      .select('id, tutor_id, status, student_id, subject, started_at, duration_minutes')
      .eq('id', sessionId)
      .eq('tutor_id', user.id)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if ((session as any).status !== 'PENDING') {
      return NextResponse.json({ error: 'Session is not pending' }, { status: 400 });
    }

    if (action === 'REJECT') {
      // Update session status to CANCELLED
      const { error: updateError } = await (supabaseAdmin as any)
        .from('sessions')
        .update({ status: 'CANCELLED' })
        .eq('id', sessionId);

      if (updateError) {
        console.error('Error updating session status:', updateError);
        return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
      }

      // Create notification for student
      const { error: notificationError } = await (supabaseAdmin as any)
        .from('notifications')
        .insert({
          user_id: (session as any).student_id,
          type: 'BOOKING',
          title: 'Séance refusée',
          message: `Votre demande de séance de ${(session as any).subject} le ${new Date((session as any).started_at).toLocaleDateString('fr-FR')} a été refusée par votre tuteur.`,
          data: {
            session_id: sessionId,
            action: 'REJECTED'
          }
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't fail the request if notification fails
      }

      return NextResponse.json({ success: true, action: 'rejected' });
    }

    if (action === 'ACCEPT') {
      // Update session status to SCHEDULED
      const { error: updateError } = await (supabaseAdmin as any)
        .from('sessions')
        .update({ status: 'SCHEDULED' })
        .eq('id', sessionId);

      if (updateError) {
        console.error('Error updating session status:', updateError);
        return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
      }

      // Create notification for student
      const { error: notificationError } = await (supabaseAdmin as any)
        .from('notifications')
        .insert({
          user_id: (session as any).student_id,
          type: 'BOOKING',
          title: 'Séance confirmée',
          message: `Votre demande de séance de ${(session as any).subject} le ${new Date((session as any).started_at).toLocaleDateString('fr-FR')} à ${new Date((session as any).started_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })} a été acceptée par votre tuteur.`,
          data: {
            session_id: sessionId,
            action: 'ACCEPTED'
          }
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't fail the request if notification fails
      }

      return NextResponse.json({ success: true, action: 'accepted' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Session action endpoint error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
