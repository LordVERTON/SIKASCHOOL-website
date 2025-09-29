import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import { supabaseAdmin } from '@/lib/supabase';
import { canAccessTutorFeatures } from '@/lib/admin-permissions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getUserSession();
    if (!user || !canAccessTutorFeatures(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Using session_payments as payouts source
    const { data, error } = await (supabaseAdmin as any)
      .from('session_payments')
      .select('paid_at, amount_cents')
      .eq('tutor_id', user.id)
      .eq('status', 'PAID')
      .order('paid_at', { ascending: false });

    if (error) {
      console.error('payouts error', error);
      return NextResponse.json({ error: 'Failed to load' }, { status: 500 });
    }

    const payouts = (data || []).map((p: any) => ({
      date: p.paid_at,
      amountCents: p.amount_cents,
      accountMasked: 'FR******************88122**',
    }));

    return NextResponse.json({ payouts });
  } catch (e) {
    console.error('payouts route error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


