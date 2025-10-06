import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';

export async function PATCH(request: NextRequest) {
  try {
    const user = await getUserSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, reason } = body as { sessionId?: string; reason?: string };
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }

    // Vérifier que l'utilisateur a le droit d'annuler cette session
    const { data: session, error: sessionError } = await (supabaseAdmin as any)
      .from('sessions')
      .select('id, student_id, tutor_id, subject, started_at, status')
      .eq('id', sessionId)
      .single();

    if (sessionError || !session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Vérifier que l'utilisateur est soit l'étudiant, soit le tuteur de cette session
    if (user.id !== (session as any).student_id && user.id !== (session as any).tutor_id) {
      return NextResponse.json({ error: 'You can only cancel your own sessions' }, { status: 403 });
    }

    // Vérifier que la session peut être annulée
    if ((session as any).status === 'CANCELLED') {
      return NextResponse.json({ error: 'Session is already cancelled' }, { status: 400 });
    }

    if ((session as any).status === 'COMPLETED') {
      return NextResponse.json({ error: 'Cannot cancel a completed session' }, { status: 400 });
    }

    // Vérifier la restriction des 24h
    const sessionStartTime = new Date((session as any).started_at);
    const now = new Date();
    const timeDifference = sessionStartTime.getTime() - now.getTime();
    const hoursUntilSession = timeDifference / (1000 * 60 * 60);

    if (hoursUntilSession < 24) {
      return NextResponse.json({ 
        error: 'Cannot cancel session less than 24 hours before start time',
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
      console.error('Error cancelling session:', updateError);
      return NextResponse.json({ error: 'Failed to cancel session' }, { status: 500 });
    }

    // Récupérer les participants de la session
    const { data: participants, error: participantsError } = await (supabaseAdmin as any)
      .from('session_participants')
      .select('student_id')
      .eq('session_id', sessionId);

    if (participantsError) {
      console.error('Error fetching participants:', participantsError);
    }

    // Créer la liste des utilisateurs à notifier
    const userIdsToNotify = new Set<string>();
    
    // Ajouter l'étudiant principal
    userIdsToNotify.add((session as any).student_id);
    
    // Ajouter le tuteur
    userIdsToNotify.add((session as any).tutor_id);
    
    // Ajouter les participants supplémentaires
    if (participants) {
      participants.forEach((p: any) => userIdsToNotify.add(p.student_id));
    }

    // Récupérer les noms des utilisateurs pour les notifications
    const { data: users, error: usersError } = await (supabaseAdmin as any)
      .from('users')
      .select('id, first_name, last_name')
      .in('id', Array.from(userIdsToNotify));

    if (usersError) {
      console.error('Error fetching users:', usersError);
    }

    const usersMap = new Map();
    if (users) {
      users.forEach((u: any) => usersMap.set(u.id, u));
    }

    const cancelledBy = usersMap.get(user.id);
    const cancelledByName = cancelledBy ? `${cancelledBy.first_name} ${cancelledBy.last_name}` : 'Un utilisateur';

    // Créer les notifications pour tous les participants
    const notifications = Array.from(userIdsToNotify)
      .filter(id => id !== user.id) // Ne pas notifier celui qui annule
      .map(userId => ({
        user_id: userId,
        type: 'BOOKING',
        title: 'Séance annulée',
        message: `${cancelledByName} a annulé la séance de ${(session as any).subject} prévue le ${new Date((session as any).started_at).toLocaleDateString('fr-FR')} à ${new Date((session as any).started_at).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}${reason ? `. Raison: ${reason}` : ''}`,
        data: {
          session_id: sessionId,
          action: 'CANCELLED',
          cancelled_by: user.id,
          reason: reason || null
        }
      }));

    if (notifications.length > 0) {
      const { error: notificationError } = await (supabaseAdmin as any)
        .from('notifications')
        .insert(notifications);

      if (notificationError) {
        console.error('Error creating notifications:', notificationError);
        // Ne pas échouer la requête si les notifications échouent
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Session cancelled successfully',
      cancelledBy: cancelledByName
    });

  } catch (error) {
    console.error('Session cancellation endpoint error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
