import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getUserSession } from '@/lib/auth-simple';
import { canAccessAdminFeatures } from '@/lib/admin-permissions';
import { supabaseAdmin } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type UsersRow = Database['public']['Tables']['users']['Row'];
type AssignmentRow = Database['public']['Tables']['tutor_student_assignments']['Row'];

type TutorAssignmentRow = AssignmentRow & {
  students: Pick<UsersRow, 'id' | 'email' | 'first_name' | 'last_name'> | null;
};

type StudentAssignmentRow = AssignmentRow & {
  tutors: Pick<UsersRow, 'id' | 'email' | 'first_name' | 'last_name'> | null;
};

const paramsSchema = z
  .object({
    userId: z.string().uuid('Invalid userId'),
  })
  .strict();

const userFields = 'id, email, first_name, last_name, role';

const tutorAssignmentSelect = `
  id,
  student_id,
  assigned_at,
  is_active,
  notes,
  tutor_id,
  assigned_by,
  created_at,
  updated_at,
  students:student_id (
    id,
    email,
    first_name,
    last_name
  )
`;

const studentAssignmentSelect = `
  id,
  tutor_id,
  assigned_at,
  is_active,
  notes,
  student_id,
  assigned_by,
  created_at,
  updated_at,
  tutors:tutor_id (
    id,
    email,
    first_name,
    last_name
  )
`;

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ userId: string }> },
) {
  try {
    const sessionUser = await getUserSession();
    if (!sessionUser || !canAccessAdminFeatures(sessionUser)) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 401 });
    }

    const params = await context.params;
    const parsedParams = paramsSchema.safeParse(params);
    if (!parsedParams.success) {
      return NextResponse.json(
        { error: 'Invalid user identifier', issues: parsedParams.error.issues },
        { status: 400 },
      );
    }

    const { userId } = parsedParams.data;

    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select(userFields)
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let assignments: TutorAssignmentRow[] | StudentAssignmentRow[] = [];

    if ((userData as any).role === 'TUTOR') {
      const { data: tutorAssignments, error: tutorError } = await supabaseAdmin
        .from('tutor_student_assignments')
        .select(tutorAssignmentSelect)
        .eq('tutor_id', userId)
        .eq('is_active', true)
        .order('assigned_at', { ascending: false });

      if (tutorError) {
        console.error('Failed to fetch tutor assignments', tutorError);
        return NextResponse.json({ error: 'Unable to fetch tutor assignments' }, { status: 500 });
      }

      assignments = tutorAssignments ?? [];
    } else if ((userData as any).role === 'STUDENT') {
      const { data: studentAssignments, error: studentError } = await supabaseAdmin
        .from('tutor_student_assignments')
        .select(studentAssignmentSelect)
        .eq('student_id', userId)
        .eq('is_active', true)
        .order('assigned_at', { ascending: false });

      if (studentError) {
        console.error('Failed to fetch student assignments', studentError);
        return NextResponse.json({ error: 'Unable to fetch student assignments' }, { status: 500 });
      }

      assignments = studentAssignments ?? [];
    }

    return NextResponse.json({
      user: userData,
      assignments,
      count: assignments.length,
    });
  } catch (error) {
    console.error('Unhandled error in admin assignments user route', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}