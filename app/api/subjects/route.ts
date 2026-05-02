import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(_request: NextRequest) {
  try {
    const { data: subjects, error } = await supabase
      .from('subjects')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('[subjects]', error);
      throw error;
    }

    if (!subjects?.length) {
      const mockSubjects = [
        { id: '1', name: 'Mathématiques', description: 'Cours de mathématiques', level: 'Collège' },
        { id: '2', name: 'Mathématiques', description: 'Cours de mathématiques', level: 'Lycée' },
        { id: '3', name: 'Mathématiques', description: 'Cours de mathématiques', level: 'Supérieur' },
        { id: '4', name: 'Physique', description: 'Cours de physique-chimie', level: 'Lycée' },
        { id: '5', name: 'Chimie', description: 'Cours de chimie', level: 'Lycée' },
        { id: '6', name: 'Français', description: 'Cours de français et littérature', level: 'Lycée' },
        { id: '7', name: 'Anglais', description: "Cours d'anglais", level: 'Lycée' },
        { id: '8', name: 'Histoire-Géographie', description: "Cours d'histoire et géographie", level: 'Lycée' },
        { id: '9', name: 'Philosophie', description: 'Cours de philosophie', level: 'Lycée' },
        { id: '10', name: 'Méthodologie', description: 'Techniques de travail et méthodologie', level: 'Tous niveaux' },
        { id: '11', name: 'Droits', description: 'Cours de droit', level: 'Supérieur' },
        { id: '12', name: 'Mécanique', description: 'Cours de mécanique', level: 'Supérieur' },
        { id: '13', name: 'Mécanique des fluides', description: 'Cours de mécanique des fluides', level: 'Supérieur' },
        { id: '14', name: 'Informatique', description: "Cours d'informatique et programmation", level: 'Supérieur' },
        {
          id: '15',
          name: "Sciences de l'ingénieur",
          description: "Cours de sciences de l'ingénieur",
          level: 'Supérieur',
        },
      ];
      return NextResponse.json(mockSubjects);
    }

    return NextResponse.json(subjects);
  } catch (error) {
    console.error('[subjects]', error);
    return NextResponse.json(
      { error: 'Erreur lors de la récupération des matières' },
      { status: 500 },
    );
  }
}
