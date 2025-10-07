import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { logger } from '@/lib/logger';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const tutorId = searchParams.get('tutorId');

    if (!tutorId) {
      return NextResponse.json({ error: 'Tutor ID is required' }, { status: 400 });
    }

    // Récupérer les threads de messages pour ce tuteur
    const { data: threads, error: threadsError } = await (supabaseAdmin as any)
      .from('message_threads')
      .select(`
        id,
        subject,
        created_at,
        updated_at,
        is_active
      `)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (threadsError) {
      logger.error('Error fetching message threads:', threadsError);
      return NextResponse.json({ error: 'Failed to fetch message threads' }, { status: 500 });
    }

    // Pour chaque thread, récupérer le dernier message et les informations de l'étudiant
    const threadsWithDetails = await Promise.all(
      threads.map(async (thread: any) => {
        // Vérifier que ce thread ne contient que 2 participants (1 tuteur + 1 étudiant)
        const { data: allMessages, error: _allMessagesError } = await (supabaseAdmin as any)
          .from('messages')
          .select('sender_id')
          .eq('thread_id', thread.id);

        if (!allMessages) {
          return null;
        }

        // Récupérer les IDs uniques des expéditeurs
        const uniqueSenders = [...new Set(allMessages.map((msg: any) => msg.sender_id))];
        
        // Si plus de 2 participants, ignorer ce thread
        if (uniqueSenders.length > 2) {
          return null;
        }

        // Vérifier qu'il y a exactement 1 tuteur et 1 étudiant
        const { data: senders, error: _sendersError } = await (supabaseAdmin as any)
          .from('users')
          .select('id, role')
          .in('id', uniqueSenders);

        if (!senders) {
          return null;
        }

        const tutors = senders.filter((sender: any) => sender.role === 'TUTOR');
        const students = senders.filter((sender: any) => sender.role === 'STUDENT');

        // Si ce n'est pas exactement 1 tuteur et 1 étudiant, ignorer
        if (tutors.length !== 1 || students.length !== 1) {
          return null;
        }

        // Vérifier que le tuteur actuel fait partie de ce thread
        const tutorInThread = tutors.find((tutor: any) => tutor.id === tutorId);
        if (!tutorInThread) {
          return null;
        }

        // Récupérer le dernier message
        const { data: lastMessage, error: _lastMessageError } = await (supabaseAdmin as any)
          .from('messages')
          .select(`
            id,
            content,
            sender_id,
            created_at,
            is_read
          `)
          .eq('thread_id', thread.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Récupérer les messages non lus pour ce thread
        const { data: unreadMessages, error: _unreadError } = await (supabaseAdmin as any)
          .from('messages')
          .select('id')
          .eq('thread_id', thread.id)
          .eq('is_read', false)
          .neq('sender_id', tutorId);

        // Récupérer l'étudiant associé à ce thread
        const studentId = students[0].id;
        const { data: studentInfo, error: _studentError } = await (supabaseAdmin as any)
          .from('users')
          .select('id, first_name, last_name, email, avatar_url')
          .eq('id', studentId)
          .single();

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
          unreadCount: unreadMessages ? unreadMessages.length : 0,
          createdAt: thread.created_at,
          updatedAt: thread.updated_at
        };
      })
    );

    // Filtrer les threads qui ont un étudiant associé
    const validThreads = threadsWithDetails.filter(thread => thread.student);

    return NextResponse.json({
      threads: validThreads,
      count: validThreads.length
    });

  } catch (error) {
    logger.error('Error in tutor messages API:', { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tutorId, studentId, subject, content } = body;

    if (!tutorId || !studentId || !subject || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Créer un nouveau thread de messages
    const { data: thread, error: threadError } = await (supabaseAdmin as any)
      .from('message_threads')
      .insert({
        subject,
        is_active: true
      })
      .select()
      .single();

    if (threadError) {
      logger.error('Error creating message thread:', threadError);
      return NextResponse.json({ error: 'Failed to create message thread' }, { status: 500 });
    }

    // Envoyer le message initial
    const { data: message, error: messageError } = await (supabaseAdmin as any)
      .from('messages')
      .insert({
        thread_id: thread.id,
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

    // Créer une notification pour l'étudiant
    await (supabaseAdmin as any)
      .from('notifications')
      .insert({
        user_id: studentId,
        type: 'MESSAGE',
        title: 'Nouveau message',
        message: `Vous avez reçu un nouveau message de votre tuteur`,
        data: { thread_id: thread.id }
      });

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
