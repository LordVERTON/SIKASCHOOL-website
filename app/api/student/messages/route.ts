import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const user = await getUserSession();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const studentId = user.id;

    // Récupérer les threads de messages pour cet étudiant
    // On utilise une approche différente : récupérer tous les threads actifs
    // puis filtrer ceux qui contiennent des messages de/vers cet étudiant
    const { data: threads, error: threadsError } = await supabaseAdmin
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
      console.error('Erreur lors de la récupération des threads:', threadsError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des messages' }, { status: 500 });
    }

    // Pour chaque thread, vérifier s'il contient des messages de/vers cet étudiant
    const threadsWithMessages = await Promise.all(
      (threads || []).map(async (thread: any) => {
        // Vérifier s'il y a des messages dans ce thread impliquant cet étudiant
        const { data: studentMessages, error: _studentMessagesError } = await supabaseAdmin
          .from('messages')
          .select('id')
          .eq('thread_id', thread.id)
          .eq('sender_id', studentId)
          .limit(1);

        // Si l'étudiant n'a pas de messages dans ce thread, on l'ignore
        if (!studentMessages || studentMessages.length === 0) {
          return null;
        }

        // Vérifier que ce thread ne contient que 2 participants (1 tuteur + 1 étudiant)
        const { data: allMessages, error: _allMessagesError } = await supabaseAdmin
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
        const { data: senders, error: _sendersError } = await supabaseAdmin
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

        // Récupérer le dernier message
        const { data: lastMessage, error: _lastMessageError } = await supabaseAdmin
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

        // Compter les messages non lus pour cet étudiant
        const { count: unreadCount, error: _unreadError } = await supabaseAdmin
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('thread_id', thread.id)
          .eq('is_read', false)
          .neq('sender_id', studentId); // Messages reçus, pas envoyés

        // Récupérer les informations du tuteur (celui qui n'est pas l'étudiant)
        let tutorInfo = null;
        if (lastMessage) {
          const { data: tutor, error: _tutorError } = await supabaseAdmin
            .from('users')
            .select('id, first_name, last_name, avatar_url')
            .eq('id', (lastMessage as any).sender_id)
            .eq('role', 'TUTOR')
            .single();

          if (tutor) {
            tutorInfo = tutor;
          } else {
            // Si le dernier message n'est pas du tuteur, chercher un tuteur dans les messages
            const { data: tutorMessages, error: _tutorMessageError } = await supabaseAdmin
              .from('messages')
              .select('sender_id')
              .eq('thread_id', thread.id)
              .neq('sender_id', studentId)
              .limit(10);

            if (tutorMessages && tutorMessages.length > 0) {
              // Récupérer les informations des utilisateurs qui ont envoyé des messages
              const senderIds = tutorMessages.map((msg: any) => msg.sender_id);
              const { data: tutors, error: _tutorError2 } = await supabaseAdmin
                .from('users')
                .select('id, first_name, last_name, avatar_url')
                .in('id', senderIds)
                .eq('role', 'TUTOR')
                .limit(1);
              
              if (tutors && tutors.length > 0) {
                tutorInfo = tutors[0];
              }
            }
          }
        }

        return {
          id: thread.id,
          subject: thread.subject,
          tutor: {
            id: (tutorInfo as any)?.id || 'unknown',
            name: tutorInfo ? `${(tutorInfo as any).first_name} ${(tutorInfo as any).last_name}` : 'Tuteur',
            email: (tutorInfo as any)?.email || '',
            avatar: (tutorInfo as any)?.avatar_url || '/images/user/user-01.png'
          },
          lastMessage: {
            id: (lastMessage as any)?.id || '',
            content: (lastMessage as any)?.content || 'Aucun message',
            senderId: (lastMessage as any)?.sender_id || '',
            createdAt: (lastMessage as any)?.created_at || thread.created_at,
            isRead: (lastMessage as any)?.is_read || false
          },
          unreadCount: unreadCount || 0,
          createdAt: thread.created_at,
          updatedAt: thread.updated_at
        };
      })
    );

    // Filtrer les threads null
    const validThreads = threadsWithMessages.filter(thread => thread !== null);

    return NextResponse.json({ threads: validThreads });

  } catch (error) {
    console.error('❌ Erreur API messages étudiant:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserSession();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { tutorId, subject, content } = await request.json();

    if (!tutorId || !subject || !content) {
      return NextResponse.json({ error: 'Tous les champs sont requis' }, { status: 400 });
    }

    // Vérifier que le tuteur est assigné à cet étudiant
    const { data: assignment, error: assignmentError } = await supabaseAdmin
      .from('tutor_student_assignments')
      .select('id')
      .eq('tutor_id', tutorId)
      .eq('student_id', user.id)
      .eq('is_active', true)
      .single();

    if (assignmentError || !assignment) {
      return NextResponse.json({ error: 'Tuteur non assigné à cet étudiant' }, { status: 403 });
    }

    // Créer un nouveau thread de message
    const { data: thread, error: threadError } = await (supabaseAdmin as any)
      .from('message_threads')
      .insert({
        subject,
        is_active: true
      })
      .select('id')
      .single();

    if (threadError) {
      console.error('Erreur lors de la création du thread:', threadError);
      return NextResponse.json({ error: 'Erreur lors de la création du thread' }, { status: 500 });
    }

    // Créer le premier message
    const { data: message, error: messageError } = await (supabaseAdmin as any)
      .from('messages')
      .insert({
        thread_id: thread.id,
        sender_id: user.id,
        content,
        is_read: false
      })
      .select('id')
      .single();

    if (messageError) {
      console.error('Erreur lors de la création du message:', messageError);
      return NextResponse.json({ error: 'Erreur lors de la création du message' }, { status: 500 });
    }

    // Créer une notification pour le tuteur
    await (supabaseAdmin as any)
      .from('notifications')
      .insert({
        user_id: tutorId,
        type: 'MESSAGE',
        title: 'Nouveau message',
        message: `Vous avez reçu un nouveau message de ${user.name || 'un étudiant'}: "${subject}"`,
        data: {
          thread_id: thread.id,
          student_id: user.id
        }
      });

    return NextResponse.json({ 
      success: true, 
      threadId: thread.id,
      messageId: message.id 
    });

  } catch (error) {
    console.error('❌ Erreur API création message:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}