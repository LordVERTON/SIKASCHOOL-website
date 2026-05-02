import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserSession();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');

    let query = supabaseAdmin
      .from('tutors')
      .select(`
        user_id,
        bio,
        experience_years,
        subjects,
        hourly_rate_cents,
        is_available,
        rating,
        total_reviews,
        users!inner(
          id,
          first_name,
          last_name,
          avatar_url,
          role
        )
      `)
      .eq('is_available', true)
      .eq('users.role', 'TUTOR')
      .eq('users.is_active', true);

    if (subject) {
      query = query.contains('subjects', [subject]);
    }

    const { data: tutorsData, error: tutorsError } = await query;

    if (tutorsError) {
      console.error('[student/tutors]', tutorsError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des tuteurs' }, { status: 500 });
    }

    if (!tutorsData?.length) {
      return NextResponse.json({ tutors: [] });
    }

    const formattedTutors = tutorsData.map((tutor: any) => ({
      id: tutor.user_id,
      name: `${tutor.users.first_name} ${tutor.users.last_name}`,
      avatar: tutor.users.avatar_url || '/images/team/default.jpg',
      subjects: tutor.subjects || [],
      rating: tutor.rating || 0,
      totalReviews: tutor.total_reviews || 0,
      pricePerHour: tutor.hourly_rate_cents ? tutor.hourly_rate_cents / 100 : 0,
      bio: tutor.bio || 'Tuteur expérimenté',
      experience: tutor.experience_years || 0,
      isAvailable: tutor.is_available || false,
    }));

    return NextResponse.json({ tutors: formattedTutors });
  } catch (e) {
    console.error('[student/tutors]', e);
    return NextResponse.json({ error: 'Failed to fetch tutors' }, { status: 500 });
  }
}
