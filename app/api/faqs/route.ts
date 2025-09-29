import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(_request: NextRequest) {
  try {
    console.warn('🔍 Récupération des FAQ depuis Supabase...');

    const { data: faqs, error } = await supabase
      .from('faqs')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('❌ Erreur Supabase:', error);
      throw error;
    }

    console.warn(`✅ ${faqs?.length || 0} FAQ trouvées`);

    // Si aucune FAQ trouvée, retourner les données mock
    if (!faqs || faqs.length === 0) {
      console.warn('⚠️  Aucune FAQ trouvée, utilisation des données mock');
      const mockFAQs = [
        {
          id: 1,
          quest: 'Comment fonctionne le système de réservation ?',
          ans: 'Vous pouvez réserver une séance en choisissant votre tuteur, la matière, le niveau et l\'horaire qui vous convient. Le paiement se fait en ligne de manière sécurisée.'
        },
        {
          id: 2,
          quest: 'Puis-je annuler une séance ?',
          ans: 'Oui, vous pouvez annuler une séance jusqu\'à 24h avant le début. Au-delà, des frais d\'annulation peuvent s\'appliquer.'
        },
        {
          id: 3,
          quest: 'Comment sont sélectionnés les tuteurs ?',
          ans: 'Tous nos tuteurs sont diplômés et expérimentés. Ils passent un processus de sélection rigoureux incluant des tests de compétences et des entretiens.'
        }
      ];
      return NextResponse.json(mockFAQs);
    }

    // Transformer les données Supabase en format attendu
    const formattedFAQs = faqs.map((faq: any, index: number) => ({
      id: index + 1,
      quest: faq.question,
      ans: faq.answer
    }));

    return NextResponse.json(formattedFAQs);
  } catch (error) {
    console.warn('❌ Erreur lors de la récupération des FAQ:', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des FAQ' },
      { status: 500 }
    );
  }
}
