import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { canAccessStudentFeatures, getEffectiveStudentAccess } from '@/lib/student-access';

export async function GET() {
  try {
    const user = await getUserSession();
    if (!canAccessStudentFeatures(user)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const access = await getEffectiveStudentAccess(user);
    if (!access) {
      return NextResponse.json({ error: 'Aucun élève lié à ce compte parent' }, { status: 404 });
    }

    const studentId = access.effectiveStudentId;

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

    const tutorIds = (assignments || [])
      .map((assignment: any) => assignment.tutor_id)
      .filter(Boolean);

    let tutorProfilesByUserId = new Map<string, any>();
    if (tutorIds.length > 0) {
      const { data: tutorProfiles, error: tutorProfilesError } = await (supabaseAdmin as any)
        .from('tutors')
        .select('user_id, bio, subjects, experience_years, hourly_rate_cents, is_available, rating, total_reviews')
        .in('user_id', tutorIds);

      if (tutorProfilesError) {
        console.error('Erreur lors de la récupération des profils tuteurs:', tutorProfilesError);
        return NextResponse.json({ error: 'Erreur lors de la récupération des profils tuteurs' }, { status: 500 });
      }

      tutorProfilesByUserId = new Map((tutorProfiles || []).map((profile: any) => [profile.user_id, profile]));
    }

    const tutors = (assignments || []).map((assignment: any) => {
      const tutor = assignment.tutors;
      const tutorProfile = tutorProfilesByUserId.get(tutor.id) || {};
      return {
        id: tutor.id,
        name: `${tutor.first_name} ${tutor.last_name}`,
        firstName: tutor.first_name,
        lastName: tutor.last_name,
        email: tutor.email,
        avatar: tutor.avatar_url || '/images/user/user-01.png',
        bio: tutorProfile.bio || '',
        subjects: Array.isArray(tutorProfile.subjects) ? tutorProfile.subjects : [],
        experienceYears: Number(tutorProfile.experience_years) || 0,
        pricePerHour: Math.round((Number(tutorProfile.hourly_rate_cents) || 0) / 100),
        rating: Number(tutorProfile.rating) || 0,
        totalReviews: Number(tutorProfile.total_reviews) || 0,
        isAvailable: tutorProfile.is_available ?? true,
        availability: ['Disponible sur demande'],
        totalSessions: 0,
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
