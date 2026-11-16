import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth';
import { canAccessAdminFeatures } from '@/lib/admin-permissions';
import { supabaseAdmin } from '@/lib/supabase';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET() {
  const headers = { 'Cache-Control': 'no-store' };
  try {
    const user = await getUserSession();
    if (!user || !canAccessAdminFeatures(user)) {
      return NextResponse.json({ error: 'Accès refusé' }, { status: 403, headers });
    }
    // HEAD + limit: no business records returned, bounded request, no writes/e-mails.
    const { error } = await supabaseAdmin.from('profiles').select('id', { head: true })
      .limit(1).abortSignal(AbortSignal.timeout(5000));
    if (error) throw new Error('Database unavailable');
    return NextResponse.json({ app: 'up', database: 'up' }, { headers });
  } catch {
    return NextResponse.json({ app: 'up', database: 'unavailable' }, { status: 503, headers });
  }
}
