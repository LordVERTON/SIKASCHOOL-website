import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { canAccessAdminFeatures } from '@/lib/admin-permissions';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    // Vérifier l'authentification et les permissions admin
    const user = await getUserSession();
    if (!user || !canAccessAdminFeatures(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await params;
    const { student_id, tutor_id, subject, level, type, status, duration_minutes, student_rating } = await request.json();

    // Vérifier que la session existe
    const { data: existingSession, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .select('id')
      .eq('id', sessionId)
      .single();

    if (sessionError || !existingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Vérifier que l'étudiant et le tuteur existent
    const { data: student, error: studentError } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('id', student_id)
      .eq('role', 'STUDENT')
      .single();

    if (studentError || !student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 400 });
    }

    const { data: tutor, error: tutorError } = await supabaseAdmin
      .from('users')
      .select('id, role')
      .eq('id', tutor_id)
      .eq('role', 'TUTOR')
      .single();

    if (tutorError || !tutor) {
      return NextResponse.json({ error: 'Tutor not found' }, { status: 400 });
    }

    // Mettre à jour la session
    const updateData = {
      student_id,
      tutor_id,
      subject,
      level,
      type,
      status,
      duration_minutes,
      student_rating,
      updated_at: new Date().toISOString()
    } as any;

    // Récupérer les informations de la session avant la mise à jour pour comparer
    const { data: oldSession } = await supabaseAdmin
      .from('sessions')
      .select('student_id, tutor_id, subject, started_at, status')
      .eq('id', sessionId)
      .single();

    const { data: updatedSession, error: updateError } = await (supabaseAdmin as any)
      .from('sessions')
      .update(updateData)
      .eq('id', sessionId)
      .select()
      .single();

    if (updateError) {
      console.error('Erreur lors de la mise à jour de la session:', updateError);
      return NextResponse.json({ error: 'Failed to update session' }, { status: 500 });
    }

    // Créer une notification pour l'étudiant si la session a été modifiée
    if (oldSession && updatedSession) {
      const oldSessionData = oldSession as any;
      const newSessionData = updatedSession as any;
      
      // Vérifier si des champs importants ont changé
      const hasChanged = 
        oldSessionData.started_at !== newSessionData.started_at ||
        oldSessionData.subject !== newSessionData.subject ||
        oldSessionData.status !== newSessionData.status ||
        oldSessionData.duration_minutes !== newSessionData.duration_minutes;

      if (hasChanged && newSessionData.student_id) {
        // Récupérer les informations du tuteur pour le message
        const { data: tutorInfo } = await supabaseAdmin
          .from('users')
          .select('first_name, last_name')
          .eq('id', newSessionData.tutor_id || oldSessionData.tutor_id)
          .single();

        const tutorName = tutorInfo 
          ? `${(tutorInfo as any).first_name || ''} ${(tutorInfo as any).last_name || ''}`.trim() || 'votre tuteur'
          : 'votre tuteur';

        const changes: string[] = [];
        if (oldSessionData.started_at !== newSessionData.started_at) {
          changes.push('date/heure');
        }
        if (oldSessionData.subject !== newSessionData.subject) {
          changes.push('matière');
        }
        if (oldSessionData.status !== newSessionData.status) {
          changes.push('statut');
        }
        if (oldSessionData.duration_minutes !== newSessionData.duration_minutes) {
          changes.push('durée');
        }

        const changesText = changes.length > 0 ? changes.join(', ') : 'informations';

        await (supabaseAdmin as any)
          .from('notifications')
          .insert({
            user_id: newSessionData.student_id,
            type: 'BOOKING',
            title: 'Séance modifiée',
            message: `${tutorName} a modifié la ${changesText} de votre séance${newSessionData.subject ? ` de ${newSessionData.subject}` : ''}.`,
            data: {
              session_id: sessionId,
              action: 'SESSION_UPDATED',
              changes: changes,
              updated_at: new Date().toISOString()
            }
          });
      }
    }

    return NextResponse.json({ 
      session: updatedSession,
      message: 'Session updated successfully' 
    });
  } catch (error) {
    console.error('Erreur dans /api/admin/sessions/[sessionId] PUT:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    // Vérifier l'authentification et les permissions admin
    const user = await getUserSession();
    if (!user || !canAccessAdminFeatures(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = await params;

    // Vérifier que la session existe
    const { data: existingSession, error: sessionError } = await supabaseAdmin
      .from('sessions')
      .select('id, status')
      .eq('id', sessionId)
      .single();

    if (sessionError || !existingSession) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Supprimer la session (cascade supprimera les paiements liés)
    const { error: deleteError } = await supabaseAdmin
      .from('sessions')
      .delete()
      .eq('id', sessionId);

    if (deleteError) {
      console.error('Erreur lors de la suppression de la session:', deleteError);
      return NextResponse.json({ error: 'Failed to delete session' }, { status: 500 });
    }

    return NextResponse.json({ 
      message: 'Session deleted successfully' 
    });
  } catch (error) {
    console.error('Erreur dans /api/admin/sessions/[sessionId] DELETE:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
