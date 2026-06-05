import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { canAccessAdminFeatures } from '@/lib/admin-permissions';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
  try {
    const user = await getUserSession();
    if (!user || !canAccessAdminFeatures(user)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { data: reviews, error } = await (supabaseAdmin as any)
      .from('reviews')
      .select('id, student_id, tutor_id, student_name, student_role, content, rating, avatar_url, is_approved, created_at, updated_at')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erreur récupération reviews admin:', error);
      return NextResponse.json({ error: 'Impossible de récupérer les commentaires' }, { status: 500 });
    }

    const userIds = Array.from(
      new Set(
        (reviews || [])
          .flatMap((review: any) => [review.student_id, review.tutor_id])
          .filter(Boolean)
      )
    );
    const usersById = new Map<string, any>();

    if (userIds.length > 0) {
      const { data: users } = await (supabaseAdmin as any)
        .from('users')
        .select('id, first_name, last_name, email, role')
        .in('id', userIds);

      (users || []).forEach((account: any) => usersById.set(account.id, account));
    }

    return NextResponse.json({
      reviews: (reviews || []).map((review: any) => {
        const student = review.student_id ? usersById.get(review.student_id) : null;
        const tutor = review.tutor_id ? usersById.get(review.tutor_id) : null;

        return {
          id: review.id,
          studentId: review.student_id,
          tutorId: review.tutor_id,
          studentName:
            review.student_name ||
            (student ? `${student.first_name || ''} ${student.last_name || ''}`.trim() : 'Élève'),
          studentEmail: student?.email || null,
          studentRole: review.student_role,
          tutorName: tutor ? `${tutor.first_name || ''} ${tutor.last_name || ''}`.trim() : 'SikaSchool',
          content: review.content,
          rating: Number(review.rating) || 0,
          avatarUrl: review.avatar_url,
          isApproved: Boolean(review.is_approved),
          createdAt: review.created_at,
          updatedAt: review.updated_at,
        };
      }),
    });
  } catch (error) {
    console.error('Erreur API reviews admin:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
