import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseUnreachableError, supabaseAdmin } from '@/lib/supabase';

const MOCK_TESTIMONIALS = [
  {
    id: '1',
    name: 'Marie Dubois',
    role: "Parent d'élève en Terminale",
    content:
      "Excellent service ! Les tuteurs sont très compétents et l'approche pédagogique est adaptée à chaque élève.",
    rating: 5,
    avatar:
      'https://images.pexels.com/photos/7880373/pexels-photo-7880373.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
  },
  {
    id: '2',
    name: 'Jean Martin',
    role: "Parent d'élève",
    content:
      "Ma fille a fait d'énormes progrès en mathématiques grâce à SikaSchool. Je recommande vivement !",
    rating: 5,
    avatar:
      'https://images.pexels.com/photos/4259709/pexels-photo-4259709.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
  },
  {
    id: '3',
    name: 'Sophie Laurent',
    role: "Parent d'élève en Première",
    content:
      "Les cours sont très bien structurés et les tuteurs sont à l'écoute. Parfait pour progresser !",
    rating: 5,
    avatar:
      'https://images.pexels.com/photos/6482279/pexels-photo-6482279.jpeg?auto=compress&cs=tinysrgb&w=160&h=160&fit=crop',
  },
];

export async function GET(_request: NextRequest) {
  try {
    const { data: testimonials, error } = await supabaseAdmin
      .from('reviews')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (isSupabaseUnreachableError(error)) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[testimonials] Supabase injoignable — mocks. Commande : npx supabase start');
        }
        return NextResponse.json(MOCK_TESTIMONIALS);
      }
      console.error('[testimonials]', error);
      throw error;
    }

    if (!testimonials?.length) {
      return NextResponse.json(MOCK_TESTIMONIALS);
    }

    const formattedTestimonials = testimonials.map((testimonial: any) => ({
      id: testimonial.id,
      name: testimonial.student_name,
      role: testimonial.student_role,
      content: testimonial.content,
      rating: testimonial.rating,
      avatar: testimonial.avatar_url || '/images/user/user-01.png',
    }));

    return NextResponse.json(formattedTestimonials);
  } catch (error) {
    if (isSupabaseUnreachableError(error)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[testimonials] Supabase injoignable — mocks. Commande : npx supabase start');
      }
      return NextResponse.json(MOCK_TESTIMONIALS);
    }
    console.error('[testimonials]', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des témoignages' },
      { status: 500 },
    );
  }
}
