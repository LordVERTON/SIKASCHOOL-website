import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { hasAdminPermissions } from '@/lib/admin-permissions';

export async function GET() {
  try {
    // Vérifier l'authentification
    const user = await getUserSession();
    if (!user || user.role !== 'TUTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier les permissions admin
    if (!hasAdminPermissions(user)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Récupérer toutes les sessions avec les informations des utilisateurs
    const { data: sessions, error: _error } = await supabaseAdmin
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

    if (_error) {
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    // Récupérer les informations des utilisateurs
    const userIds = [...new Set([
      ...(sessions as any)?.map((s: any) => s.student_id) || [],
      ...(sessions as any)?.map((s: any) => s.tutor_id) || []
    ])];

    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, first_name, last_name')
      .in('id', userIds);

    if (usersError) {
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Créer un map des utilisateurs pour un accès rapide
    const usersMap = new Map((users as any)?.map((user: any) => [user.id, user]) || []);

    // Formater les données pour l'affichage
    const formattedSessions = (sessions as any)?.map((session: any) => {
      const student = usersMap.get(session.student_id);
      const tutor = usersMap.get(session.tutor_id);
      
      return {
        id: session.id,
        student_id: session.student_id,
        tutor_id: session.tutor_id,
        student_name: student ? `${(student as any).first_name} ${(student as any).last_name}` : 'N/A',
        tutor_name: tutor ? `${(tutor as any).first_name} ${(tutor as any).last_name}` : 'N/A',
        subject: session.subject,
        level: session.level,
        type: session.type,
        status: session.status,
        started_at: session.started_at,
        completed_at: session.completed_at,
        duration_minutes: session.duration_minutes,
        student_rating: session.student_rating,
        created_at: session.created_at,
        updated_at: session.updated_at
      };
    }) || [];

    return NextResponse.json(formattedSessions);
  } catch (_error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const user = await getUserSession();
    if (!user || user.role !== 'TUTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier les permissions admin
    if (!hasAdminPermissions(user)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
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
  } catch (_error) {
    console.warn('Erreur dans /api/admin/sessions POST:', _error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
