import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';

const AssessmentSchema = z.object({
  sessionId: z.string(),
  studentId: z.string(),
  concentration: z.number().int().min(1).max(5),
  participation: z.number().int().min(1).max(5),
  preparation: z.number().int().min(1).max(5),
  improvement: z.number().int().min(1).max(5),
  retention: z.number().int().min(1).max(5),
  comprehension: z.number().int().min(1).max(5),
  time_management: z.number().int().min(1).max(5),
  collaboration: z.number().int().min(1).max(5),
  notes: z.string().max(2000).optional()
});

export async function POST(request: NextRequest) {
  try {
    const user = await getUserSession();
    if (!user || user.role !== 'TUTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const parsed = AssessmentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const {
      sessionId, studentId,
      concentration, participation, preparation, improvement,
      retention, comprehension, time_management, collaboration, notes
    } = parsed.data;

    // Verify session ownership
    const { data: session, error: sessionError } = await (supabaseAdmin as any)
      .from('sessions')
      .select('id, tutor_id, student_id')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }
    const sessionData = session as any;
    if (sessionData.tutor_id !== user.id || sessionData.student_id !== studentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Upsert assessment
    const { data: upserted, error: upsertError } = await supabaseAdmin
      .from('session_assessments')
      .upsert({
        session_id: sessionId,
        student_id: studentId,
        tutor_id: user.id,
        concentration,
        participation,
        preparation,
        improvement,
        retention,
        comprehension,
        time_management,
        collaboration,
        notes: notes || null
      } as any, { onConflict: 'session_id' })
      .select()
      .single();

    if (upsertError) {
      console.error('Failed to upsert assessment', upsertError);
      return NextResponse.json({ error: 'Failed to save assessment' }, { status: 500 });
    }

    // Optionally mark session as completed if not already
    await (supabaseAdmin as any)
      .from('sessions')
      .update({ status: 'COMPLETED', completed_at: new Date().toISOString() } as any)
      .eq('id', sessionId)
      .eq('status', 'IN_PROGRESS');

    return NextResponse.json({ assessment: upserted });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserSession();
    if (!user || user.role !== 'TUTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('studentId');
    if (!studentId) {
      return NextResponse.json({ error: 'studentId is required' }, { status: 400 });
    }

    // Ensure tutor has sessions with this student for access
    const { error: sessErr } = await (supabaseAdmin as any)
      .from('sessions')
      .select('id')
      .eq('tutor_id', user.id)
      .eq('student_id', studentId);

    if (sessErr) {
      return NextResponse.json({ error: 'Failed to verify access' }, { status: 500 });
    }

    // Fetch assessments for this student authored by this tutor
    const { data: assessments, error } = await (supabaseAdmin as any)
      .from('session_assessments')
      .select('*')
      .eq('student_id', studentId)
      .eq('tutor_id', user.id)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 });
    }

    return NextResponse.json({ assessments: assessments || [] });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

