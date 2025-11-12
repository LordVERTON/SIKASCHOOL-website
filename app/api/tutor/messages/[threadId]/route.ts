import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;
    const { searchParams } = new URL(request.url);
    const tutorId = searchParams.get('tutorId');

    if (!tutorId) {
      return NextResponse.json({ error: 'Tutor ID is required' }, { status: 400 });
    }

    // Récupérer le thread et ses messages
    const { data: thread, error: threadError } = await (supabaseAdmin as any)
      .from('message_threads')
      .select(`
        id,
        subject,
        created_at,
        updated_at,
        is_active
      `)
      .eq('id', threadId)
      .eq('is_active', true)
      .single();

    if (threadError || !thread) {
      return NextResponse.json({ error: 'Thread not found' }, { status: 404 });
    }

    // Récupérer tous les messages du thread
    const { data: messages, error: messagesError } = await (supabaseAdmin as any)
      .from('messages')
      .select(`
        id,
        content,
        sender_id,
        created_at,
        is_read
      `)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      logger.error('Error fetching messages:', messagesError);
      return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
    }

    // Marquer les messages reçus comme lus
    await (supabaseAdmin as any)
      .from('messages')
      .update({ is_read: true })
      .eq('thread_id', threadId)
      .neq('sender_id', tutorId);

    // Récupérer les informations des utilisateurs
    const userIds = [...new Set(messages.map((msg: any) => msg.sender_id))];
    const { data: users, error: usersError } = await (supabaseAdmin as any)
      .from('users')
      .select('id, first_name, last_name, email, avatar_url, role')
      .in('id', userIds);

    if (usersError) {
      logger.error('Error fetching users:', usersError);
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Enrichir les messages avec les informations des utilisateurs
    const enrichedMessages = messages.map((message: any) => {
      const user = users.find((u: any) => u.id === message.sender_id);
      return {
        id: message.id,
        content: message.content,
        senderId: message.sender_id,
        sender: user ? {
          id: user.id,
          name: `${user.first_name} ${user.last_name}`,
          email: user.email,
          avatar: user.avatar_url,
          role: user.role
        } : null,
        createdAt: message.created_at,
        isRead: message.is_read
      };
    });

    return NextResponse.json({
      thread: {
        id: thread.id,
        subject: thread.subject,
        createdAt: thread.created_at,
        updatedAt: thread.updated_at,
        isActive: thread.is_active
      },
      messages: enrichedMessages
    });

  } catch (error) {
    logger.error('Error in tutor thread messages API:', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;
    const body = await request.json();
    const { tutorId, content } = body;

    if (!tutorId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Vérifier que le thread existe
    const { data: thread, error: threadError } = await (supabaseAdmin as any)
      .from('message_threads')
      .select('id, is_active')
      .eq('id', threadId)
      .single();

    if (threadError || !thread || !thread.is_active) {
      return NextResponse.json({ error: 'Thread not found or inactive' }, { status: 404 });
    }

    // Créer le nouveau message
    const { data: message, error: messageError } = await (supabaseAdmin as any)
      .from('messages')
      .insert({
        thread_id: threadId,
        sender_id: tutorId,
        content,
        is_read: false
      })
      .select()
      .single();

    if (messageError) {
      logger.error('Error creating message:', messageError);
      return NextResponse.json({ error: 'Failed to create message' }, { status: 500 });
    }

    // Récupérer tous les participants du thread (sauf l'expéditeur)
    const { data: participants, error: _participantsError } = await supabaseAdmin
      .from('message_thread_participants')
      .select('user_id')
      .eq('thread_id', threadId)
      .neq('user_id', tutorId);

    if (participants && participants.length > 0) {
      // Récupérer les informations du tuteur
      const { data: tutor, error: tutorError } = await supabaseAdmin
        .from('users')
        .select('first_name, last_name')
        .eq('id', tutorId)
        .single();

      const tutorName = tutor && !tutorError 
        ? `${(tutor as any).first_name || ''} ${(tutor as any).last_name || ''}`.trim() || 'votre tuteur'
        : 'votre tuteur';

      // Récupérer le sujet du thread pour le message de notification
      const { data: threadData } = await supabaseAdmin
        .from('message_threads')
        .select('subject')
        .eq('id', threadId)
        .single();

      const threadSubject = (threadData as any)?.subject || 'Nouveau message';

      // Créer des notifications pour tous les participants (étudiants et autres tuteurs)
      const notifications = (participants as any[]).map((p: any) => ({
        user_id: p.user_id,
        type: 'MESSAGE',
        title: 'Nouveau message',
        message: `${tutorName} vous a envoyé un message${threadSubject ? ` : ${threadSubject}` : ''}`,
        data: {
          thread_id: threadId,
          sender_id: tutorId,
          sender_name: tutorName
        }
      }));

      if (notifications.length > 0) {
        await (supabaseAdmin as any)
          .from('notifications')
          .insert(notifications);
      }
    }

    return NextResponse.json({
      message: {
        id: message.id,
        content: message.content,
        senderId: message.sender_id,
        createdAt: message.created_at,
        isRead: message.is_read
      },
      success: true
    });

  } catch (error) {
    logger.error('Error in tutor thread message POST API:', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;
    const body = await request.json();
    const { tutorId, subject } = body;

    if (!tutorId || !subject) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Vérifier participation
    const { data: participant, error: participantError } = await (supabaseAdmin as any)
      .from('message_thread_participants')
      .select('thread_id')
      .eq('thread_id', threadId)
      .eq('user_id', tutorId)
      .single();

    if (participantError || !participant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { data: updated, error: updateError } = await (supabaseAdmin as any)
      .from('message_threads')
      .update({ subject })
      .eq('id', threadId)
      .select('id, subject')
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }

    return NextResponse.json({ success: true, thread: updated });
  } catch (error) {
    logger.error('Error in tutor thread update API:', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const { threadId } = await params;
    const { searchParams } = new URL(request.url);
    const tutorId = searchParams.get('tutorId');

    if (!tutorId) {
      return NextResponse.json({ error: 'Tutor ID is required' }, { status: 400 });
    }

    // Vérifier participation
    const { data: participant, error: participantError } = await (supabaseAdmin as any)
      .from('message_thread_participants')
      .select('thread_id')
      .eq('thread_id', threadId)
      .eq('user_id', tutorId)
      .single();

    if (participantError || !participant) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { error: deleteError } = await (supabaseAdmin as any)
      .from('message_threads')
      .delete()
      .eq('id', threadId);

    if (deleteError) {
      return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Error in tutor thread delete API:', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}