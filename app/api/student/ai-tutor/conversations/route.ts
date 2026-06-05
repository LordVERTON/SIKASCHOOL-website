import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
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

    const { data, error } = await (supabaseAdmin as any)
      .from('ai_tutor_conversations')
      .select('id, title, subject, level, is_active, created_at, updated_at')
      .eq('user_id', access.effectiveStudentId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Erreur chargement conversations IA:', error);
      return NextResponse.json(
        { error: 'Erreur chargement conversations' },
        { status: 500 }
      );
    }

    const conversations = (data || []).map((c: any) => ({
      id: c.id,
      title: c.title,
      subject: c.subject,
      level: c.level,
      createdAt: c.created_at,
      updatedAt: c.updated_at,
    }));

    return NextResponse.json({ conversations });
  } catch (err) {
    console.error('AI tutor conversations GET error:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
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

    const body = await request.json().catch(() => ({}));
    const title: string =
      (body?.title && String(body.title).trim()) || 'Nouvelle discussion';
    const subject: string | null = body?.subject ? String(body.subject) : null;
    const level: string | null = body?.level ? String(body.level) : null;

    const { data, error } = await (supabaseAdmin as any)
      .from('ai_tutor_conversations')
      .insert({
        user_id: access.effectiveStudentId,
        title,
        subject,
        level,
        is_active: true,
      })
      .select('id, title, subject, level, created_at, updated_at')
      .single();

    if (error || !data) {
      console.error('Erreur création conversation IA:', error);
      return NextResponse.json(
        { error: 'Impossible de créer la conversation' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      conversation: {
        id: data.id,
        title: data.title,
        subject: data.subject,
        level: data.level,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
    });
  } catch (err) {
    console.error('AI tutor conversations POST error:', err);
    return NextResponse.json({ error: 'Erreur interne' }, { status: 500 });
  }
}
