import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { canAccessTutorFeatures } from '@/lib/admin-permissions';
import { sendStudentSessionDecisionEmail } from '@/lib/registration-emails';
import { publishUserMercureUpdate } from '@/lib/mercure';

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

    const { data: studentData } = await (supabaseAdmin as any)
      .from('users')
      .select('email, first_name')
      .eq('id', (session as any).student_id)
      .single();

    const studentEmail: string | null = studentData?.email || null;
    const studentFirstName: string = studentData?.first_name || '';
    const { data: tutorData } = await (supabaseAdmin as any)
      .from('users')
      .select('first_name, last_name')
      .eq('id', user.id)
      .single();
    const tutorName = [tutorData?.first_name, tutorData?.last_name].filter(Boolean).join(' ') || 'Votre tuteur';

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
          message: `${tutorName} a refusé votre demande de séance de ${(session as any).subject} le ${new Date((session as any).started_at).toLocaleDateString('fr-FR')}. Réservez une nouvelle séance depuis votre espace étudiant.`,
          data: {
            session_id: sessionId,
            action: 'REJECTED',
            tutor_name: tutorName
          }
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't fail the request if notification fails
      }

      await publishUserMercureUpdate([user.id, (session as any).student_id], {
        type: 'session',
        action: 'rejected',
        userId: user.id,
        sessionId,
      });

      if (studentEmail) {
        void sendStudentSessionDecisionEmail({
          studentEmail,
          studentFirstName,
          tutorName,
          action: 'REJECTED',
          subject: (session as any).subject || 'Séance',
          startedAt: (session as any).started_at || new Date().toISOString(),
        });
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
          message: `${tutorName} a confirmé votre demande de séance de ${(session as any).subject} le ${new Date((session as any).started_at).toLocaleDateString('fr-FR')} à ${new Date((session as any).started_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.`,
          data: {
            session_id: sessionId,
            action: 'ACCEPTED',
            tutor_name: tutorName
          }
        });

      if (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't fail the request if notification fails
      }

      await publishUserMercureUpdate([user.id, (session as any).student_id], {
        type: 'session',
        action: 'accepted',
        userId: user.id,
        sessionId,
      });

      if (studentEmail) {
        void sendStudentSessionDecisionEmail({
          studentEmail,
          studentFirstName,
          tutorName,
          action: 'ACCEPTED',
          subject: (session as any).subject || 'Séance',
          startedAt: (session as any).started_at || new Date().toISOString(),
        });
      }

      return NextResponse.json({ success: true, action: 'accepted' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Session action endpoint error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
