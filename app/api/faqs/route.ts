import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(_request: NextRequest) {
  try {
    const { data: faqs, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('[faqs]', error);
      throw error;
    }

    if (!faqs?.length) {
      const mockFAQs = [
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
      return NextResponse.json(mockFAQs);
    }

    const formattedFAQs = faqs.map((faq: any, index: number) => ({
      id: index + 1,
      quest: faq.question,
      ans: faq.answer,
    }));

    return NextResponse.json(formattedFAQs);
  } catch (error) {
    console.error('[faqs]', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des FAQ' },
      { status: 500 },
    );
  }
}
