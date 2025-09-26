import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserSession();
    if (!user || user.role !== 'TUTOR') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const url = new URL(request.url);
    const start = url.searchParams.get('start');
    const end = url.searchParams.get('end');

    let query: any = (supabaseAdmin as any)
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
        duration_minutes,
        topics_covered,
        homework_assigned,
        student_rating,
        created_at
      `)
      .eq('tutor_id', user.id)
      .neq('status', 'CANCELLED')
      .order('started_at', { ascending: false });

    if (start) query = query.gte('started_at', start);
    if (end) query = query.lte('started_at', end);

    const { data: sessions, error } = await query;
    if (error) {
      console.error('Erreur récupération sessions tuteur:', error);
      return NextResponse.json({ error: 'Erreur récupération sessions' }, { status: 500 });
    }

    // Fetch students minimal info
    const studentIds = [...new Set((sessions || []).map((s: any) => s.student_id).filter(Boolean))];
    let studentsMap = new Map<string, any>();
    if (studentIds.length > 0) {
      const { data: students } = await (supabaseAdmin as any)
        .from('users')
        .select('id, first_name, last_name, avatar_url')
        .in('id', studentIds);
      studentsMap = new Map((students || []).map((u: any) => [u.id, u]));
    }

    const mapped = (sessions || []).map((s: any) => {
      const student = studentsMap.get(s.student_id);
      return {
        id: s.id,
        started_at: s.started_at,
        course: s.subject || 'Cours',
        type: s.type || 'INDIVIDUAL',
        level: s.level || 'Niveau',
        student: student ? `${student.first_name || ''} ${student.last_name || ''}`.trim() : 'Élève',
        studentAvatar: student?.avatar_url || '/images/user/user-01.png',
        duration: s.duration_minutes || 60,
        status: s.status,
        topics: Array.isArray(s.topics_covered)
          ? s.topics_covered
          : (s.topics_covered ? String(s.topics_covered).split(',').map((t: string) => t.trim()) : []),
        homework: s.homework_assigned || '',
        studentRating: s.student_rating || 0,
      };
    });

    return NextResponse.json({ sessions: mapped });
  } catch (error) {
    console.error('❌ Erreur API sessions tuteur:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}


