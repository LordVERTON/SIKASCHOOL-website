/**
 * GET /api/student/payments/overview
 *
 * Retourne en une seule requête :
 *  - le solde de séances par niveau (student_credits)
 *  - l'historique des paiements (payments)
 *  - l'éventuel abonnement actif (subscriptions)
 *
 * Utilisé par /student/paiements pour éviter le waterfall.
 */

import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { canAccessStudentFeatures, getEffectiveStudentAccess } from '@/lib/student-access';

export async function GET() {
  try {
    const user = await getUserSession();
    if (!canAccessStudentFeatures(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const access = await getEffectiveStudentAccess(user);
    if (!access) {
      return NextResponse.json({ error: 'Aucun élève lié à ce compte parent' }, { status: 404 });
    }
    const studentId = access.effectiveStudentId;

    const [creditsRes, paymentsRes, subscriptionRes] = await Promise.all([
      supabaseAdmin
        .from('student_credits')
        .select('level, remaining_sessions, total_purchased, total_consumed')
        .eq('student_id', studentId),
      supabaseAdmin
        .from('payments')
        .select(
          'id, plan_id, kind, level, sessions_count, amount_cents, currency, status, receipt_url, hosted_invoice_url, invoice_pdf_url, created_at, paid_at'
        )
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
        .limit(50),
      supabaseAdmin
        .from('subscriptions')
        .select(
          'id, stripe_subscription_id, plan_id, level, status, current_period_start, current_period_end, cancel_at_period_end, canceled_at'
        )
        .eq('student_id', studentId)
        .in('status', ['active', 'trialing', 'past_due', 'incomplete'])
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle(),
    ]);

    return NextResponse.json({
      credits: creditsRes.data ?? [],
      payments: paymentsRes.data ?? [],
      subscription: subscriptionRes.data ?? null,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[payments/overview] error', error);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
