import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { hasAdminPermissions } from '@/lib/admin-permissions';

export async function POST() {
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


    // Récupérer tous les utilisateurs
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, role, is_active')
      .order('created_at', { ascending: false });

    if (usersError) {
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    const tutors = (users as any)?.filter((u: any) => u.role === 'TUTOR') || [];
    const students = (users as any)?.filter((u: any) => u.role === 'STUDENT') || [];

    let createdTutorProfiles = 0;
    let createdStudentProfiles = 0;
    const errors = [];

    // Créer les profils tuteurs manquants
    for (const tutor of tutors) {
      try {
        // Vérifier si le profil existe déjà
        const { data: existingTutor } = await supabaseAdmin
          .from('tutors')
          .select('user_id')
          .eq('user_id', tutor.id)
          .single();

        if (!existingTutor) {
          // Créer le profil tuteur
          const tutorProfile = {
            user_id: tutor.id,
            bio: `Tuteur expérimenté - ${tutor.first_name} ${tutor.last_name}`,
            experience_years: Math.floor(Math.random() * 10) + 2,
            subjects: getTutorSubjects(tutor.email),
            is_available: true
          };

          const { error: insertError } = await supabaseAdmin
            .from('tutors')
            .insert(tutorProfile as any);

          if (insertError) {
            errors.push(`Erreur création profil tuteur ${tutor.first_name}: ${insertError.message}`);
          } else {
            createdTutorProfiles++;
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        errors.push(`Erreur pour tuteur ${tutor.first_name}: ${errorMessage}`);
      }
    }

    // Créer les profils étudiants manquants
    for (const student of students) {
      try {
        // Vérifier si le profil existe déjà
        const { data: existingStudent } = await supabaseAdmin
          .from('students')
          .select('user_id')
          .eq('user_id', student.id)
          .single();

        if (!existingStudent) {
          // Créer le profil étudiant
          const studentProfile = {
            user_id: student.id,
            grade_level: getStudentLevel(student.email),
            academic_goals: `Réussir en ${getStudentLevel(student.email)}`
          };

          const { error: insertError } = await supabaseAdmin
            .from('students')
            .insert(studentProfile as any);

          if (insertError) {
            errors.push(`Erreur création profil étudiant ${student.first_name}: ${insertError.message}`);
          } else {
            createdStudentProfiles++;
          }
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
        errors.push(`Erreur pour étudiant ${student.first_name}: ${errorMessage}`);
      }
    }


    return NextResponse.json({
      message: 'Synchronisation des profils terminée',
      createdTutorProfiles,
      createdStudentProfiles,
      totalUsers: users?.length || 0,
      tutors: tutors.length,
      students: students.length,
      errors: errors.length > 0 ? errors : null
    });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Fonction pour déterminer les matières d'un tuteur basées sur son email
function getTutorSubjects(email: string): string[] {
  const subjectsMap: Record<string, string[]> = {
    'alix.tarrade@sikaschool.com': ['Français', 'Méthodologie', 'Droits'],
    'nolwen.verton@sikaschool.com': ['Mathématiques', 'Mécanique'],
    'ruudy.mbouza-bayonne@sikaschool.com': ['Mécanique des fluides', 'Physique', 'Mathématiques'],
    'daniel.verton@sikaschool.com': ['Mathématiques', 'Physique', 'Informatique', 'Sciences de l\'ingénieur'],
    'walid.lakas@sikaschool.com': ['Mathématiques', 'Informatique', 'Physique']
  };
  
  return subjectsMap[email] || ['Mathématiques', 'Physique'];
}

// Fonction pour déterminer le niveau d'un étudiant basé sur son email
function getStudentLevel(email: string): string {
  const levelMap: Record<string, string> = {
    'liele.ghoma@sikaschool.com': 'CE2',
    'steve.kenfack@sikaschool.com': 'Supérieur',
    'milly.koula@sikaschool.com': 'Supérieur'
  };
  
  return levelMap[email] || 'Terminale';
}
