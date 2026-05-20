import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';
import { mercureThreadTopic, mercureUserTopic, publishMercureUpdate } from '@/lib/mercure';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tutorId = searchParams.get('tutorId');

    if (!tutorId) {
      return NextResponse.json({ error: 'Tutor ID is required' }, { status: 400 });
    }

    // Récupérer les threads via la table des participants
    let participantRows: any[] | null = null;
    let participantsError: any = null;
    try {
      const resp = await (supabaseAdmin as any)
        .from('message_thread_participants')
        .select('thread_id')
        .eq('user_id', tutorId);
      participantRows = resp.data;
      participantsError = resp.error;
    } catch (e: any) {
      participantsError = e;
    }

    const participantsTableMissing = participantsError && (
      participantsError.code === 'PGRST205' ||
      (participantsError.message && String(participantsError.message).toLowerCase().includes('could not find the table'))
    );

    if (participantsError && !participantsTableMissing) {
      logger.error('Error fetching participants:', participantsError);
      return NextResponse.json({ error: 'Failed to fetch message threads' }, { status: 500 });
    }

    const threadIds = (participantRows || []).map((r: any) => r.thread_id);
    const { data: threads, error: threadsError } = participantsTableMissing
      ? await (supabaseAdmin as any)
          .from('message_threads')
          .select('id, subject, created_at, updated_at, is_active')
          .eq('is_active', true)
          .order('updated_at', { ascending: false })
      : await (supabaseAdmin as any)
          .from('message_threads')
          .select('id, subject, created_at, updated_at, is_active')
          .in('id', threadIds)
          .eq('is_active', true)
          .order('updated_at', { ascending: false });

    if (threadsError) {
      logger.error('Error fetching message threads:', threadsError);
      return NextResponse.json({ error: 'Failed to fetch message threads' }, { status: 500 });
    }

    // Pour chaque thread, récupérer le dernier message, unread count, et un nom d'affichage (premier autre participant)
    const threadsWithDetails = await Promise.all(
      (threads || []).map(async (thread: any) => {
        const [{ data: lastMessage }, { count: unreadCount }, participantsReq] = await Promise.all([
          (supabaseAdmin as any)
            .from('messages')
            .select('id, content, sender_id, created_at, is_read')
            .eq('thread_id', thread.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single(),
          (supabaseAdmin as any)
            .from('messages')
            .select('*', { count: 'exact', head: true })
            .eq('thread_id', thread.id)
            .eq('is_read', false)
            .neq('sender_id', tutorId),
          participantsTableMissing
            ? Promise.resolve({ data: null })
            : (supabaseAdmin as any)
                .from('message_thread_participants')
                .select('user_id')
                .eq('thread_id', thread.id)
        ]);

        let studentInfo = null;
        const participants = (participantsReq as any)?.data;
        if (!participantsTableMissing && participants && participants.length > 0) {
          const otherIds = participants
            .map((p: any) => p.user_id)
            .filter((id: string) => id !== tutorId);
          if (otherIds.length > 0) {
            const { data: users } = await (supabaseAdmin as any)
              .from('users')
              .select('id, first_name, last_name, email, avatar_url, role')
              .in('id', otherIds)
              .limit(1);
            studentInfo = users && users[0] ? users[0] : null;
          }
        } else if (participantsTableMissing) {
          // Legacy: derive other user from last non-tutor message sender
          const { data: otherMsg } = await (supabaseAdmin as any)
            .from('messages')
            .select('sender_id')
            .eq('thread_id', thread.id)
            .neq('sender_id', tutorId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          if (otherMsg) {
            const { data: users } = await (supabaseAdmin as any)
              .from('users')
              .select('id, first_name, last_name, email, avatar_url, role')
              .eq('id', (otherMsg as any).sender_id)
              .limit(1);
            studentInfo = users && users[0] ? users[0] : null;
          }
        }

        return {
          id: thread.id,
          subject: thread.subject,
          student: studentInfo,
          lastMessage: lastMessage ? {
            id: lastMessage.id,
            content: (lastMessage as any).content,
            senderId: (lastMessage as any).sender_id,
            createdAt: lastMessage.created_at,
            isRead: lastMessage.is_read
          } : null,
        unreadCount: unreadCount || 0,
        createdAt: thread.created_at,
        updatedAt: thread.updated_at
        };
      })
    );

    return NextResponse.json({ threads: threadsWithDetails, count: threadsWithDetails.length });

  } catch (error) {
    logger.error('Error in tutor messages API:', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tutorId: bodyTutorId, subject, content, participantIds } = body;

    if (!bodyTutorId || !subject || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Construire la liste des participants: inclure le tuteur courant + participants fournis
    const participants: string[] = Array.from(new Set([
      bodyTutorId,
      ...(Array.isArray(participantIds) ? participantIds : [])
    ]));
    if (participants.length < 2) {
      return NextResponse.json({ error: 'At least two participants required' }, { status: 400 });
    }

    // Créer un nouveau thread de messages
    const { data: thread, error: threadError } = await (supabaseAdmin as any)
      .from('message_threads')
      .insert({ subject, is_active: true })
      .select()
      .single();

    if (threadError) {
      logger.error('Error creating message thread:', threadError);
      return NextResponse.json({ error: 'Failed to create message thread' }, { status: 500 });
    }

    // Ajouter les participants
    await (supabaseAdmin as any)
      .from('message_thread_participants')
      .insert(participants.map((pid: string) => ({ thread_id: thread.id, user_id: pid })));

    // Envoyer le message initial
    const { data: message, error: messageError } = await (supabaseAdmin as any)
      .from('messages')
      .insert({ thread_id: thread.id, sender_id: bodyTutorId, content, is_read: false })
      .select()
      .single();

    if (messageError) {
      logger.error('Error creating message:', messageError);
      return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
    }

    // Créer des notifications pour les autres participants
    const notifyUserIds = participants.filter((pid) => pid !== bodyTutorId);
    if (notifyUserIds.length > 0) {
      await (supabaseAdmin as any)
        .from('notifications')
        .insert(
          notifyUserIds.map((uid: string) => ({
            user_id: uid,
            type: 'MESSAGE',
            title: 'Nouveau message',
            message: `Nouveau fil: ${subject}`,
            data: { thread_id: thread.id }
          }))
        );
    }

    await publishMercureUpdate(
      [mercureThreadTopic(thread.id), ...participants.map((pid) => mercureUserTopic(pid))],
      {
        type: 'message',
        action: 'thread-created',
        userId: bodyTutorId,
        threadId: thread.id,
      }
    );

    return NextResponse.json({
      thread,
      message,
      success: true
    });

  } catch (error) {
    logger.error('Error in tutor messages POST API:', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
