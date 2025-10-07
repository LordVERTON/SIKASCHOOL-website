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

    // Récupérer l'étudiant associé au thread pour créer une notification
    // On utilise une approche simple : récupérer le dernier message pour trouver l'étudiant
    const { data: lastMessage, error: lastMessageError } = await (supabaseAdmin as any)
      .from('messages')
      .select('sender_id')
      .eq('thread_id', threadId)
      .neq('sender_id', tutorId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (lastMessage && !lastMessageError) {
      // Créer une notification pour l'étudiant
      await (supabaseAdmin as any)
        .from('notifications')
        .insert({
          user_id: (lastMessage as any).sender_id,
          type: 'MESSAGE',
          title: 'Nouveau message',
          message: `Vous avez reçu un nouveau message de votre tuteur`,
          data: { thread_id: threadId }
        });
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
