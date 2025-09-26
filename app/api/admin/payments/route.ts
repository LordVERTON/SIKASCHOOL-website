import { NextRequest, NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { hasAdminPermissions } from '@/lib/admin-permissions';

export async function GET() {
  try {
    // Vérifier l'authentification
    const user = await getUserSession();
    if (!user || user.role !== 'TUTOR') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Vérifier les permissions admin
    if (!hasAdminPermissions(user)) {
      return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
    }

    // Récupérer tous les paiements
    const { data: payments, error } = await supabaseAdmin
      .from('session_payments')
      .select(`
        id,
        session_id,
        student_id,
        tutor_id,
        amount_cents,
        tutor_commission_cents,
        platform_commission_cents,
        status,
        paid_at,
        created_at,
        updated_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
    }

    // Récupérer les informations des utilisateurs
    const userIds = [...new Set([
      ...(payments as any)?.map((p: any) => p.student_id) || [],
      ...(payments as any)?.map((p: any) => p.tutor_id) || []
    ])];

    const { data: users, error: usersError } = await supabaseAdmin
      .from('users')
      .select('id, first_name, last_name')
      .in('id', userIds);

    if (usersError) {
      return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }

    // Créer un map des utilisateurs pour un accès rapide
    const usersMap = new Map((users as any)?.map((user: any) => [user.id, user]) || []);

    // Formater les données pour l'affichage
    const formattedPayments = (payments as any)?.map((payment: any) => {
      const student = usersMap.get(payment.student_id);
      const tutor = usersMap.get(payment.tutor_id);
      
      return {
        id: payment.id,
        session_id: payment.session_id,
        student_id: payment.student_id,
        tutor_id: payment.tutor_id,
        student_name: student ? `${(student as any).first_name} ${(student as any).last_name}` : 'N/A',
        tutor_name: tutor ? `${(tutor as any).first_name} ${(tutor as any).last_name}` : 'N/A',
        amount_cents: payment.amount_cents,
        tutor_commission_cents: payment.tutor_commission_cents,
        platform_commission_cents: payment.platform_commission_cents,
        status: payment.status,
        paid_at: payment.paid_at,
        created_at: payment.created_at,
        updated_at: payment.updated_at
      };
    }) || [];

    return NextResponse.json(formattedPayments);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
