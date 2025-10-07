import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const user = await getUserSession();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const studentId = user.id;

    // Récupérer les tuteurs assignés à cet étudiant
    const { data: assignments, error: assignmentsError } = await supabaseAdmin
      .from('tutor_student_assignments')
      .select(`
        id,
        tutor_id,
        assigned_at,
        is_active,
        tutors:tutor_id (
          id,
          first_name,
          last_name,
          email,
          avatar_url
        )
      `)
      .eq('student_id', studentId)
      .eq('is_active', true)
      .order('assigned_at', { ascending: false });

    if (assignmentsError) {
      console.error('Erreur lors de la récupération des tuteurs assignés:', assignmentsError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des tuteurs' }, { status: 500 });
    }

    const tutors = (assignments || []).map((assignment: any) => {
      const tutor = assignment.tutors;
      return {
        id: tutor.id,
        name: `${tutor.first_name} ${tutor.last_name}`,
        firstName: tutor.first_name,
        lastName: tutor.last_name,
        email: tutor.email,
        avatar: tutor.avatar_url || '/images/user/user-01.png',
        assignedAt: assignment.assigned_at,
        isActive: assignment.is_active
      };
    });

    return NextResponse.json({ tutors });

  } catch (error) {
    console.error('❌ Erreur API tuteurs assignés:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}