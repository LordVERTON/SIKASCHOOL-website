import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const user = await getUserSession();
    if (!user || user.role !== 'TUTOR') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Find distinct student_ids from sessions for this tutor
    const { data: sessions, error } = await (supabaseAdmin as any)
      .from('sessions')
      .select('student_id, subject, level, started_at, status')
      .eq('tutor_id', user.id)
      .order('started_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération élèves tuteur:', error);
      return NextResponse.json({ error: 'Erreur récupération élèves' }, { status: 500 });
    }

    const studentIdToSessions: Record<string, any[]> = {};
    for (const s of sessions || []) {
      if (!s.student_id) continue;
      if (!studentIdToSessions[s.student_id]) studentIdToSessions[s.student_id] = [];
      studentIdToSessions[s.student_id].push(s);
    }

    const studentIds = Object.keys(studentIdToSessions);
    if (studentIds.length === 0) {
      return NextResponse.json({ students: [] });
    }

    // Fetch student user info
    const { data: users } = await (supabaseAdmin as any)
      .from('users')
      .select('id, first_name, last_name')
      .in('id', studentIds);

    const usersMap: Map<string, any> = new Map((users || []).map((u: any) => [u.id, u]));

    const students = studentIds.map((id) => {
      const u = usersMap.get(id) as any;
      const list = studentIdToSessions[id] || [];
      const last = list[0];
      return {
        id,
        name: `${u?.first_name || ''} ${u?.last_name || ''}`.trim() || 'Élève',
        level: last?.level || '—',
        subject: last?.subject || '—',
        status: last?.status || '—',
        lastSessionAt: last?.started_at || null,
      };
    });

    return NextResponse.json({ students });
  } catch (error) {
    console.error('❌ Erreur API élèves tuteur:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}


