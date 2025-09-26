import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserSession();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const url = new URL(request.url);
    const status = url.searchParams.get('status'); // 'COMPLETED' | 'IN_PROGRESS' | 'SCHEDULED' | 'CANCELLED' | null
    const start = url.searchParams.get('start'); // ISO date string
    const end = url.searchParams.get('end'); // ISO date string

    let query: any = supabaseAdmin
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
        topics_covered,
        homework_assigned,
        student_rating,
        created_at
      `)
      .eq('student_id', user.id)
      .order('started_at', { ascending: false });

    if (status && ['COMPLETED','IN_PROGRESS','SCHEDULED','CANCELLED'].includes(status)) {
      query = query.eq('status', status);
    }
    if (start) {
      query = query.gte('started_at', start);
    }
    if (end) {
      query = query.lte('started_at', end);
    }

    const { data: sessions, error } = await query;
    if (error) {
      console.error('Erreur récupération sessions:', error);
      return NextResponse.json({ error: 'Erreur récupération sessions' }, { status: 500 });
    }

    // Fetch tutors minimal info
    const tutorIds = [...new Set((sessions || []).map((s: any) => s.tutor_id).filter(Boolean))];
    let tutorsMap = new Map<string, any>();
    if (tutorIds.length > 0) {
      const { data: tutors } = await supabaseAdmin
        .from('users')
        .select('id, first_name, last_name, avatar_url')
        .in('id', tutorIds);
      tutorsMap = new Map((tutors || []).map((t: any) => [t.id, t]));
    }

    const mapped = (sessions || []).map((s: any) => {
      const tutor = tutorsMap.get(s.tutor_id);
      return {
        id: s.id,
        started_at: s.started_at,
        course: s.subject || 'Cours',
        type: s.type || 'INDIVIDUAL',
        level: s.level || 'Niveau',
        tutor: tutor ? `${tutor.first_name || ''} ${tutor.last_name || ''}`.trim() : 'Tuteur',
        tutorAvatar: tutor?.avatar_url || '/images/user/user-01.png',
        duration: s.duration_minutes || 60,
        status: s.status,
        topics: Array.isArray(s.topics_covered)
          ? s.topics_covered
          : (s.topics_covered ? String(s.topics_covered).split(',').map((t: string) => t.trim()) : []),
        homework: s.homework_assigned || '',
        studentRating: s.student_rating || 0,
        tutorRating: 0,
        price: Math.round(((s.duration_minutes || 60) / 60) * 35)
      };
    });

    return NextResponse.json({ sessions: mapped });
  } catch (error) {
    console.error('❌ Erreur API sessions étudiant:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}


