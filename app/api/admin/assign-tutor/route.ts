import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getUserSession } from '@/lib/auth-simple';
import { canAccessAdminFeatures } from '@/lib/admin-permissions';
import { supabaseAdmin } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type AssignmentRow = Database['public']['Tables']['tutor_student_assignments']['Row'];
type AssignmentInsert = Database['public']['Tables']['tutor_student_assignments']['Insert'];
type AssignmentUpdate = Database['public']['Tables']['tutor_student_assignments']['Update'];

type UsersRow = Database['public']['Tables']['users']['Row'];

const assignTutorSchema = z
  .object({
    tutorId: z.string().uuid('Invalid tutorId'),
    studentId: z.string().uuid('Invalid studentId'),
    notes: z
      .string()
      .trim()
      .max(500, 'Notes must be 500 characters or fewer')
      .optional(),
  })
  .strict();

const deassignSchema = z
  .object({
    tutorId: z.string().uuid('Invalid tutorId'),
    studentId: z.string().uuid('Invalid studentId'),
  })
  .strict();

async function ensureUserExists(id: string, role: UsersRow['role']) {
  const { data, error } = await supabaseAdmin
    .from<UsersRow>('users')
    .select('id, role')
    .eq('id', id)
    .eq('role', role)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getUserSession();
    if (!sessionUser || !canAccessAdminFeatures(sessionUser)) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 401 });
    }

    const rawBody = await request.json().catch(() => ({}));
    const parsed = assignTutorSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: 'Invalid payload',
          issues: parsed.error.issues,
        },
        { status: 400 },
      );
    }

    const { tutorId, studentId, notes } = parsed.data;
    const trimmedNotes = notes?.trim() || null;

    const tutor = await ensureUserExists(tutorId, 'TUTOR');
    if (!tutor) {
      return NextResponse.json({ error: 'Tutor not found' }, { status: 404 });
    }

    const student = await ensureUserExists(studentId, 'STUDENT');
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const insertPayload: AssignmentInsert = {
      tutor_id: tutorId,
      student_id: studentId,
      assigned_by: sessionUser.id,
      notes: trimmedNotes,
    };

    const { data: assignment, error: assignmentError } = await supabaseAdmin
      .from<AssignmentRow>('tutor_student_assignments')
      .insert(insertPayload)
      .select('id')
      .single();

    if (assignmentError) {
      if (assignmentError.code === '23505') {
        return NextResponse.json(
          { error: 'Tutor is already assigned to this student' },
          { status: 409 },
        );
      }

      console.error('Failed to assign tutor to student', assignmentError);
      return NextResponse.json({ error: 'Failed to assign tutor' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      assignmentId: assignment?.id ?? null,
      message: 'Tutor assigned successfully',
    });
  } catch (error) {
    console.error('Unhandled error in admin assign tutor route', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const sessionUser = await getUserSession();
    if (!sessionUser || !canAccessAdminFeatures(sessionUser)) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 401 });
    }

    const params = Object.fromEntries(request.nextUrl.searchParams.entries());
    const parsed = deassignSchema.safeParse(params);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid query parameters', issues: parsed.error.issues },
        { status: 400 },
      );
    }

    const { tutorId, studentId } = parsed.data;
    const updatePayload: AssignmentUpdate = {
      is_active: false,
    };

    const { error: deassignError } = await supabaseAdmin
      .from<AssignmentRow>('tutor_student_assignments')
      .update(updatePayload)
      .eq('tutor_id', tutorId)
      .eq('student_id', studentId);

    if (deassignError) {
      console.error('Failed to deactivate tutor assignment', deassignError);
      return NextResponse.json({ error: 'Failed to deactivate assignment' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Tutor assignment deactivated',
    });
  } catch (error) {
    console.error('Unhandled error in admin deassign tutor route', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}