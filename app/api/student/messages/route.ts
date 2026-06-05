import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { mercureThreadTopic, mercureUserTopic, publishMercureUpdate } from '@/lib/mercure';
import { canAccessStudentFeatures, getEffectiveStudentAccess } from '@/lib/student-access';

export async function GET() {
  try {
    const user = await getUserSession();
    if (!canAccessStudentFeatures(user)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const access = await getEffectiveStudentAccess(user);
    if (!access) {
      return NextResponse.json({ error: 'Aucun élève lié à ce compte parent' }, { status: 404 });
    }
    const studentId = access.effectiveStudentId;

    // Récupérer les threads où l'étudiant est participant via la table des participants
    let participantRows: any[] | null = null;
    let participantsError: any = null;
    try {
      const resp = await (supabaseAdmin as any)
        .from('message_thread_participants')
        .select('thread_id')
        .eq('user_id', studentId);
      participantRows = resp.data;
      participantsError = resp.error;
    } catch (e: any) {
      participantsError = e;
    }

    // Fallback if participants table missing -> use legacy inference by sender
    const participantsTableMissing = participantsError && (
      participantsError.code === 'PGRST205' ||
      (participantsError.message && String(participantsError.message).toLowerCase().includes('could not find the table'))
    );

    if (participantsError && !participantsTableMissing) {
      console.error('Erreur participants:', participantsError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des messages' }, { status: 500 });
    }

    const threadIds = (participantRows || []).map((r: any) => r.thread_id);
    if (threadIds.length === 0) {
      return NextResponse.json({ threads: [] });
    }

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
      console.error('Erreur lors de la récupération des threads:', threadsError);
      return NextResponse.json({ error: 'Erreur lors de la récupération des messages' }, { status: 500 });
    }

    // Pour chaque thread, récupérer dernier message, unread count et un nom d'affichage (premier autre participant)
    const threadsWithMeta = await Promise.all(
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
            .neq('sender_id', studentId),
          participantsTableMissing
            ? Promise.resolve({ data: null })
            : (supabaseAdmin as any)
                .from('message_thread_participants')
                .select('user_id')
                .eq('thread_id', thread.id)
        ]);

        let tutorInfo = null;
        const participants = (participantsReq as any)?.data;
        if (!participantsTableMissing && participants && participants.length > 0) {
          const otherIds = participants
            .map((p: any) => p.user_id)
            .filter((id: string) => id !== studentId);
          if (otherIds.length > 0) {
            const { data: users } = await (supabaseAdmin as any)
              .from('users')
              .select('id, email, first_name, last_name, avatar_url, role')
              .in('id', otherIds)
              .limit(1);
            tutorInfo = users && users[0] ? users[0] : null;
          }
        } else if (participantsTableMissing) {
          // Legacy: derive other user from last non-student message sender
          const { data: otherMsg } = await (supabaseAdmin as any)
            .from('messages')
            .select('sender_id')
            .eq('thread_id', thread.id)
            .neq('sender_id', studentId)
            .order('created_at', { ascending: false })
            .limit(1)
            .single();
          if (otherMsg) {
            const { data: users } = await (supabaseAdmin as any)
              .from('users')
              .select('id, email, first_name, last_name, avatar_url, role')
              .eq('id', (otherMsg as any).sender_id)
              .limit(1);
            tutorInfo = users && users[0] ? users[0] : null;
          }
        }

        return {
          id: thread.id,
          subject: thread.subject,
          tutor: tutorInfo ? {
            id: (tutorInfo as any).id,
            name: `${(tutorInfo as any).first_name} ${(tutorInfo as any).last_name}`,
            email: (tutorInfo as any).email || '',
            avatar: (tutorInfo as any).avatar_url || '/images/user/user-01.png'
          } : null,
          lastMessage: lastMessage ? {
            id: lastMessage.id,
            content: (lastMessage as any).content,
            senderId: (lastMessage as any).sender_id,
            createdAt: (lastMessage as any).created_at,
            isRead: (lastMessage as any).is_read
          } : null,
          unreadCount: unreadCount || 0,
          createdAt: thread.created_at,
          updatedAt: thread.updated_at
        };
      })
    );

    return NextResponse.json({ threads: threadsWithMeta });

  } catch (error) {
    console.error('❌ Erreur API messages étudiant:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserSession();
    if (!canAccessStudentFeatures(user)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const access = await getEffectiveStudentAccess(user);
    if (!access) {
      return NextResponse.json({ error: 'Aucun élève lié à ce compte parent' }, { status: 404 });
    }
    const studentId = access.effectiveStudentId;

    const body = await request.json();
    const { tutorId, subject, content, participantIds } = body;

    if (!subject || !content) {
      return NextResponse.json({ error: 'Sujet et contenu requis' }, { status: 400 });
    }

    // Construire la liste des participants: toujours inclure l'étudiant courant
    const participants: string[] = Array.from(new Set([
      studentId,
      ...(Array.isArray(participantIds) ? participantIds : (tutorId ? [tutorId] : []))
    ]));

    if (participants.length < 2) {
      return NextResponse.json({ error: 'Au moins deux participants requis' }, { status: 400 });
    }

    // Créer un nouveau thread de message
    const { data: thread, error: threadError } = await (supabaseAdmin as any)
      .from('message_threads')
      .insert({ subject, is_active: true })
      .select('id')
      .single();

    if (threadError) {
      console.error('Erreur lors de la création du thread:', threadError);
      return NextResponse.json({ error: 'Erreur lors de la création du thread' }, { status: 500 });
    }

    // Ajouter les participants
    await (supabaseAdmin as any)
      .from('message_thread_participants')
      .insert(participants.map((pid: string) => ({ thread_id: thread.id, user_id: pid })));

    // Créer le premier message
    const { data: message, error: messageError } = await (supabaseAdmin as any)
      .from('messages')
      .insert({ thread_id: thread.id, sender_id: studentId, content, is_read: false })
      .select('id')
      .single();

    if (messageError) {
      console.error('Erreur lors de la création du message:', messageError);
      return NextResponse.json({ error: 'Erreur lors de la création du message' }, { status: 500 });
    }

    // Créer des notifications pour les autres participants
    const notifyUserIds = participants.filter((pid) => pid !== studentId);
    if (notifyUserIds.length > 0) {
      await (supabaseAdmin as any)
        .from('notifications')
        .insert(
          notifyUserIds.map((uid: string) => ({
            user_id: uid,
            type: 'MESSAGE',
            title: 'Nouveau message',
            message: `Nouveau fil: ${subject}`,
            data: { thread_id: thread.id, sender_id: studentId }
          }))
        );
    }

    await publishMercureUpdate(
      [mercureThreadTopic(thread.id), ...participants.map((pid) => mercureUserTopic(pid))],
      {
        type: 'message',
        action: 'thread-created',
        userId: studentId,
        threadId: thread.id,
      }
    );

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
