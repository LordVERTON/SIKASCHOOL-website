import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { hasAdminPermissions } from '@/lib/admin-permissions';

export async function GET() {
  try {
    // Vérifier l'authentification
    const user = await getUserSession();
    if (!user || user.role !== 'TUTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier les permissions admin
    if (!hasAdminPermissions(user)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Récupérer tous les utilisateurs avec leurs profils
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, role, is_active, created_at')
      .order('created_at', { ascending: false });

    if (usersError) {
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Récupérer les profils tuteurs
    const { data: tutors, error: tutorsError } = await supabaseAdmin
      .from('tutors')
      .select('user_id, bio, experience_years, subjects, is_available');


    // Récupérer les profils étudiants
    const { data: students, error: studentsError } = await supabaseAdmin
      .from('students')
      .select('user_id, grade_level, academic_goals');


    // Créer des maps pour un accès rapide
    const tutorsMap = new Map((tutors as any)?.map((t: any) => [t.user_id, t]) || []);
    const studentsMap = new Map((students as any)?.map((s: any) => [s.user_id, s]) || []);

    // Combiner les données
    const usersWithProfiles = (users as any)?.map((user: any) => {
      const baseUser = {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        is_active: user.is_active,
        created_at: user.created_at
      };

      if (user.role === 'TUTOR') {
        const tutorProfile = tutorsMap.get(user.id);
        return {
          ...baseUser,
          profile: tutorProfile ? {
            bio: (tutorProfile as any).bio,
            experience_years: (tutorProfile as any).experience_years,
            subjects: (tutorProfile as any).subjects,
            is_available: (tutorProfile as any).is_available
          } : null
        };
      } else if (user.role === 'STUDENT') {
        const studentProfile = studentsMap.get(user.id);
        return {
          ...baseUser,
          profile: studentProfile ? {
            grade_level: (studentProfile as any).grade_level,
            academic_goals: (studentProfile as any).academic_goals
          } : null
        };
      }

      return baseUser;
    }) || [];

    return NextResponse.json(usersWithProfiles);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
