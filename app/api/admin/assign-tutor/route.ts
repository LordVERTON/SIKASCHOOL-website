import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { getUserSession } from '@/lib/auth-simple';
import { canAccessAdminFeatures } from '@/lib/admin-permissions';
import { supabaseAdmin } from '@/lib/supabase';
import { sendStudentTutorAssignmentEmail } from '@/lib/registration-emails';
import type { Database } from '@/types/supabase';

// Types supprimés car non utilisés

type UsersRow = Database['public']['Tables']['users']['Row'];
type UserLookup = {
  id: string;
  role: UsersRow['role'];
  first_name: string | null;
  last_name: string | null;
  email: string;
};

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

async function ensureUserExists(id: string, role: UsersRow['role']): Promise<UserLookup | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('id, role, first_name, last_name, email')
    .eq('id', id)
    .eq('role', role)
    .single();

  if (error || !data) {
    return null;
  }

  return data as UserLookup;
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

    // Récupérer les noms complets du tuteur
    const tutorFirstName = (tutor as any).first_name || '';
    const tutorLastName = (tutor as any).last_name || '';
    const tutorName = [tutorFirstName, tutorLastName].filter(Boolean).join(' ') || 'votre tuteur';

    const insertPayload = {
      tutor_id: tutorId,
      student_id: studentId,
      assigned_by: sessionUser.id,
      notes: trimmedNotes,
    };

    const { data: assignment, error: assignmentError } = await (supabaseAdmin as any)
      .from('tutor_student_assignments')
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

    // Créer la notification pour l'étudiant
    const notificationPayload = {
      user_id: studentId,
      type: 'TUTOR_ASSIGNMENT',
      title: 'Nouveau tuteur assigné',
      message: `Un nouveau tuteur vous a été assigné : ${tutorName}. Connectez-vous à votre espace student pour réserver une nouvelle séance.`,
      data: {
        tutor_id: tutorId,
        tutor_name: tutorName,
        assignment_id: assignment?.id ?? null,
        notes: trimmedNotes,
        assigned_by: sessionUser.id,
        assigned_at: new Date().toISOString()
      },
      is_read: false
    };

    const { error: notificationError } = await (supabaseAdmin as any)
      .from('notifications')
      .insert(notificationPayload as any);

    if (notificationError) {
      console.error('❌ Erreur lors de la création de la notification d\'assignation de tuteur:', notificationError);
      // Ne pas faire échouer la requête si la notification échoue, mais logger l'erreur
    }

    void sendStudentTutorAssignmentEmail({
      studentEmail: student.email,
      studentFirstName: (student as any).first_name || '',
      tutorName,
    });

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
    const updatePayload = {
      is_active: false,
    };

    const { error: deassignError } = await (supabaseAdmin as any)
      .from('tutor_student_assignments')
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