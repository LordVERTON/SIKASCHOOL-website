import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET(request: NextRequest) {
  const tokenHash = request.nextUrl.searchParams.get('token');
  if (!tokenHash) return NextResponse.json({ error: 'Jeton manquant' }, { status: 400 });

  const authClient = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  );
  const { error } = await authClient.auth.verifyOtp({ token_hash: tokenHash, type: 'email' });
  if (error) return NextResponse.json({ error: 'Lien invalide ou expiré' }, { status: 400 });
  return NextResponse.json({ success: true });
}
