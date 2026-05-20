import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { mercureThreadTopic, mercureUserTopic, publishMercureUpdate, publishUserMercureUpdate } from '@/lib/mercure';

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

    // Vérifier la participation de l'étudiant au thread
    const { data: participant, error: participantError } = await (supabaseAdmin as any)
      .from('message_thread_participants')
      .select('thread_id')
      .eq('thread_id', threadId)
      .eq('user_id', user.id)
      .single();

    if (participantError || !participant) {
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

    await publishUserMercureUpdate([user.id], {
      type: 'message',
      action: 'read',
      userId: user.id,
      threadId,
    });

    // Récupérer les informations des utilisateurs qui ont envoyé des messages
    const userIds = [...new Set((messages || []).map((msg: any) => msg.sender_id))];
    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, avatar_url, role')
      .in('id', userIds);

    if (usersError) {
      console.error('Erreur lors de la récupération des utilisateurs:', usersError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des utilisateurs' }, { status: 500 });
    }

    // Note: tutor variable not used (kept for readability). Remove to satisfy linter.

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

    // Vérifier la participation de l'étudiant au thread
    const { data: participant, error: participantError } = await (supabaseAdmin as any)
      .from('message_thread_participants')
      .select('thread_id')
      .eq('thread_id', threadId)
      .eq('user_id', user.id)
      .single();

    if (participantError || !participant) {
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

    // Récupérer tous les participants du thread (sauf l'expéditeur)
    const { data: participants, error: _participantsError } = await supabaseAdmin
      .from('message_thread_participants')
      .select('user_id')
      .eq('thread_id', threadId)
      .neq('user_id', user.id);

    if (participants && participants.length > 0) {
      // Récupérer les informations de l'expéditeur
      const { data: sender, error: senderError } = await supabaseAdmin
        .from('users')
        .select('first_name, last_name')
        .eq('id', user.id)
        .single();

      const senderName = sender && !senderError 
        ? `${(sender as any).first_name || ''} ${(sender as any).last_name || ''}`.trim() || 'Un utilisateur'
        : 'Un utilisateur';

      // Récupérer le sujet du thread pour le message de notification
      const { data: threadData } = await supabaseAdmin
        .from('message_threads')
        .select('subject')
        .eq('id', threadId)
        .single();

      const threadSubject = (threadData as any)?.subject || 'Nouveau message';

      // Créer des notifications pour tous les participants (étudiants et tuteurs)
      const notifications = (participants as any[]).map((p: any) => ({
        user_id: p.user_id,
        type: 'MESSAGE',
        title: 'Nouveau message',
        message: `${senderName} vous a envoyé un message${threadSubject ? ` : ${threadSubject}` : ''}`,
        data: {
          thread_id: threadId,
          sender_id: user.id,
          sender_name: senderName
        }
      }));

      if (notifications.length > 0) {
        await (supabaseAdmin as any)
          .from('notifications')
          .insert(notifications);
      }

      await publishMercureUpdate(
        [
          mercureThreadTopic(threadId),
          mercureUserTopic(user.id),
          ...participants.map((p: any) => mercureUserTopic(p.user_id)),
        ],
        {
          type: 'message',
          action: 'created',
          userId: user.id,
          threadId,
        }
      );
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

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const user = await getUserSession();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { threadId } = await params;
    const body = await request.json();
    const { subject } = body;

    if (!subject) {
      return NextResponse.json({ error: 'Sujet requis' }, { status: 400 });
    }

    // Vérifier participation
    const { data: participant, error: participantError } = await (supabaseAdmin as any)
      .from('message_thread_participants')
      .select('thread_id')
      .eq('thread_id', threadId)
      .eq('user_id', user.id)
      .single();

    if (participantError || !participant) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    const { data: updated, error: updateError } = await (supabaseAdmin as any)
      .from('message_threads')
      .update({ subject })
      .eq('id', threadId)
      .select('id, subject')
      .single();

    if (updateError) {
      return NextResponse.json({ error: 'Erreur mise à jour' }, { status: 500 });
    }

    return NextResponse.json({ success: true, thread: updated });
  } catch (error) {
    console.error('❌ Erreur API update thread:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const user = await getUserSession();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { threadId } = await params;

    // Vérifier participation
    const { data: participant, error: participantError } = await (supabaseAdmin as any)
      .from('message_thread_participants')
      .select('thread_id')
      .eq('thread_id', threadId)
      .eq('user_id', user.id)
      .single();

    if (participantError || !participant) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });
    }

    // Hard delete: supprimer définitivement le thread (messages et participants en cascade)
    const { error: deleteError } = await (supabaseAdmin as any)
      .from('message_threads')
      .delete()
      .eq('id', threadId);

    if (deleteError) {
      return NextResponse.json({ error: 'Erreur suppression' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('❌ Erreur API delete thread:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
