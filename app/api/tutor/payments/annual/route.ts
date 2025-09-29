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

    const { data, error } = await (supabaseAdmin as any)
      .rpc('sum_payments_per_year', { tutor_id_param: user.id });

    if (error) {
      console.warn('annual summary fallback, rpc missing -> computing client-side');
    }

    // Fallback: compute from session_payments if RPC not available
    let rows = data;
    if (!rows) {
      const { data: payments } = await (supabaseAdmin as any)
        .from('session_payments')
        .select('amount_cents, paid_at, status')
        .eq('tutor_id', user.id)
        .eq('status', 'PAID');
      const map: Record<string, number> = {};
      for (const p of payments || []) {
        const year = (p.paid_at ? new Date(p.paid_at) : new Date()).getFullYear();
        map[year] = (map[year] || 0) + (p.amount_cents || 0);
      }
      rows = Object.entries(map).map(([year, cents]) => ({ year: Number(year), netCents: cents, pasCents: 0 }));
    }

    const summary = (rows || []).sort((a: any, b: any) => b.year - a.year).map((r: any) => ({
      year: r.year,
      netCents: r.netCents ?? r.amount_cents ?? 0,
      pasCents: r.pasCents ?? 0,
    }));

    return NextResponse.json({ summary });
  } catch (e) {
    console.error('annual route error', e);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}


