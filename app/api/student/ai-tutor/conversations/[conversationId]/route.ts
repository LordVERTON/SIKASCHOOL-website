import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { runSikaAgent, type StoredMessage, type StoredAttachment } from '@/lib/ai-tutor/agent';
import { canAccessStudentFeatures, getEffectiveStudentAccess } from '@/lib/student-access';

export const runtime = 'nodejs';
export const maxDuration = 60;

/**
 * GET : récupère la conversation et ses messages.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await getUserSession();
    if (!canAccessStudentFeatures(user)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const access = await getEffectiveStudentAccess(user);
    if (!access) {
      return NextResponse.json({ error: 'Aucun élève lié à ce compte parent' }, { status: 404 });
    }

    const { conversationId } = await params;

    const { data: convo, error: convoError } = await (supabaseAdmin as any)
      .from('ai_tutor_conversations')
      .select('id, user_id, title, subject, level, is_active, created_at, updated_at')
      .eq('id', conversationId)
      .eq('user_id', access.effectiveStudentId)
      .single();

    if (convoError || !convo) {
      return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 });
    }

    const { data: rawMessages, error: msgError } = await (supabaseAdmin as any)
      .from('ai_tutor_messages')
      .select('id, role, content, images, metadata, created_at')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (msgError) {
      return NextResponse.json({ error: 'Erreur messages' }, { status: 500 });
    }

    return NextResponse.json({
      conversation: {
        id: convo.id,
        title: convo.title,
        subject: convo.subject,
        level: convo.level,
        createdAt: convo.created_at,
        updatedAt: convo.updated_at,
      },
      messages: (rawMessages || []).map((m: any) => ({
        id: m.id,
        role: m.role,
        content: m.content,
        images: m.images || [],
        metadata: m.metadata || {},
        createdAt: m.created_at,
      })),
    });
  } catch (err) {
    console.error('AI tutor convo GET error:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

/**
 * POST : envoie un message utilisateur (texte + images optionnelles) et
 * renvoie la réponse générée par l'agent Sika AI.
 *
 * Body attendu (JSON) :
 *   {
 *     "content": "...",
 *     "attachments": [{ "kind": "image", "url": "data:image/png;base64,..." }]
 *   }
 *
 * Les images doivent être envoyées en data URL base64 par le client
 * (dimensionnées raisonnablement côté front pour limiter le payload).
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await getUserSession();
    if (!canAccessStudentFeatures(user)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const access = await getEffectiveStudentAccess(user);
    if (!access) {
      return NextResponse.json({ error: 'Aucun élève lié à ce compte parent' }, { status: 404 });
    }

    const { conversationId } = await params;

    const body = await request.json().catch(() => ({}));
    const content: string = String(body?.content ?? '').trim();
    const rawAttachments: unknown = body?.attachments;
    const attachments: StoredAttachment[] = Array.isArray(rawAttachments)
      ? (rawAttachments as any[])
          .filter((a) => a && typeof a.url === 'string')
          .slice(0, 6) // max 6 images par message
          .map((a) => ({
            kind: 'image' as const,
            url: String(a.url),
            mimeType: a.mimeType ? String(a.mimeType) : undefined,
            name: a.name ? String(a.name) : undefined,
          }))
      : [];

    if (!content && attachments.length === 0) {
      return NextResponse.json(
        { error: 'Message ou image requis' },
        { status: 400 }
      );
    }

    // Vérifier la propriété de la conversation
    const { data: convo, error: convoError } = await (supabaseAdmin as any)
      .from('ai_tutor_conversations')
      .select('id, user_id, title, subject, level')
      .eq('id', conversationId)
      .eq('user_id', access.effectiveStudentId)
      .single();

    if (convoError || !convo) {
      return NextResponse.json({ error: 'Conversation introuvable' }, { status: 404 });
    }

    // Charger l'historique récent (on limite pour garder du contexte + la note)
    const { data: rawHistory } = await (supabaseAdmin as any)
      .from('ai_tutor_messages')
      .select('role, content, images')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(40);

    const history: StoredMessage[] = (rawHistory || [])
      .filter((m: any) => m.role === 'user' || m.role === 'assistant')
      .map((m: any) => ({
        role: m.role,
        content: m.content || '',
        images: Array.isArray(m.images) ? m.images : [],
      }));

    // Enregistrer d'abord le message utilisateur
    const { data: userMsg, error: userMsgErr } = await (supabaseAdmin as any)
      .from('ai_tutor_messages')
      .insert({
        conversation_id: conversationId,
        role: 'user',
        content,
        images: attachments,
        metadata: {},
      })
      .select('id, created_at')
      .single();

    if (userMsgErr) {
      console.error('Insert user msg error:', userMsgErr);
      return NextResponse.json(
        { error: "Impossible d'enregistrer votre message" },
        { status: 500 }
      );
    }

    // Invoquer l'agent LangGraph
    let agentResult;
    try {
      agentResult = await runSikaAgent({
        history,
        userMessage: content,
        attachments,
        student: {
          name: user.name,
          level: convo.level,
          subject: convo.subject,
        },
      });
    } catch (e: any) {
      console.error('Sika AI agent error:', e);
      const fallback =
        "Désolé, le tuteur IA est momentanément indisponible (" +
        (e?.message ? String(e.message).slice(0, 160) : 'erreur inconnue') +
        '). Réessaie dans un instant.';

      const { data: errMsg } = await (supabaseAdmin as any)
        .from('ai_tutor_messages')
        .insert({
          conversation_id: conversationId,
          role: 'assistant',
          content: fallback,
          images: [],
          metadata: { error: true },
        })
        .select('id, content, created_at, role, images, metadata')
        .single();

      return NextResponse.json(
        {
          userMessage: {
            id: userMsg?.id,
            role: 'user',
            content,
            images: attachments,
            createdAt: userMsg?.created_at,
          },
          assistantMessage: errMsg
            ? {
                id: errMsg.id,
                role: errMsg.role,
                content: errMsg.content,
                images: errMsg.images || [],
                metadata: errMsg.metadata || {},
                createdAt: errMsg.created_at,
              }
            : null,
        },
        { status: 200 }
      );
    }

    // Enregistrer la réponse assistant
    const { data: aiMsg, error: aiMsgErr } = await (supabaseAdmin as any)
      .from('ai_tutor_messages')
      .insert({
        conversation_id: conversationId,
        role: 'assistant',
        content: agentResult.content,
        images: [],
        metadata: {
          model: agentResult.model,
          toolCalls: agentResult.toolCalls,
        },
      })
      .select('id, role, content, images, metadata, created_at')
      .single();

    if (aiMsgErr) {
      console.error('Insert AI msg error:', aiMsgErr);
    }

    // Si la conversation a encore le titre par défaut, on le met à jour à partir
    // du premier message utilisateur (max ~60 caractères).
    if (convo.title === 'Nouvelle discussion' && content) {
      const newTitle = content.split('\n')[0].slice(0, 60).trim();
      if (newTitle) {
        await (supabaseAdmin as any)
          .from('ai_tutor_conversations')
          .update({ title: newTitle })
          .eq('id', conversationId);
      }
    }

    return NextResponse.json({
      userMessage: {
        id: userMsg?.id,
        role: 'user',
        content,
        images: attachments,
        createdAt: userMsg?.created_at,
      },
      assistantMessage: aiMsg
        ? {
            id: aiMsg.id,
            role: aiMsg.role,
            content: aiMsg.content,
            images: aiMsg.images || [],
            metadata: aiMsg.metadata || {},
            createdAt: aiMsg.created_at,
          }
        : null,
    });
  } catch (err) {
    console.error('AI tutor convo POST error:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await getUserSession();
    if (!canAccessStudentFeatures(user)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const access = await getEffectiveStudentAccess(user);
    if (!access) {
      return NextResponse.json({ error: 'Aucun élève lié à ce compte parent' }, { status: 404 });
    }
    const { conversationId } = await params;
    const body = await request.json().catch(() => ({}));

    const updates: Record<string, unknown> = {};
    if (typeof body?.title === 'string' && body.title.trim()) {
      updates.title = body.title.trim().slice(0, 120);
    }
    if (typeof body?.subject === 'string') updates.subject = body.subject;
    if (typeof body?.level === 'string') updates.level = body.level;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'Aucun champ à mettre à jour' }, { status: 400 });
    }

    const { data, error } = await (supabaseAdmin as any)
      .from('ai_tutor_conversations')
      .update(updates)
      .eq('id', conversationId)
      .eq('user_id', access.effectiveStudentId)
      .select('id, title, subject, level, updated_at')
      .single();

    if (error || !data) {
      return NextResponse.json({ error: 'Mise à jour impossible' }, { status: 500 });
    }

    return NextResponse.json({ conversation: data });
  } catch (err) {
    console.error('AI tutor convo PATCH error:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await getUserSession();
    if (!canAccessStudentFeatures(user)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }
    const access = await getEffectiveStudentAccess(user);
    if (!access) {
      return NextResponse.json({ error: 'Aucun élève lié à ce compte parent' }, { status: 404 });
    }
    const { conversationId } = await params;

    const { error } = await (supabaseAdmin as any)
      .from('ai_tutor_conversations')
      .delete()
      .eq('id', conversationId)
      .eq('user_id', access.effectiveStudentId);

    if (error) {
      return NextResponse.json({ error: 'Suppression impossible' }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('AI tutor convo DELETE error:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
