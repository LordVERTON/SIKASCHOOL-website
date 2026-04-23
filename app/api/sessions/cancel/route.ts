import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import {
  sendStudentSessionCancelledEmail,
  sendTutorSessionCancelledEmail,
} from '@/lib/registration-emails';

type SessionRow = {
  id: string;
  student_id: string;
  tutor_id: string;
  subject: string | null;
  started_at: string;
  status: string;
};

type UserRow = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
};

export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserSession();
    if (!user) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, reason } = body as { sessionId?: string; reason?: string };
    
    if (!sessionId) {
      return NextResponse.json({ error: 'ID de séance requis' }, { status: 400 });
    }

    const cancellationReason = typeof reason === 'string' && reason.trim() ? reason.trim() : null;

    // Vérifier que l'utilisateur a le droit d'annuler cette session
    const { data: session, error: sessionError } = await (supabaseAdmin as any)
      .from('sessions')
      .select('id, student_id, tutor_id, subject, started_at, status')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Séance introuvable' }, { status: 404 });
    }
    const currentSession = session as SessionRow;

    // Vérifier que l'utilisateur est soit l'étudiant, soit le tuteur de cette session
    if (user.id !== currentSession.student_id && user.id !== currentSession.tutor_id) {
      return NextResponse.json({ error: 'Vous ne pouvez annuler que vos propres séances' }, { status: 403 });
    }

    // Vérifier que la session peut être annulée
    if (currentSession.status === 'CANCELLED') {
      return NextResponse.json({ error: 'La séance est déjà annulée' }, { status: 400 });
    }

    if (currentSession.status === 'COMPLETED') {
      return NextResponse.json({ error: 'Impossible d’annuler une séance terminée' }, { status: 400 });
    }

    // Vérifier la restriction des 24h
    const sessionStartTime = new Date(currentSession.started_at);
    const now = new Date();
    const timeDifference = sessionStartTime.getTime() - now.getTime();
    const hoursUntilSession = timeDifference / (1000 * 60 * 60);

    if (hoursUntilSession < 24) {
      return NextResponse.json({ 
        error: 'Impossible d’annuler une séance moins de 24 heures avant son début',
        hoursUntilSession: Math.round(hoursUntilSession * 10) / 10
      }, { status: 400 });
    }

    // Mettre à jour le statut de la session
    const { error: updateError } = await (supabaseAdmin as any)
      .from('sessions')
      .update({ 
        status: 'CANCELLED',
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId);

    if (updateError) {
      console.error('Erreur lors de l’annulation de la séance :', updateError);
      return NextResponse.json({ error: 'Échec de l’annulation de la séance' }, { status: 500 });
    }

    // Récupérer les participants de la session
    const { data: participants, error: participantsError } = await (supabaseAdmin as any)
      .from('session_participants')
      .select('student_id')
      .eq('session_id', sessionId);

    if (participantsError) {
      console.error('Erreur lors de la récupération des participants :', participantsError);
    }

    // Créer la liste des utilisateurs à notifier
    const userIdsToNotify = new Set<string>();
    
    // Ajouter l'étudiant principal
    userIdsToNotify.add(currentSession.student_id);
    
    // Ajouter le tuteur
    userIdsToNotify.add(currentSession.tutor_id);
    
    // Ajouter les participants supplémentaires
    if (participants) {
      participants.forEach((p: any) => userIdsToNotify.add(p.student_id));
    }

    // Récupérer les noms des utilisateurs pour les notifications
    const { data: users, error: usersError } = await (supabaseAdmin as any)
      .from('users')
      .select('id, first_name, last_name, email')
      .in('id', Array.from(userIdsToNotify));

    if (usersError) {
      console.error('Erreur lors de la récupération des utilisateurs :', usersError);
    }

    const usersMap = new Map<string, UserRow>();
    if (users) {
      users.forEach((u: UserRow) => usersMap.set(u.id, u));
    }

    const cancelledBy = usersMap.get(user.id);
    const cancelledByName = cancelledBy ? `${cancelledBy.first_name} ${cancelledBy.last_name}` : 'Un utilisateur';
    const tutorUser = usersMap.get(currentSession.tutor_id);
    const sessionDateLabel = new Date(currentSession.started_at).toLocaleDateString('fr-FR');
    const sessionTimeLabel = new Date(currentSession.started_at).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
    });

    // Créer les notifications pour tous les participants
    const notifications = Array.from(userIdsToNotify)
      .filter(id => id !== user.id) // Ne pas notifier celui qui annule
      .map(userId => ({
        user_id: userId,
        type: 'BOOKING',
        title: 'Séance annulée',
        message: `${cancelledByName} a annulé la séance de ${currentSession.subject || 'Cours'} prévue le ${sessionDateLabel} à ${sessionTimeLabel}${cancellationReason ? `. Raison: ${cancellationReason}` : ''}`,
        data: {
          session_id: sessionId,
          action: 'CANCELLED',
          cancelled_by: user.id,
          reason: cancellationReason
        }
      }));

    if (notifications.length > 0) {
      const { error: notificationError } = await (supabaseAdmin as any)
        .from('notifications')
        .insert(notifications);

      if (notificationError) {
        console.error('Erreur lors de la création des notifications :', notificationError);
        // Ne pas échouer la requête si les notifications échouent
      }
    }

    if (tutorUser?.email && currentSession.tutor_id !== user.id) {
      void sendTutorSessionCancelledEmail({
        tutorEmail: tutorUser.email,
        tutorFirstName: tutorUser.first_name || tutorUser.last_name || '',
        cancelledByName,
        subject: currentSession.subject || 'Cours',
        startedAt: currentSession.started_at,
        reason: cancellationReason,
      });
    }

    // Si le tuteur annule, notifier tous les étudiants participants (principal + additionnels) par e-mail.
    if (user.id === currentSession.tutor_id) {
      const studentRecipientIds = Array.from(userIdsToNotify).filter(
        (id) => id !== currentSession.tutor_id
      );
      const studentParticipantsCount = studentRecipientIds.length;

      for (const studentId of studentRecipientIds) {
        const student = usersMap.get(studentId);
        if (!student?.email) continue;

        void sendStudentSessionCancelledEmail({
          studentEmail: student.email,
          studentFirstName: student.first_name || student.last_name || '',
          tutorName: cancelledByName,
          subject: currentSession.subject || 'Cours',
          startedAt: currentSession.started_at,
          reason: cancellationReason,
          studentParticipantsCount,
        });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Séance annulée avec succès',
      cancelledBy: cancelledByName
    });

  } catch (error) {
    console.error('Erreur API annulation de séance :', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
