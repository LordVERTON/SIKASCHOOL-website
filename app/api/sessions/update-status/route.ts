import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { publishUserMercureUpdate } from '@/lib/mercure';

export async function POST(_request: NextRequest) {
  try {
    const now = new Date();
    
    // Récupérer toutes les sessions qui devraient être en cours
    const { data: sessionsToUpdate, error: fetchError } = await (supabaseAdmin as any)
      .from('sessions')
      .select('id, student_id, tutor_id, started_at, duration_minutes, status')
      .in('status', ['SCHEDULED', 'PENDING'])
      .lte('started_at', now.toISOString());

    if (fetchError) {
      console.error('Error fetching sessions:', fetchError);
      return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
    }

    if (!sessionsToUpdate || sessionsToUpdate.length === 0) {
      return NextResponse.json({ message: 'No sessions to update', updated: 0 });
    }

    // Filtrer les sessions qui sont vraiment en cours (dans la plage de temps)
    const sessionsInProgress = sessionsToUpdate.filter((session: any) => {
      const startTime = new Date(session.started_at);
      const endTime = new Date(startTime.getTime() + (session.duration_minutes || 60) * 60000);
      return now >= startTime && now <= endTime;
    });

    if (sessionsInProgress.length === 0) {
      return NextResponse.json({ message: 'No sessions currently in progress', updated: 0 });
    }

    // Mettre à jour le statut des sessions en cours
    const sessionIds = sessionsInProgress.map((s: any) => s.id);
    const { error: updateError } = await (supabaseAdmin as any)
      .from('sessions')
      .update({ 
        status: 'IN_PROGRESS',
        updated_at: now.toISOString()
      })
      .in('id', sessionIds);

    if (updateError) {
      console.error('Error updating sessions:', updateError);
      return NextResponse.json({ error: 'Failed to update sessions' }, { status: 500 });
    }

    // Marquer comme terminées les sessions qui sont dépassées
    const { data: allSessions, error: allSessionsError } = await (supabaseAdmin as any)
      .from('sessions')
      .select('id, student_id, tutor_id, started_at, duration_minutes, status')
      .in('status', ['IN_PROGRESS']);

    if (allSessionsError) {
      console.error('Error fetching all sessions:', allSessionsError);
    } else if (allSessions) {
      const sessionsToComplete = allSessions.filter((session: any) => {
        const startTime = new Date(session.started_at);
        const endTime = new Date(startTime.getTime() + (session.duration_minutes || 60) * 60000);
        return now > endTime;
      });

      if (sessionsToComplete.length > 0) {
        const completedSessionIds = sessionsToComplete.map((s: any) => s.id);
        await (supabaseAdmin as any)
          .from('sessions')
          .update({ 
            status: 'COMPLETED',
            completed_at: now.toISOString(),
            updated_at: now.toISOString()
          })
          .in('id', completedSessionIds);
      }
    }

    // Nettoyer les sessions passées qui ne devraient pas être SCHEDULED ou IN_PROGRESS
    const { data: pastSessions, error: pastSessionsError } = await (supabaseAdmin as any)
      .from('sessions')
      .select('id, student_id, tutor_id, started_at, duration_minutes, status')
      .in('status', ['SCHEDULED', 'IN_PROGRESS', 'PENDING'])
      .lt('started_at', now.toISOString());

    if (pastSessionsError) {
      console.error('Error fetching past sessions:', pastSessionsError);
    } else if (pastSessions && pastSessions.length > 0) {
      // Marquer les sessions passées selon le cas: 
      // - Si leur fin est dépassée, COMPLETED
      // - Si leur début est dépassé mais qu'elles n'ont jamais démarré (PENDING/SCHEDULED) et aucune évaluation: CANCELLED
      const toComplete: string[] = [];
      const toCancel: string[] = [];
      for (const s of pastSessions as any[]) {
        const startTime = new Date(s.started_at);
        const endTime = new Date(startTime.getTime() + (s.duration_minutes || 60) * 60000);
        if (now > endTime) {
          toComplete.push(s.id);
        } else if (now > startTime && (s.status === 'PENDING' || s.status === 'SCHEDULED')) {
          toCancel.push(s.id);
        }
      }

      if (toComplete.length > 0) {
        const { error: completeErr } = await (supabaseAdmin as any)
          .from('sessions')
          .update({ status: 'COMPLETED', completed_at: now.toISOString(), updated_at: now.toISOString() })
          .in('id', toComplete);
        if (completeErr) console.error('Error completing past sessions:', completeErr);
      }

      if (toCancel.length > 0) {
        const { error: cancelErr } = await (supabaseAdmin as any)
          .from('sessions')
          .update({ status: 'CANCELLED', updated_at: now.toISOString() })
          .in('id', toCancel);
        if (cancelErr) console.error('Error cancelling past sessions:', cancelErr);
      }
    }

    const realtimeUserIds = new Set<string>();
    for (const session of [
      ...sessionsInProgress,
      ...((allSessions || []) as any[]),
      ...((pastSessions || []) as any[]),
    ]) {
      if (session.student_id) realtimeUserIds.add(session.student_id);
      if (session.tutor_id) realtimeUserIds.add(session.tutor_id);
    }

    if (realtimeUserIds.size > 0) {
      await publishUserMercureUpdate(Array.from(realtimeUserIds), {
        type: 'session',
        action: 'status-updated',
      });
    }

    return NextResponse.json({ 
      message: 'Sessions updated successfully', 
      updated: sessionsInProgress.length,
      sessionsUpdated: sessionsInProgress.map((s: any) => ({
        id: s.id,
        started_at: s.started_at,
        duration_minutes: s.duration_minutes
      }))
    });

  } catch (error) {
    console.error('Session status update error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
