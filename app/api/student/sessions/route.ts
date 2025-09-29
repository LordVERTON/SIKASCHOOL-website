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

    // 1) Sessions où l'étudiant est le titulaire (legacy)
    let baseQuery: any = (supabaseAdmin as any)
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
      .eq('student_id', user.id);

    if (status && ['COMPLETED','IN_PROGRESS','SCHEDULED','CANCELLED'].includes(status)) {
      baseQuery = baseQuery.eq('status', status);
    }
    if (start) baseQuery = baseQuery.gte('started_at', start);
    if (end) baseQuery = baseQuery.lte('started_at', end);

    const { data: ownSessions, error: ownErr } = await baseQuery.order('started_at', { ascending: false });
    if (ownErr) {
      console.error('Erreur sessions (own):', ownErr);
      return NextResponse.json({ error: 'Erreur récupération sessions' }, { status: 500 });
    }

    // 2) Sessions où l'étudiant est participant
    const { data: participantLinks, error: partErr } = await (supabaseAdmin as any)
      .from('session_participants')
      .select('session_id')
      .eq('student_id', user.id);
    if (partErr) {
      console.error('Erreur participants:', partErr);
      return NextResponse.json({ error: 'Erreur récupération participants' }, { status: 500 });
    }

    let participantSessions: any[] = [];
    const participantSessionIds = Array.from(new Set((participantLinks || []).map((p: any) => p.session_id)));
    if (participantSessionIds.length > 0) {
      let partQuery: any = (supabaseAdmin as any)
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
        .in('id', participantSessionIds);
      if (status && ['COMPLETED','IN_PROGRESS','SCHEDULED','CANCELLED'].includes(status)) partQuery = partQuery.eq('status', status);
      if (start) partQuery = partQuery.gte('started_at', start);
      if (end) partQuery = partQuery.lte('started_at', end);
      const { data: partSessions, error: partSessionsErr } = await partQuery.order('started_at', { ascending: false });
      if (partSessionsErr) {
        console.error('Erreur sessions (participants):', partSessionsErr);
      } else {
        participantSessions = partSessions || [];
      }
    }

    // 3) Fusionner et dédupliquer
    const byId = new Map<string, any>();
    for (const s of (ownSessions || [])) byId.set(s.id, s);
    for (const s of (participantSessions || [])) byId.set(s.id, s);
    const sessions = Array.from(byId.values()).sort((a: any, b: any) => (a.started_at > b.started_at ? -1 : 1));

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


