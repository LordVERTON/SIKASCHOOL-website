import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseUnreachableError, supabaseAdmin } from '@/lib/supabase';

const MOCK_FAQS = [
  {
    id: 1,
    quest: 'Comment fonctionne le système de réservation ?',
    ans: "Vous pouvez réserver une séance en choisissant votre tuteur, la matière, le niveau et l'horaire qui vous convient. Le paiement se fait en ligne de manière sécurisée.",
  },
  {
    id: 2,
    quest: 'Puis-je annuler une séance ?',
    ans: "Oui, vous pouvez annuler une séance jusqu'à 24h avant le début. Au-delà, des frais d'annulation peuvent s'appliquer.",
  },
  {
    id: 3,
    quest: 'Comment sont sélectionnés les tuteurs ?',
    ans: 'Tous nos tuteurs sont diplômés et expérimentés. Ils passent un processus de sélection rigoureux incluant des tests de compétences et des entretiens.',
  },
];

export async function GET(_request: NextRequest) {
  try {
    const { data: faqs, error } = await supabaseAdmin
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      if (isSupabaseUnreachableError(error)) {
        if (process.env.NODE_ENV === 'development') {
          console.warn('[faqs] Supabase injoignable — mocks. Commande : npx supabase start');
        }
        return NextResponse.json(MOCK_FAQS);
      }
      console.error('[faqs]', error);
      throw error;
    }

    if (!faqs?.length) {
      return NextResponse.json(MOCK_FAQS);
    }

    const formattedFAQs = faqs.map((faq: any, index: number) => ({
      id: index + 1,
      quest: faq.question,
      ans: faq.answer,
    }));

    return NextResponse.json(formattedFAQs);
  } catch (error) {
    if (isSupabaseUnreachableError(error)) {
      if (process.env.NODE_ENV === 'development') {
        console.warn('[faqs] Supabase injoignable — mocks. Commande : npx supabase start');
      }
      return NextResponse.json(MOCK_FAQS);
    }
    console.error('[faqs]', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des FAQ' },
      { status: 500 },
    );
  }
}
