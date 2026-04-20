import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const user = await getUserSession();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { data, error } = await (supabaseAdmin as any)
      .from('ai_tutor_conversations')
      .select('id, title, subject, level, is_active, created_at, updated_at')
      .eq('user_id', user.id)
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
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const title: string =
      (body?.title && String(body.title).trim()) || 'Nouvelle discussion';
    const subject: string | null = body?.subject ? String(body.subject) : null;
    const level: string | null = body?.level ? String(body.level) : null;

    const { data, error } = await (supabaseAdmin as any)
      .from('ai_tutor_conversations')
      .insert({
        user_id: user.id,
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
