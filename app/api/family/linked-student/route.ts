import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { getEffectiveStudentAccess } from '@/lib/student-access';

export async function GET() {
  try {
    const user = await getUserSession();
    if (!user || user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const access = await getEffectiveStudentAccess(user);
    return NextResponse.json({ linkedStudent: access?.linkedStudent ?? null });
  } catch (error) {
    console.error('Erreur récupération élève lié:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getUserSession();
    if (!user || user.role !== 'PARENT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const studentEmail = typeof body?.studentEmail === 'string'
      ? body.studentEmail.trim().toLowerCase()
      : '';

    if (!studentEmail) {
      return NextResponse.json({ error: "L'e-mail de l'élève est requis" }, { status: 400 });
    }

    const { data: student, error: studentError } = await supabaseAdmin
      .from('users')
      .select('id, email, first_name, last_name, avatar_url, role')
      .eq('email', studentEmail)
      .eq('role', 'STUDENT')
      .maybeSingle();

    if (studentError) {
      console.error('Erreur recherche élève:', studentError);
      return NextResponse.json({ error: "Impossible de rechercher l'élève" }, { status: 500 });
    }

    if (!student) {
      return NextResponse.json({ error: 'Aucun compte élève trouvé avec cet e-mail' }, { status: 404 });
    }

    const { error: clearError } = await (supabaseAdmin as any)
      .from('students')
      .update({ parents_linked: null })
      .eq('parents_linked', user.id);

    if (clearError) {
      console.error('Erreur nettoyage anciens liens parent:', clearError);
      return NextResponse.json({ error: 'Impossible de mettre à jour le lien parent-élève' }, { status: 500 });
    }

    const { error: linkError } = await (supabaseAdmin as any)
      .from('students')
      .update({ parents_linked: (user as any).id })
      .eq('user_id', (student as any).id);

    if (linkError) {
      console.error('Erreur création lien parent-élève:', linkError);
      return NextResponse.json({ error: 'Impossible de lier cet élève' }, { status: 500 });
    }

    return NextResponse.json({
      linkedStudent: {
        id: (student as any).id,
        email: (student as any).email,
        firstName: (student as any).first_name,
        lastName: (student as any).last_name,
        avatarUrl: (student as any).avatar_url,
      },
    });
  } catch (error) {
    console.error('Erreur liaison élève:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
