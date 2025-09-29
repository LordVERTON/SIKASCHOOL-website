import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserSession } from '@/lib/auth-simple';
import { canAccessAdminFeatures } from '@/lib/admin-permissions';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const user = await getUserSession();
    if (!user || !canAccessAdminFeatures(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { tutorId, studentId, notes } = await request.json();

    if (!tutorId || !studentId) {
      return NextResponse.json({ error: 'tutorId et studentId sont requis' }, { status: 400 });
    }

    // Vérifier que le tuteur existe et a le bon rôle
    const { data: tutor, error: tutorError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role')
      .eq('id', tutorId)
      .single();

    if (tutorError || !tutor) {
      return NextResponse.json({ error: 'Tuteur non trouvé' }, { status: 404 });
    }

    // Vérifier que c'est un tuteur normal ou Daniel Verton spécifiquement
    if (tutor.role !== 'TUTOR' && !(tutor.role === 'ADMIN' && tutor.email === 'daniel.verton@sikaschool.com')) {
      return NextResponse.json({ error: 'Rôle invalide pour ce tuteur' }, { status: 400 });
    }

    // Vérifier que l'étudiant existe et a le bon rôle
    const { data: student, error: studentError } = await supabase
      .from('users')
      .select('id, email, first_name, last_name, role')
      .eq('id', studentId)
      .eq('role', 'STUDENT')
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: 'Étudiant non trouvé ou rôle invalide' }, { status: 404 });
    }

    // Vérifier si l'assignation existe déjà
    const { data: existingAssignment, error: checkError } = await supabase
      .from('tutor_student_assignments')
      .select('id, is_active')
      .eq('tutor_id', tutorId)
      .eq('student_id', studentId)
      .single();

    if (existingAssignment) {
      if (existingAssignment.is_active) {
        return NextResponse.json({ error: 'Cette assignation existe déjà' }, { status: 409 });
      } else {
        // Réactiver l'assignation existante
        const { data: updatedAssignment, error: updateError } = await supabase
          .from('tutor_student_assignments')
          .update({
            is_active: true,
            assigned_by: user.id,
            notes: notes || null,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingAssignment.id)
          .select()
          .single();

        if (updateError) {
          console.error('Erreur lors de la réactivation de l\'assignation:', updateError);
          return NextResponse.json({ error: 'Erreur lors de la réactivation de l\'assignation' }, { status: 500 });
        }

        return NextResponse.json({
          message: 'Assignation réactivée avec succès',
          assignment: updatedAssignment
        });
      }
    }

    // Créer une nouvelle assignation
    const { data: newAssignment, error: insertError } = await supabase
      .from('tutor_student_assignments')
      .insert({
        tutor_id: tutorId,
        student_id: studentId,
        assigned_by: user.id,
        notes: notes || null,
        is_active: true
      })
      .select()
      .single();

    if (insertError) {
      console.error('Erreur lors de la création de l\'assignation:', insertError);
      return NextResponse.json({ error: 'Erreur lors de la création de l\'assignation' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Assignation créée avec succès',
      assignment: newAssignment
    });

  } catch (error) {
    console.error('Erreur dans POST /api/admin/assignments/assign:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
