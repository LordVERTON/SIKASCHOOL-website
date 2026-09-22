import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { sendPasswordResetEmail } from '@/lib/registration-emails';

const GENERIC_MESSAGE =
  'Si cette adresse e-mail existe dans notre système, un lien de réinitialisation a été envoyé.';

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (!email) return NextResponse.json({ error: 'Adresse e-mail requise' }, { status: 400 });

  try {
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: 'recovery',
      email,
    });
    if (error || !data.user || !data.properties?.hashed_token) {
      return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('first_name')
      .eq('id', data.user.id)
      .maybeSingle();

    await sendPasswordResetEmail({
      to: email,
      firstName: profile?.first_name,
      resetToken: data.properties.hashed_token,
    });

    return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
  } catch (error) {
    console.error('[auth/forgot-password]', error);
    return NextResponse.json({ success: true, message: GENERIC_MESSAGE });
  }
}
