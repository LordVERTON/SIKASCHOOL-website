import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { hasAdminPermissions } from '@/lib/admin-permissions';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
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

    const { userId } = await params;
    const profileData = await request.json();

    // Vérifier que l'utilisateur existe
    const { data: existingUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('id', userId)
      .single();

    if (userError || !existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let result;

    if ((existingUser as any).role === 'TUTOR') {
      // Mettre à jour le profil tuteur
      const updateData = {
        bio: profileData.bio,
        experience_years: profileData.experience_years,
        subjects: profileData.subjects,
        is_available: profileData.is_available,
        updated_at: new Date().toISOString()
      } as any;

      const { data: updatedProfile, error: updateError } = await (supabaseAdmin as any)
        .from('tutors')
        .update(updateData)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('Erreur lors de la mise à jour du profil tuteur:', updateError);
        return NextResponse.json({ error: 'Failed to update tutor profile' }, { status: 500 });
      }

      result = updatedProfile;
    } else if ((existingUser as any).role === 'STUDENT') {
      // Mettre à jour le profil étudiant
      const studentUpdateData = {
        grade_level: profileData.grade_level,
        academic_goals: profileData.academic_goals,
        updated_at: new Date().toISOString()
      } as any;

      const { data: updatedProfile, error: updateError } = await (supabaseAdmin as any)
        .from('students')
        .update(studentUpdateData)
        .eq('user_id', userId)
        .select()
        .single();

      if (updateError) {
        console.error('Erreur lors de la mise à jour du profil étudiant:', updateError);
        return NextResponse.json({ error: 'Failed to update student profile' }, { status: 500 });
      }

      result = updatedProfile;
    } else {
      return NextResponse.json({ error: 'Invalid user role for profile update' }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Profile updated successfully',
      profile: result
    });

  } catch (error) {
    console.error('Erreur dans /api/admin/users/[userId]/profile PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
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

    const { userId } = await params;
    const profileData = await request.json();

    // Vérifier que l'utilisateur existe
    const { data: existingUser, error: userError } = await supabaseAdmin
      .from('users')
      .select('id, role, first_name, last_name, email')
      .eq('id', userId)
      .single();

    if (userError || !existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let result;

    if ((existingUser as any).role === 'TUTOR') {
      // Créer le profil tuteur
      const tutorProfile = {
        user_id: userId,
        bio: profileData.bio || `Tuteur expérimenté - ${(existingUser as any).first_name} ${(existingUser as any).last_name}`,
        experience_years: profileData.experience_years || 2,
        subjects: profileData.subjects || ['Mathématiques'],
        is_available: profileData.is_available ?? true
      };

      const { data: createdProfile, error: createError } = await (supabaseAdmin as any)
        .from('tutors')
        .insert(tutorProfile as any)
        .select()
        .single();

      if (createError) {
        console.error('Erreur lors de la création du profil tuteur:', createError);
        return NextResponse.json({ error: 'Failed to create tutor profile' }, { status: 500 });
      }

      result = createdProfile;
    } else if ((existingUser as any).role === 'STUDENT') {
      // Créer le profil étudiant
      const studentProfile = {
        user_id: userId,
        grade_level: profileData.grade_level || 'Terminale',
        academic_goals: profileData.academic_goals || 'Réussir ses études'
      };

      const { data: createdProfile, error: createError } = await (supabaseAdmin as any)
        .from('students')
        .insert(studentProfile as any)
        .select()
        .single();

      if (createError) {
        console.error('Erreur lors de la création du profil étudiant:', createError);
        return NextResponse.json({ error: 'Failed to create student profile' }, { status: 500 });
      }

      result = createdProfile;
    } else {
      return NextResponse.json({ error: 'Invalid user role for profile creation' }, { status: 400 });
    }

    return NextResponse.json({
      message: 'Profile created successfully',
      profile: result
    });

  } catch (error) {
    console.error('Erreur dans /api/admin/users/[userId]/profile POST:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
