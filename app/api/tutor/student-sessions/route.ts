import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { getSessionParticipantsMap, mergeSessionStudentIds } from '@/lib/session-participants';

export async function GET(req: Request) {
  try {
    const user = await getUserSession();
    if (!user || user.role !== 'TUTOR') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');
    
    if (!studentId) {
      return NextResponse.json({ error: 'ID étudiant requis' }, { status: 400 });
    }

    const tutorId = user.id;

    // Vérifier que l'étudiant est bien assigné à ce tuteur
    const { data: assignment, error: assignmentError } = await (supabaseAdmin as any)
      .from('tutor_student_assignments')
      .select('id')
      .eq('tutor_id', tutorId)
      .eq('student_id', studentId)
      .eq('is_active', true)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json({ error: 'Étudiant non assigné à ce tuteur' }, { status: 403 });
    }

    // Récupérer les sessions de cet étudiant avec ce tuteur
    const { data: sessions, error: sessionsError } = await (supabaseAdmin as any)
      .from('sessions')
      .select(`
        id,
        student_id,
        subject,
        level,
        session_type,
        status,
        started_at,
        ended_at,
        duration_minutes,
        topics_covered,
        homework_assigned,
        student_rating,
        created_at
      `)
      .eq('tutor_id', tutorId)
      .order('started_at', { ascending: false });

    if (sessionsError) {
      console.error('Erreur lors de la récupération des sessions:', sessionsError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des sessions' }, { status: 500 });
    }

    const { participantsMap, error: participantsError } = await getSessionParticipantsMap(
      (sessions || []).map((session: any) => session.id)
    );
    if (participantsError) {
      console.error('Erreur lors de la récupération des participants:', participantsError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des participants' }, { status: 500 });
    }

    const studentSessions = (sessions || []).filter((session: any) =>
      mergeSessionStudentIds(session, participantsMap).includes(studentId)
    );

    // Récupérer les informations de l'étudiant
    const { data: studentInfo, error: studentError } = await (supabaseAdmin as any)
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email,
        avatar_url,
        students(
          grade_level,
          academic_goals
        )
      `)
      .eq('id', studentId)
      .single();

    if (studentError) {
      console.error('Erreur lors de la récupération des informations étudiant:', studentError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des informations étudiant' }, { status: 500 });
    }

    // Calculer les statistiques
    const totalSessions = studentSessions.length;
    const completedSessions = studentSessions.filter((s: any) => s.status === 'COMPLETED').length;
    const totalHours = studentSessions.filter((s: any) => s.status === 'COMPLETED').reduce((sum: number, s: any) => sum + (s.duration_minutes || 0), 0) / 60 || 0;
    const averageRating = studentSessions.filter((s: any) => s.status === 'COMPLETED' && s.student_rating).length > 0 
      ? studentSessions.filter((s: any) => s.status === 'COMPLETED' && s.student_rating).reduce((sum: number, s: any) => sum + (s.student_rating || 0), 0) / studentSessions.filter((s: any) => s.status === 'COMPLETED' && s.student_rating).length
      : 0;

    // Dernière session
    const lastSession = studentSessions[0] || null;

    // Sessions par mois pour l'affichage
    const sessionsByMonth = studentSessions.reduce((acc: any, session: any) => {
      const month = new Date(session.started_at).toISOString().substring(0, 7); // YYYY-MM
      if (!acc[month]) {
        acc[month] = [];
      }
      acc[month].push(session);
      return acc;
    }, {}) || {};

    return NextResponse.json({
      student: {
        id: studentInfo.id,
        name: `${studentInfo.first_name} ${studentInfo.last_name}`,
        email: studentInfo.email,
        avatar_url: studentInfo.avatar_url || '/images/user/user-01.png',
        level: studentInfo.students?.[0]?.grade_level || 'Débutant',
        academic_goals: studentInfo.students?.[0]?.academic_goals || ''
      },
      sessions: studentSessions,
      sessionsByMonth,
      statistics: {
        totalSessions,
        completedSessions,
        totalHours: Math.round(totalHours * 10) / 10,
        averageRating: Math.round(averageRating * 10) / 10,
        lastSession: lastSession ? {
          date: new Date(lastSession.started_at).toLocaleDateString('fr-FR'),
          subject: lastSession.subject,
          status: lastSession.status
        } : null
      }
    });

  } catch (error) {
    console.error('Erreur dans l\'API sessions étudiant:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
