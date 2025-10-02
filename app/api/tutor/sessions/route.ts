import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { canAccessTutorFeatures } from '@/lib/admin-permissions';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserSession();
    if (!user || !canAccessTutorFeatures(user)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const url = new URL(request.url);
    const start = url.searchParams.get('start');
    const end = url.searchParams.get('end');
    const status = url.searchParams.get('status');

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
    if (status) query = query.eq('status', status);

    const { data: sessions, error } = await query;
    if (error) {
      console.error('Erreur récupération sessions tuteur:', error);
      return NextResponse.json({ error: 'Erreur récupération sessions' }, { status: 500 });
    }

    // Fetch participants
    const sessionIds = (sessions || []).map((s: any) => s.id);
    const participantsBySession = new Map<string, string[]>();
    const allStudentIds = new Set<string>((sessions || []).map((s: any) => s.student_id).filter(Boolean));
    if (sessionIds.length > 0) {
      const { data: participants } = await (supabaseAdmin as any)
        .from('session_participants')
        .select('session_id, student_id')
        .in('session_id', sessionIds);
      (participants || []).forEach((p: any) => {
        const list = participantsBySession.get(p.session_id) || [];
        list.push(p.student_id);
        participantsBySession.set(p.session_id, list);
        allStudentIds.add(p.student_id);
      });
    }

    const studentIds = [...allStudentIds];
    let studentsMap = new Map<string, any>();
    if (studentIds.length > 0) {
      const { data: students } = await (supabaseAdmin as any)
        .from('users')
        .select('id, first_name, last_name, avatar_url')
        .in('id', studentIds);
      studentsMap = new Map((students || []).map((u: any) => [u.id, u]));
    }

    const mapped = (sessions || []).map((s: any) => {
      const direct = studentsMap.get(s.student_id);
      const partIds = participantsBySession.get(s.id) || [];
      const participantUsers = partIds.map((sid) => studentsMap.get(sid)).filter(Boolean);
      const names = [direct, ...participantUsers].filter(Boolean).map((u: any) => `${u.first_name || ''} ${u.last_name || ''}`.trim());
      return {
        id: s.id,
        started_at: s.started_at,
        course: s.subject || 'Cours',
        type: s.type || 'INDIVIDUAL',
        level: s.level || 'Niveau',
        student_id: s.student_id || null,
        student_name: names[0] || 'Étudiant',
        participants: names,
        studentAvatar: direct?.avatar_url || '/images/user/user-01.png',
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


