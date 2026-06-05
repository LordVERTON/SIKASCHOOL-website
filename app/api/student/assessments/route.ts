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

    const { data, error } = await supabaseAdmin
      .from('session_assessments')
      .select('*')
      .eq('student_id', access.effectiveStudentId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Erreur récupération des évaluations' }, { status: 500 });
    }

    return NextResponse.json({ assessments: data || [] });
  } catch {
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}


