import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getUserSession } from '@/lib/auth-simple';
import { canAccessAdminFeatures } from '@/lib/admin-permissions';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserSession();
    if (!user || !canAccessAdminFeatures(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tutorId = searchParams.get('tutorId');
    const studentId = searchParams.get('studentId');
        const _assignmentId = searchParams.get('assignmentId');

    if (!tutorId || !studentId) {
      return NextResponse.json({ error: 'tutorId et studentId sont requis' }, { status: 400 });
    }

    // Désactiver l'assignation
    const { data: updatedAssignment, error: updateError } = await supabase
      .from('tutor_student_assignments')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('tutor_id', tutorId)
      .eq('student_id', studentId)
      .eq('is_active', true)
      .select()
      .single();

    if (updateError) {
      console.error('Erreur lors de la désactivation de l\'assignation:', updateError);
      return NextResponse.json({ error: 'Erreur lors de la désactivation de l\'assignation' }, { status: 500 });
    }

    if (!updatedAssignment) {
      return NextResponse.json({ error: 'Assignation non trouvée' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Assignation supprimée avec succès',
      assignment: updatedAssignment
    });

  } catch (error) {
    console.error('Erreur dans DELETE /api/admin/assignments/unassign:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
