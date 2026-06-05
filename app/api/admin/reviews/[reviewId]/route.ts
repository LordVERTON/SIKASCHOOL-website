import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { canAccessAdminFeatures } from '@/lib/admin-permissions';
import { supabaseAdmin } from '@/lib/supabase';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const user = await getUserSession();
    if (!user || !canAccessAdminFeatures(user)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { reviewId } = await params;
    const body = await request.json().catch(() => ({}));
    const isApproved = Boolean(body?.isApproved);

    const { data: review, error } = await (supabaseAdmin as any)
      .from('reviews')
      .update({
        is_approved: isApproved,
        updated_at: new Date().toISOString(),
      })
      .eq('id', reviewId)
      .select('id, is_approved')
      .single();

    if (error) {
      console.error('Erreur modération review admin:', error);
      return NextResponse.json({ error: 'Impossible de modifier le commentaire' }, { status: 500 });
    }

    return NextResponse.json({ review, message: isApproved ? 'Commentaire publié' : 'Commentaire masqué' });
  } catch (error) {
    console.error('Erreur API modération review admin:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ reviewId: string }> }
) {
  try {
    const user = await getUserSession();
    if (!user || !canAccessAdminFeatures(user)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { reviewId } = await params;
    const { error } = await (supabaseAdmin as any)
      .from('reviews')
      .delete()
      .eq('id', reviewId);

    if (error) {
      console.error('Erreur suppression review admin:', error);
      return NextResponse.json({ error: 'Impossible de supprimer le commentaire' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Commentaire supprimé' });
  } catch (error) {
    console.error('Erreur API suppression review admin:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
