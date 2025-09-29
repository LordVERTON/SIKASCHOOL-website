import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CreateSessionSchema = z.object({
  studentId: z.string().optional(),
  tutorId: z.string().optional(),
  subject: z.string().min(1, 'Subject is required'),
  duration: z.number().min(30).max(240),
  startedAt: z.string().min(1, 'Start time is required'),
}).refine((data) => data.studentId || data.tutorId, {
  message: "Either studentId or tutorId is required"
});

export async function POST(req: NextRequest) {
  try {
    const user = await getUserSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parsed = CreateSessionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const { studentId, tutorId, subject, duration, startedAt } = parsed.data;

    let student_id: string;
    let tutor_id: string;

    // Determine who is creating the session
    if (user.role === 'TUTOR' || user.role === 'ADMIN') {
      // Tutor creating session for a student
      if (!studentId) {
        return NextResponse.json({ error: 'Student ID is required for tutors' }, { status: 400 });
      }
      student_id = studentId;
      tutor_id = user.id;
      
      // Vérifier que l'étudiant est assigné à ce tuteur
      const { data: assignment, error: assignmentError } = await supabaseAdmin
        .from('tutor_student_assignments')
        .select('id')
        .eq('tutor_id', tutor_id)
        .eq('student_id', student_id)
        .eq('is_active', true)
        .single();
        
      if (assignmentError || !assignment) {
        return NextResponse.json({ 
          error: 'Cet étudiant n\'est pas assigné à ce tuteur' 
        }, { status: 403 });
      }
      
    } else if (user.role === 'STUDENT') {
      // Student requesting session with a tutor
      if (!tutorId) {
        return NextResponse.json({ error: 'Tutor ID is required for students' }, { status: 400 });
      }
      student_id = user.id;
      tutor_id = tutorId;
      
      // Vérifier que le tuteur est assigné à cet étudiant
      const { data: assignment, error: assignmentError } = await supabaseAdmin
        .from('tutor_student_assignments')
        .select('id')
        .eq('tutor_id', tutor_id)
        .eq('student_id', student_id)
        .eq('is_active', true)
        .single();
        
      if (assignmentError || !assignment) {
        return NextResponse.json({ 
          error: 'Ce tuteur n\'est pas assigné à cet étudiant' 
        }, { status: 403 });
      }
      
    } else {
      return NextResponse.json({ error: 'Only tutors and students can create sessions' }, { status: 403 });
    }

    // Create session in database
    const { data, error } = await (supabaseAdmin as any)
      .from('sessions')
      .insert({
        student_id,
        tutor_id,
        subject,
        level: 'Niveau', // Default level, can be made configurable
        type: 'NOTA', // Default type (NOTA = cours normal)
        status: 'SCHEDULED',
        started_at: startedAt,
        duration_minutes: duration,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Session creation error:', error);
      return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
    }

    return NextResponse.json({ id: data.id, message: 'Session created successfully' });
  } catch (error) {
    console.error('Session creation endpoint error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
