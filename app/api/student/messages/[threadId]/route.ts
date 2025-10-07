import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const user = await getUserSession();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { threadId } = await params;

    // Vérifier que l'étudiant a accès à ce thread
    const { data: thread, error: threadError } = await supabaseAdmin
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
      return NextResponse.json({ error: 'Thread non trouvé ou accès refusé' }, { status: 404 });
    }

    // Vérifier que l'étudiant a des messages dans ce thread
    const { data: studentMessages, error: studentMessagesError } = await supabaseAdmin
      .from('messages')
      .select('id')
      .eq('thread_id', threadId)
      .eq('sender_id', user.id)
      .limit(1);

    if (studentMessagesError || !studentMessages || studentMessages.length === 0) {
      return NextResponse.json({ error: 'Accès refusé à ce thread' }, { status: 403 });
    }

    // Récupérer tous les messages du thread
    const { data: messages, error: messagesError } = await supabaseAdmin
      .from('messages')
      .select(`
        id,
        sender_id,
        content,
        created_at,
        is_read
      `)
      .eq('thread_id', threadId)
      .order('created_at', { ascending: true });

    if (messagesError) {
      console.error('Erreur lors de la récupération des messages:', messagesError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des messages' }, { status: 500 });
    }

    // Marquer tous les messages comme lus pour cet étudiant
    await (supabaseAdmin as any)
      .from('messages')
      .update({ is_read: true })
      .eq('thread_id', threadId)
      .neq('sender_id', user.id); // Seulement les messages reçus

    // Récupérer les informations des utilisateurs qui ont envoyé des messages
    const userIds = [...new Set((messages || []).map((msg: any) => msg.sender_id))];
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, first_name, last_name, avatar_url, role')
      .in('id', userIds);

    if (usersError) {
      console.error('Erreur lors de la récupération des utilisateurs:', usersError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des utilisateurs' }, { status: 500 });
    }

    // Trouver le tuteur dans les utilisateurs
    const tutor = users?.find((u: any) => u.role === 'TUTOR');

    const formattedMessages = (messages || []).map((message: any) => {
      const sender = users?.find((u: any) => u.id === message.sender_id);
      return {
        id: message.id,
        content: message.content,
        senderId: message.sender_id,
        sender: sender ? {
          id: (sender as any).id,
          name: `${(sender as any).first_name} ${(sender as any).last_name}`,
          email: (sender as any).email || '',
          avatar: (sender as any).avatar_url || '/images/user/user-01.png',
          role: (sender as any).role
        } : null,
        createdAt: message.created_at,
        isRead: message.is_read
      };
    });

    return NextResponse.json({
      thread: {
        id: (thread as any).id,
        subject: (thread as any).subject,
        createdAt: (thread as any).created_at,
        updatedAt: (thread as any).updated_at,
        isActive: (thread as any).is_active
      },
      messages: formattedMessages
    });

  } catch (error) {
    console.error('❌ Erreur API messages thread:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const user = await getUserSession();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { threadId } = await params;
    const { content } = await request.json();

    if (!content) {
      return NextResponse.json({ error: 'Le contenu du message est requis' }, { status: 400 });
    }

    // Vérifier que l'étudiant a accès à ce thread
    const { data: thread, error: threadError } = await supabaseAdmin
      .from('message_threads')
      .select('id, is_active')
      .eq('id', threadId)
      .eq('is_active', true)
      .single();

    if (threadError || !thread) {
      return NextResponse.json({ error: 'Thread non trouvé ou accès refusé' }, { status: 404 });
    }

    // Vérifier que l'étudiant a des messages dans ce thread
    const { data: studentMessages, error: studentMessagesError } = await supabaseAdmin
      .from('messages')
      .select('id')
      .eq('thread_id', threadId)
      .eq('sender_id', user.id)
      .limit(1);

    if (studentMessagesError || !studentMessages || studentMessages.length === 0) {
      return NextResponse.json({ error: 'Accès refusé à ce thread' }, { status: 403 });
    }

    // Créer le nouveau message
    const { data: message, error: messageError } = await (supabaseAdmin as any)
      .from('messages')
      .insert({
        thread_id: threadId,
        sender_id: user.id,
        content,
        is_read: false
      })
      .select('id, created_at')
      .single();

    if (messageError) {
      console.error('Erreur lors de la création du message:', messageError);
      return NextResponse.json({ error: 'Erreur lors de l\'envoi du message' }, { status: 500 });
    }

    // Trouver le tuteur dans ce thread pour créer une notification
    const { data: tutorMessages, error: tutorMessagesError } = await supabaseAdmin
      .from('messages')
      .select('sender_id')
      .eq('thread_id', threadId)
      .neq('sender_id', user.id)
      .limit(1);

    if (tutorMessages && tutorMessages.length > 0) {
      // Récupérer les informations du tuteur
      const { data: tutor, error: tutorError } = await supabaseAdmin
        .from('users')
        .select('id, first_name, last_name')
        .eq('id', (tutorMessages[0] as any).sender_id)
        .eq('role', 'TUTOR')
        .single();

      if (tutor && !tutorError) {
        // Créer une notification pour le tuteur
        await (supabaseAdmin as any)
          .from('notifications')
          .insert({
            user_id: (tutor as any).id,
            type: 'MESSAGE',
            title: 'Nouveau message',
            message: `Vous avez reçu un nouveau message de ${(user as any).first_name || 'un étudiant'}`,
            data: {
              thread_id: threadId,
              sender_id: user.id
            }
          });
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: {
        id: message.id,
        content,
        senderId: user.id,
        createdAt: message.created_at,
        isRead: false
      }
    });

  } catch (error) {
    console.error('❌ Erreur API envoi message:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}