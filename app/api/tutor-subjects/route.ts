import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseUnreachableError, supabaseAdmin } from '@/lib/supabase';
import { TUTOR_SUBJECTS } from '@/lib/tutor-subjects';

export const dynamic = 'force-dynamic';

const normalizeSubjectKey = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

function mergeSubjects(...groups: Array<Array<string | null | undefined> | undefined>) {
  const subjects = new Map<string, string>();

  for (const group of groups) {
    for (const item of group || []) {
      const subject = item?.trim();
      if (!subject) continue;
      const key = normalizeSubjectKey(subject);
      if (!subjects.has(key)) {
        subjects.set(key, subject);
      }
    }
  }

  return Array.from(subjects.values()).sort((a, b) => a.localeCompare(b, 'fr'));
}

export async function GET(request: NextRequest) {
  const includeCatalog = request.nextUrl.searchParams.get('includeCatalog') === 'true';

  try {
    const { data, error } = await (supabaseAdmin as any)
      .from('tutors')
      .select('subjects, users!inner(is_active)')
      .eq('users.is_active', true);

    if (error) {
      if (isSupabaseUnreachableError(error)) {
        return NextResponse.json({ subjects: [...TUTOR_SUBJECTS] });
      }
      throw error;
    }

    const taughtSubjects = (data || []).flatMap((row: any) =>
      Array.isArray(row.subjects) ? row.subjects : []
    );

    const subjects = includeCatalog
      ? mergeSubjects([...TUTOR_SUBJECTS], taughtSubjects)
      : mergeSubjects(taughtSubjects);

    return NextResponse.json({
      subjects: subjects.length > 0 ? subjects : [...TUTOR_SUBJECTS],
    });
  } catch (error) {
    if (isSupabaseUnreachableError(error)) {
      return NextResponse.json({ subjects: [...TUTOR_SUBJECTS] });
    }
    console.error('[tutor-subjects] GET error:', error);
    return NextResponse.json(
      { error: 'Erreur lors du chargement des matières' },
      { status: 500 }
    );
  }
}
