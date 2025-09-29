import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { canAccessTutorFeatures } from '@/lib/admin-permissions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getUserSession();
    if (!user || !canAccessTutorFeatures(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(req.url);
    const month = url.searchParams.get('month'); // YYYY-MM

    let fromDate: string | null = null;
    let toDate: string | null = null;
    if (month && /^\d{4}-\d{2}$/.test(month)) {
      const [y, m] = month.split('-').map((v) => parseInt(v, 10));
      const start = new Date(y, m - 1, 1);
      const end = new Date(y, m, 0, 23, 59, 59, 999);
      fromDate = start.toISOString();
      toDate = end.toISOString();
    }

    let query: any = (supabaseAdmin as any)
      .from('sessions')
      .select('id, student_id, subject, level, status, started_at, duration_minutes')
      .eq('tutor_id', user.id)
      .neq('status', 'CANCELLED')
      .order('started_at', { ascending: false });

    if (fromDate) query = query.gte('started_at', fromDate);
    if (toDate) query = query.lte('started_at', toDate);

    const { data: sessions, error } = await query;
    if (error) {
      console.error('payments/history sessions error', error);
      return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
    }

    const studentIds = [...new Set((sessions || []).map((s: any) => s.student_id).filter(Boolean))];
    let studentsMap = new Map<string, any>();
    if (studentIds.length > 0) {
      const { data: students } = await (supabaseAdmin as any)
        .from('users')
        .select('id, first_name, last_name, avatar_url')
        .in('id', studentIds);
      studentsMap = new Map((students || []).map((u: any) => [u.id, u]));
    }

    const items = (sessions || []).map((s: any) => {
      const st = studentsMap.get(s.student_id);
      return {
        id: s.id,
        declaredAt: s.started_at,
        student: st ? `${st.first_name || ''} ${st.last_name || ''}`.trim() : 'Élève',
        subject: s.subject,
        level: s.level,
        durationMinutes: s.duration_minutes,
        status: s.status,
      };
    });

    return NextResponse.json({ items });
  } catch (e) {
    console.error('payments/history error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


