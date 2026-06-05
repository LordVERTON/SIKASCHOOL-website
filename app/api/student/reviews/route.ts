import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { canAccessStudentFeatures, getEffectiveStudentAccess } from '@/lib/student-access';

const getEffectiveStudent = async () => {
  const user = await getUserSession();
  if (!canAccessStudentFeatures(user)) {
    return { error: NextResponse.json({ error: 'Non autorisé' }, { status: 401 }) };
  }

  const access = await getEffectiveStudentAccess(user);
  if (!access) {
    return { error: NextResponse.json({ error: 'Aucun élève lié à ce compte parent' }, { status: 404 }) };
  }

  return { user, access };
};

export async function GET() {
  try {
    const session = await getEffectiveStudent();
    if (session.error) {
      return session.error;
    }

    const { data: reviews, error } = await (supabaseAdmin as any)
      .from('reviews')
      .select('id, tutor_id, content, rating, is_approved, created_at, updated_at')
      .eq('student_id', session.access.effectiveStudentId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération reviews étudiant:', error);
      return NextResponse.json({ error: 'Impossible de récupérer les commentaires' }, { status: 500 });
    }

    const tutorIds = Array.from(
      new Set((reviews || []).map((review: any) => review.tutor_id).filter(Boolean))
    );
    const tutorsById = new Map<string, string>();

    if (tutorIds.length > 0) {
      const { data: tutors } = await (supabaseAdmin as any)
        .from('users')
        .select('id, first_name, last_name')
        .in('id', tutorIds);

      (tutors || []).forEach((tutor: any) => {
        tutorsById.set(tutor.id, `${tutor.first_name || ''} ${tutor.last_name || ''}`.trim());
      });
    }

    return NextResponse.json({
      reviews: (reviews || []).map((review: any) => ({
        id: review.id,
        tutorId: review.tutor_id,
        tutorName: review.tutor_id ? tutorsById.get(review.tutor_id) || 'Tuteur' : 'SikaSchool',
        content: review.content,
        rating: Number(review.rating) || 0,
        isApproved: Boolean(review.is_approved),
        createdAt: review.created_at,
        updatedAt: review.updated_at,
      })),
    });
  } catch (error) {
    console.error('Erreur API liste reviews étudiant:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getEffectiveStudent();
    if (session.error) {
      return session.error;
    }

    const body = await request.json().catch(() => ({}));
    const content = typeof body?.content === 'string' ? body.content.trim() : '';
    const rating = Number(body?.rating);
    const tutorId = typeof body?.tutorId === 'string' ? body.tutorId : '';

    if (!content || content.length < 10) {
      return NextResponse.json(
        { error: 'Le commentaire doit contenir au moins 10 caractères' },
        { status: 400 }
      );
    }

    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'La note doit être comprise entre 1 et 5' }, { status: 400 });
    }

    if (!tutorId) {
      return NextResponse.json({ error: 'Tuteur manquant' }, { status: 400 });
    }

    const { data: assignment } = await (supabaseAdmin as any)
      .from('tutor_student_assignments')
      .select('id')
      .eq('student_id', session.access.effectiveStudentId)
      .eq('tutor_id', tutorId)
      .eq('is_active', true)
      .maybeSingle();

    if (!assignment) {
      return NextResponse.json({ error: 'Ce tuteur n’est pas attribué à cet élève' }, { status: 403 });
    }

    const [{ data: studentUser, error: userError }, { data: studentProfile }] = await Promise.all([
      supabaseAdmin
        .from('users')
        .select('id, first_name, last_name, avatar_url')
        .eq('id', session.access.effectiveStudentId)
        .single(),
      (supabaseAdmin as any)
        .from('students')
        .select('grade_level')
        .eq('user_id', session.access.effectiveStudentId)
        .maybeSingle(),
    ]);

    if (userError || !studentUser) {
      return NextResponse.json({ error: 'Élève introuvable' }, { status: 404 });
    }

    const displayName = `${(studentUser as any).first_name || ''} ${(studentUser as any).last_name || ''}`.trim();
    const roleLabel = session.access.isParent
      ? `Famille d'élève${studentProfile?.grade_level ? ` en ${studentProfile.grade_level}` : ''}`
      : studentProfile?.grade_level || 'Élève';

    const { data: review, error } = await (supabaseAdmin as any)
      .from('reviews')
      .insert({
        student_id: session.access.effectiveStudentId,
        tutor_id: tutorId,
        student_name: displayName || 'Élève SikaSchool',
        student_role: roleLabel,
        content,
        rating,
        avatar_url: (studentUser as any).avatar_url || null,
        is_approved: false,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Erreur création review étudiant:', error);
      return NextResponse.json({ error: 'Impossible d’ajouter le commentaire' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      reviewId: review?.id,
      message: 'Votre commentaire a été envoyé et sera publié après validation.',
    });
  } catch (error) {
    console.error('Erreur API création review:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getEffectiveStudent();
    if (session.error) {
      return session.error;
    }

    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      return NextResponse.json({ error: 'Commentaire manquant' }, { status: 400 });
    }

    const { data: review, error: findError } = await (supabaseAdmin as any)
      .from('reviews')
      .select('id, student_id')
      .eq('id', reviewId)
      .eq('student_id', session.access.effectiveStudentId)
      .maybeSingle();

    if (findError) {
      console.error('Erreur vérification review étudiant:', findError);
      return NextResponse.json({ error: 'Impossible de vérifier le commentaire' }, { status: 500 });
    }

    if (!review) {
      return NextResponse.json({ error: 'Commentaire introuvable' }, { status: 404 });
    }

    const { error } = await (supabaseAdmin as any)
      .from('reviews')
      .delete()
      .eq('id', reviewId)
      .eq('student_id', session.access.effectiveStudentId);

    if (error) {
      console.error('Erreur suppression review étudiant:', error);
      return NextResponse.json({ error: 'Impossible de supprimer le commentaire' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Commentaire supprimé' });
  } catch (error) {
    console.error('Erreur API suppression review étudiant:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
