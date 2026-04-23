import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { verifyEmailToken } from '@/lib/registration-emails';

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get('token');
  const result = await verifyEmailToken(supabaseAdmin, token);

  if (result.ok) {
    return NextResponse.json({ success: true });
  }

  const status = result.error === 'server_error' ? 500 : 400;
  const message =
    result.error === 'missing_token'
      ? 'Jeton manquant'
      : result.error === 'invalid_or_expired'
        ? 'Lien invalide ou expiré'
        : 'Erreur serveur';

  return NextResponse.json({ success: false, error: message }, { status });
}
