import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CreateSessionSchema = z.object({
  studentId: z.string().optional(),
  studentIds: z.array(z.string()).optional(),
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

    const { studentId, studentIds, tutorId, subject, duration, startedAt } = parsed.data;

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

    // Create session in database with PENDING status
    // Try different column combinations to adapt to existing schema
        const insertData: any = {
      student_id,
      tutor_id,
      level: 'Niveau',
      started_at: startedAt,
      duration_minutes: duration,
    };

    // Add subject field (try different names)
    insertData.subject = subject;

    // Add type field (try different names)
    insertData.session_type = 'NOTA';

    // Try PENDING status first, fallback to SCHEDULED if constraint fails
    insertData.status = 'PENDING';

    let { data, error } = await (supabaseAdmin as any)
      .from('sessions')
      .insert(insertData)
      .select('id')
      .single();

    // If PENDING fails, try with SCHEDULED status
    if (error && error.message && error.message.includes('PENDING')) {
        // PENDING status not allowed, trying SCHEDULED...
      insertData.status = 'SCHEDULED';
      const retryResult = await (supabaseAdmin as any)
        .from('sessions')
        .insert(insertData)
        .select('id')
        .single();
      
      data = retryResult.data;
      error = retryResult.error;
    }

    if (error) {
      console.error('Session creation error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      return NextResponse.json({ 
        error: 'Failed to create session', 
        details: error.message || 'Unknown database error',
        insertData: insertData // Include the data we tried to insert for debugging
      }, { status: 500 });
    }

    // Get student name for notification
    const { data: studentData, error: studentError } = await supabaseAdmin
      .from('users')
      .select('first_name, last_name')
      .eq('id', student_id)
      .single();

    if (studentError) {
      console.error('Error fetching student data:', studentError);
    }

    const studentName = studentData ? `${(studentData as any).first_name} ${(studentData as any).last_name}` : 'Un étudiant';

    // Create notification for tutor
    const { error: notificationError } = await (supabaseAdmin as any)
      .from('notifications')
      .insert({
        user_id: tutor_id,
        type: 'BOOKING',
        title: 'Nouvelle demande de séance',
        message: `${studentName} souhaite planifier une séance de ${subject} le ${new Date(startedAt).toLocaleDateString('fr-FR')} à ${new Date(startedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}`,
        data: {
          session_id: data.id,
          student_id: student_id,
          student_name: studentName,
          subject: subject,
          started_at: startedAt,
          duration_minutes: duration
        }
      });

    if (notificationError) {
      console.error('Error creating notification:', notificationError);
      // Don't fail the session creation if notification fails
    }

    // Insert additional participants if provided
    const extraStudentIds = (studentIds || []).filter((id) => id !== student_id);
    if (extraStudentIds.length > 0) {
      const rows = extraStudentIds.map((sid) => ({ session_id: data.id, student_id: sid }));
      const { error: partErr } = await (supabaseAdmin as any)
        .from('session_participants')
        .insert(rows as any);
      if (partErr) {
        console.error('Failed to add session participants:', partErr);
      }
    }

    return NextResponse.json({ id: data.id, message: 'Session created successfully' });
  } catch (error) {
    console.error('Session creation endpoint error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
