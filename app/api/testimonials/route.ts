import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    console.warn('🔍 Récupération des témoignages depuis Supabase...');

    const { data: testimonials, error } = await supabase
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Erreur Supabase:', error);
      throw error;
    }

    console.warn(`✅ ${testimonials?.length || 0} témoignages trouvés`);

    // Si aucun témoignage trouvé, retourner les données mock
    if (!testimonials || testimonials.length === 0) {
      console.warn('⚠️  Aucun témoignage trouvé, utilisation des données mock');
      const mockTestimonials = [
        {
          id: '1',
          name: 'Marie Dubois',
          role: 'Étudiante en Terminale',
          content: 'Excellent service ! Les tuteurs sont très compétents et l\'approche pédagogique est adaptée à chaque élève.',
          rating: 5,
          avatar: '/images/user/user-01.png'
        },
        {
          id: '2',
          name: 'Jean Martin',
          role: 'Parent d\'élève',
          content: 'Ma fille a fait d\'énormes progrès en mathématiques grâce à SikaSchool. Je recommande vivement !',
          rating: 5,
          avatar: '/images/user/user-02.png'
        },
        {
          id: '3',
          name: 'Sophie Laurent',
          role: 'Étudiante en Première',
          content: 'Les cours sont très bien structurés et les tuteurs sont à l\'écoute. Parfait pour progresser !',
          rating: 5,
          avatar: '/images/user/user-01.png'
        }
      ];
      return NextResponse.json(mockTestimonials);
    }

    // Transformer les données Supabase en format attendu
    const formattedTestimonials = testimonials.map((testimonial: any) => ({
      id: testimonial.id,
      name: testimonial.student_name,
      role: testimonial.student_role,
      content: testimonial.content,
      rating: testimonial.rating,
      avatar: testimonial.avatar_url || '/images/user/user-01.png'
    }));

    return NextResponse.json(formattedTestimonials);
  } catch (error) {
    console.warn('❌ Erreur lors de la récupération des témoignages:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des témoignages' },
      { status: 500 }
    );
  }
}
