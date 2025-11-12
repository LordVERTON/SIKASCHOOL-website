import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { canAccessAdminFeatures } from '@/lib/admin-permissions';

export async function GET() {
  try {
    // Vérifier l'authentification
    const user = await getUserSession();
    if (!user || !canAccessAdminFeatures(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Récupérer toutes les sessions avec les informations des utilisateurs
    // Essayer d'abord avec 'type', puis avec 'session_type' si nécessaire
    let sessions: any[] = [];

    // Essayer avec 'type' d'abord
    const { data: sessionsWithType, error: errorWithType } = await supabaseAdmin
      .from('sessions')
      .select(`
        id,
        student_id,
        tutor_id,
        subject,
        level,
        type,
        status,
        started_at,
        completed_at,
        duration_minutes,
        student_rating,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (errorWithType) {
      // Si erreur, essayer avec 'session_type'
      const { data: sessionsWithSessionType, error: errorWithSessionType } = await supabaseAdmin
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
          completed_at,
          duration_minutes,
          student_rating,
          created_at,
          updated_at
        `)
        .order('created_at', { ascending: false });

      if (errorWithSessionType) {
        console.error('Erreur lors de la récupération des sessions:', errorWithSessionType);
        return NextResponse.json({ error: 'Failed to fetch sessions', details: errorWithSessionType.message }, { status: 500 });
      }

      sessions = sessionsWithSessionType || [];
    } else {
      sessions = sessionsWithType || [];
    }

    // Si aucune session, retourner un tableau vide
    if (!sessions || sessions.length === 0) {
      return NextResponse.json([]);
    }

    // Récupérer les informations des utilisateurs
    const userIds = [...new Set([
      ...sessions.map((s: any) => s.student_id).filter(Boolean),
      ...sessions.map((s: any) => s.tutor_id).filter(Boolean)
    ])];

    let users: any[] = [];
    if (userIds.length > 0) {
      const { data: usersData, error: usersError } = await supabaseAdmin
        .from('users')
        .select('id, first_name, last_name')
        .in('id', userIds);

      if (usersError) {
        console.error('Erreur lors de la récupération des utilisateurs:', usersError);
        return NextResponse.json({ error: 'Failed to fetch users', details: usersError.message }, { status: 500 });
      }

      users = usersData || [];
    }

    // Créer un map des utilisateurs pour un accès rapide
    const usersMap = new Map(users.map((user: any) => [user.id, user]));

    // Formater les données pour l'affichage
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
        type: session.type || session.session_type || 'N/A',
        status: session.status || 'N/A',
        started_at: session.started_at,
        completed_at: session.completed_at,
        duration_minutes: session.duration_minutes || 60,
        student_rating: session.student_rating || null,
        created_at: session.created_at,
        updated_at: session.updated_at
      };
    });

    return NextResponse.json(formattedSessions);
  } catch (error) {
    console.error('Erreur dans GET /api/admin/sessions:', error);
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const user = await getUserSession();
    if (!user || !canAccessAdminFeatures(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { student_id, tutor_id, subject, level, type, status, duration_minutes, student_rating } = await request.json();

    // Vérifier que l'étudiant et le tuteur existent
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

    // Créer la session
    const { data: newSession, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .insert({
        student_id,
        tutor_id,
        subject,
        level,
        type,
        status: status || 'SCHEDULED',
        duration_minutes: duration_minutes || 60,
        student_rating: student_rating || null
      } as any)
      .select()
      .single();

    if (sessionError) {
      console.error('Erreur lors de la création de la session:', sessionError);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    return NextResponse.json({ 
      session: newSession,
      message: 'Session created successfully' 
    });
  } catch (error) {
    console.error('Erreur dans POST /api/admin/sessions:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
