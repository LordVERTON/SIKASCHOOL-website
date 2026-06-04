import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { canAccessAdminFeatures } from '@/lib/admin-permissions';
import { syncSessionParticipants } from '@/lib/session-participants';

export async function GET() {
  try {
    const user = await getUserSession();
    if (!user || !canAccessAdminFeatures(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // List every session regardless of status: PENDING, SCHEDULED,
    // IN_PROGRESS, COMPLETED, CANCELLED, and future statuses.
    const { data: sessions, error: sessionsError } = await supabaseAdmin
      .from('sessions')
      .select(`
        id,
        student_id,
        tutor_id,
        subject,
        level,
        session_type,
        status,
        started_at,
        ended_at,
        duration_minutes,
        student_rating,
        created_at,
        updated_at
      `)
      .order('started_at', { ascending: false });

    if (sessionsError) {
      console.error('Erreur lors de la recuperation des sessions:', sessionsError);
      return NextResponse.json(
        { error: 'Failed to fetch sessions', details: sessionsError.message },
        { status: 500 },
      );
    }

    if (!sessions?.length) {
      return NextResponse.json([]);
    }

    const userIds = [
      ...new Set([
        ...sessions.map((s: any) => s.student_id).filter(Boolean),
        ...sessions.map((s: any) => s.tutor_id).filter(Boolean),
      ]),
    ];

    let users: any[] = [];
    if (userIds.length > 0) {
      const { data: usersData, error: usersError } = await supabaseAdmin
        .from('users')
        .select('id, first_name, last_name')
        .in('id', userIds);

      if (usersError) {
        console.error('Erreur lors de la recuperation des utilisateurs:', usersError);
        return NextResponse.json(
          { error: 'Failed to fetch users', details: usersError.message },
          { status: 500 },
        );
      }

      users = usersData || [];
    }

    const usersMap = new Map(users.map((row: any) => [row.id, row]));

    const formattedSessions = sessions.map((session: any) => {
      const student = usersMap.get(session.student_id);
      const tutor = usersMap.get(session.tutor_id);

      return {
        id: session.id,
        student_id: session.student_id,
        tutor_id: session.tutor_id,
        student_name: student ? `${student.first_name || ''} ${student.last_name || ''}`.trim() || 'N/A' : 'N/A',
        tutor_name: tutor ? `${tutor.first_name || ''} ${tutor.last_name || ''}`.trim() || 'N/A' : 'N/A',
        subject: session.subject || 'N/A',
        level: session.level || 'N/A',
        type: session.session_type || 'N/A',
        status: session.status || 'N/A',
        started_at: session.started_at,
        completed_at: session.ended_at,
        duration_minutes: session.duration_minutes || 60,
        student_rating: session.student_rating || null,
        created_at: session.created_at,
        updated_at: session.updated_at,
      };
    });

    return NextResponse.json(formattedSessions);
  } catch (error) {
    console.error('Erreur dans GET /api/admin/sessions:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserSession();
    if (!user || !canAccessAdminFeatures(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { student_id, tutor_id, subject, level, type, status, duration_minutes, student_rating, started_at } =
      await request.json();

    const { data: student, error: studentError } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('id', student_id)
      .eq('role', 'STUDENT')
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 400 });
    }

    const { data: tutor, error: tutorError } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('id', tutor_id)
      .eq('role', 'TUTOR')
      .single();

    if (tutorError || !tutor) {
      return NextResponse.json({ error: 'Tutor not found' }, { status: 400 });
    }

    const { data: newSession, error: sessionError } = await (supabaseAdmin as any)
      .from('sessions')
      .insert({
        student_id,
        tutor_id,
        subject,
        level,
        session_type: type || 'NOTA',
        status: status || 'SCHEDULED',
        started_at: started_at || new Date().toISOString(),
        duration_minutes: duration_minutes || 60,
        student_rating: student_rating || null,
      })
      .select()
      .single();

    if (sessionError) {
      console.error('Erreur lors de la creation de la session:', sessionError);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    const { error: participantSyncError } = await syncSessionParticipants(newSession.id, [student_id]);
    if (participantSyncError) {
      console.error('Erreur lors de la synchronisation des participants:', participantSyncError);
      return NextResponse.json({ error: 'Failed to attach session participants' }, { status: 500 });
    }

    return NextResponse.json({
      session: newSession,
      message: 'Session created successfully',
    });
  } catch (error) {
    console.error('Erreur dans POST /api/admin/sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
