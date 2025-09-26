import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification
    const user = await getUserSession();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const subject = searchParams.get('subject');
    const level = searchParams.get('level');

    // Construire la requête de base
    let query = supabase
      .from('users')
      .select(`
        id,
        first_name,
        last_name,
        avatar_url,
        tutor_profiles!inner (
          bio,
          specializations,
          experience_years,
          hourly_rate,
          rating,
          total_reviews
        )
      `)
      .eq('role', 'TUTOR')
      .eq('is_active', true);

    // Filtrer par matière si spécifiée
    if (subject) {
      query = query.contains('tutor_profiles.specializations', [subject]);
    }

    const { error } = await query;

    if (error) throw error;

    // Récupérer les tuteurs depuis Supabase
    
    const { data: tutorsData, error: tutorsError } = await supabase
      .from('tutors')
      .select(`
        user_id,
        bio,
        experience_years,
        subjects,
        avatar_url,
        is_available,
        total_sessions,
        users!inner(
          id,
          first_name,
          last_name
        )
      `)
      .eq('is_available', true);

    let formattedTutors = [];

    if (tutorsError || !tutorsData || tutorsData.length === 0) {
      // Données mock de fallback
      formattedTutors = [
        {
          id: '1',
          name: 'Alix Tarrade',
          avatar: '/images/team/alix.jpg',
          subjects: ['Français', 'Méthodologie', 'Droits'],
          rating: 0,
          totalReviews: 0,
          pricePerHour: 0,
          bio: 'Spécialiste en français et méthodologie, diplômée en lettres modernes et en droit. Approche pédagogique adaptée du collège au supérieur.',
          experience: 7,
          isAvailable: true
        },
        {
          id: '2',
          name: 'Nolwen Verton',
          avatar: '/images/team/nolwen.jpg',
          subjects: ['Mathématiques', 'Mécanique'],
          rating: 0,
          totalReviews: 0,
          pricePerHour: 0,
          bio: 'Ingénieur de formation, passionnée par les mathématiques et la mécanique. Expertise solide dans les sciences exactes avec approche pratique.',
          experience: 5,
          isAvailable: true
        },
        {
          id: '3',
          name: 'Ruudy Mbouza-Bayonne',
          avatar: '/images/team/ruudy.jpg',
          subjects: ['Mécanique des fluides', 'Physique', 'Mathématiques'],
          rating: 0,
          totalReviews: 0,
          pricePerHour: 0,
          bio: 'Expert en mécanique des fluides et physique, docteur en physique. Expérience internationale et pédagogie exceptionnelle.',
          experience: 12,
          isAvailable: true
        },
        {
          id: '4',
          name: 'Daniel Verton',
          avatar: '/images/team/daniel.jpg',
          subjects: ['Mathématiques', 'Physique', 'Informatique', 'Sciences de l\'ingénieur'],
          rating: 0,
          totalReviews: 0,
          pricePerHour: 0,
          bio: 'Polyvalent et expérimenté, ingénieur diplômé en informatique. Méthode pédagogique structurée et approche pratique.',
          experience: 10,
          isAvailable: true
        },
        {
          id: '5',
          name: 'Walid Lakas',
          avatar: '/images/team/walid.jpg',
          subjects: ['Mathématiques', 'Informatique', 'Physique'],
          rating: 0,
          totalReviews: 0,
          pricePerHour: 0,
          bio: 'Spécialiste en mathématiques et informatique, diplômé en informatique et mathématiques appliquées. Approche méthodique et progressive.',
          experience: 8,
          isAvailable: true
        }
      ];
    } else {
      console.log(`✅ ${tutorsData.length} tuteurs trouvés dans Supabase`);
      // Transformer les données Supabase
      formattedTutors = tutorsData.map((tutor: any) => ({
        id: tutor.user_id,
        name: `${tutor.users.first_name} ${tutor.users.last_name}`,
        avatar: tutor.avatar_url || '/images/team/default.jpg',
        subjects: tutor.subjects || [],
        rating: 0,
        totalReviews: 0,
        pricePerHour: 0,
        bio: tutor.bio || 'Tuteur expérimenté',
        experience: tutor.experience_years || 0,
        isAvailable: tutor.is_available || false
      }));
    }

    // Filtrer par niveau si spécifié
    const filteredTutors = level 
      ? formattedTutors.filter(tutor => 
          tutor.subjects.some(() => 
            // Logique de filtrage par niveau selon les matières
            true // Pour l'instant, on accepte tous les tuteurs
          )
        )
      : formattedTutors;

    return NextResponse.json({ tutors: filteredTutors });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch tutors' },
      { status: 500 }
    );
  }
}
