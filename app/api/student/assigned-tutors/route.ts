import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    // Vérifier l'authentification
    const user = await getUserSession();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const studentId = user.id;

    // Récupérer les tuteurs attribués à cet étudiant
    const { data: assignments, error: assignmentsError } = await supabaseAdmin
      .from('tutor_student_assignments')
      .select(`
        id,
        tutor_id,
        assigned_at,
        notes,
        users!tutor_student_assignments_tutor_id_fkey(
          id,
          first_name,
          last_name,
          email,
          avatar_url,
          tutors(
            user_id,
            bio,
            subjects,
            experience_years,
            is_available
          )
        )
      `)
      .eq('student_id', studentId)
      .eq('is_active', true)
      .order('assigned_at', { ascending: false });

    if (assignmentsError) {
      console.error('Erreur lors de la récupération des tuteurs attribués:', assignmentsError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des tuteurs' }, { status: 500 });
    }

    // Transformer les données pour l'affichage
    const assignedTutors = (assignments as any)?.map((assignment: any) => {
      const tutor = assignment.users;
      const tutorProfile = tutor.tutors?.[0] || {};
      
      return {
        id: tutor.id,
        name: `${tutor.first_name} ${tutor.last_name}`,
        email: tutor.email,
        avatar: tutor.avatar_url || '/images/user/user-01.png',
        bio: tutorProfile.bio || '',
        subjects: tutorProfile.subjects || [],
        experience: tutorProfile.experience_years || 0,
        isAvailable: tutorProfile.is_available || false,
        assignedAt: assignment.assigned_at,
        notes: assignment.notes || '',
        assignmentId: assignment.id
      };
    }) || [];

    return NextResponse.json({ 
      tutors: assignedTutors,
      count: assignedTutors.length 
    });

  } catch (error) {
    console.error('Erreur API assigned-tutors:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
