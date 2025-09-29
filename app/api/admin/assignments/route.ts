import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { canAccessAdminFeatures } from '@/lib/admin-permissions';

export async function GET() {
  try {
    // Vérifier l'authentification admin
    const user = await getUserSession();
    if (!user || !canAccessAdminFeatures(user)) {
      return NextResponse.json({ error: 'Non autorisé - Admin requis' }, { status: 401 });
    }

    // Récupérer tous les étudiants
    const { data: students, error: studentsError } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email,
        students(grade_level, academic_goals)
      `)
      .eq('role', 'STUDENT')
      .eq('is_active', true)
      .order('first_name');

    if (studentsError) {
      console.error('Erreur récupération étudiants:', studentsError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des étudiants' }, { status: 500 });
    }

    // Récupérer tous les tuteurs
    const { data: tutors, error: tutorsError } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        email,
        tutors(bio, subjects, experience_years, is_available)
      `)
      .eq('role', 'TUTOR')
      .eq('is_active', true)
      .order('first_name');

    if (tutorsError) {
      console.error('Erreur récupération tuteurs:', tutorsError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des tuteurs' }, { status: 500 });
    }

    // Récupérer les attributions existantes
    const { data: assignments, error: assignmentsError } = await supabaseAdmin
      .from('tutor_student_assignments')
      .select(`
        id,
        tutor_id,
        student_id,
        assigned_at,
        notes,
        is_active,
        users!tutor_student_assignments_tutor_id_fkey(first_name, last_name),
        users!tutor_student_assignments_student_id_fkey(first_name, last_name)
      `)
      .eq('is_active', true)
      .order('assigned_at', { ascending: false });

    if (assignmentsError) {
      console.error('Erreur récupération attributions:', assignmentsError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des attributions' }, { status: 500 });
    }

    return NextResponse.json({
      students: (students as any)?.map((s: any) => ({
        id: s.id,
        name: `${s.first_name} ${s.last_name}`,
        email: s.email,
        gradeLevel: s.students?.[0]?.grade_level || 'Non spécifié',
        academicGoals: s.students?.[0]?.academic_goals || ''
      })) || [],
      tutors: (tutors as any)?.map((t: any) => ({
        id: t.id,
        name: `${t.first_name} ${t.last_name}`,
        email: t.email,
        bio: t.tutors?.[0]?.bio || '',
        subjects: t.tutors?.[0]?.subjects || [],
        experience: t.tutors?.[0]?.experience_years || 0,
        isAvailable: t.tutors?.[0]?.is_available || false
      })) || [],
      assignments: (assignments as any)?.map((a: any) => ({
        id: a.id,
        tutorId: a.tutor_id,
        studentId: a.student_id,
        tutorName: `${a.users?.first_name || ''} ${a.users?.last_name || ''}`.trim(),
        studentName: `${a.users?.first_name || ''} ${a.users?.last_name || ''}`.trim(),
        assignedAt: a.assigned_at,
        notes: a.notes || '',
        isActive: a.is_active
      })) || []
    });

  } catch (error) {
    console.error('Erreur API assignments:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
