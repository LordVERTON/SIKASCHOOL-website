import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { canAccessTutorFeatures } from '@/lib/admin-permissions';

export async function GET() {
  try {
    const user = await getUserSession();
    if (!user || !canAccessTutorFeatures(user)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const tutorId = user.id;

    // Récupérer les étudiants attribués à ce tuteur via les assignations
    const { data: assignments, error: assignmentsError } = await supabaseAdmin
      .from('tutor_student_assignments')
      .select(`
        id,
        student_id,
        assigned_at,
        notes,
        users!tutor_student_assignments_student_id_fkey(
          id,
          first_name,
          last_name,
          email,
          avatar_url,
          phone,
          postal_code,
          students!students_user_id_fkey(
            user_id,
            grade_level,
            academic_goals,
            learning_style,
            phone,
            parent_phone,
            parent_email,
            postal_code
          )
        )
      `)
      .eq('tutor_id', tutorId)
      .eq('is_active', true)
      .order('assigned_at', { ascending: false });

    if (assignmentsError) {
      console.error('Erreur lors de la récupération des étudiants attribués:', assignmentsError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des étudiants' }, { status: 500 });
    }

    // Transformer les données pour l'affichage
    const assignedStudents = (assignments as any)?.map((assignment: any) => {
      const student = assignment.users;
      const studentProfile = student.students?.[0] || {};
      let intakeDetails: any = null;
      if (studentProfile.learning_style) {
        try {
          intakeDetails = JSON.parse(studentProfile.learning_style);
        } catch (parseErr) {
          console.warn('Impossible de parser les informations d\'inscription (tuteur):', parseErr);
        }
      }

      const preferredSubject = intakeDetails?.subject || '';
      const goalSummary = intakeDetails?.goalSummary || studentProfile.academic_goals || '';

      return {
        id: student.id,
        name: `${student.first_name} ${student.last_name}`,
        email: student.email,
        avatar_url: student.avatar_url || '/images/user/user-01.png',
        level: studentProfile.grade_level || intakeDetails?.level || 'Débutant',
        bio: '',
        academic_goals: studentProfile.academic_goals || goalSummary || '',
        preferredSubject,
        assignedAt: assignment.assigned_at,
        notes: assignment.notes || '',
        assignmentId: assignment.id,
        intake: intakeDetails,
        phone: studentProfile.phone || student.phone || intakeDetails?.phone || '',
        postalCode: studentProfile.postal_code || student.postal_code || intakeDetails?.zip || '',
      };
    }) || [];

    return NextResponse.json({ 
      students: assignedStudents,
      count: assignedStudents.length 
    });

  } catch (error) {
    console.error('❌ Erreur API élèves tuteur:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}


