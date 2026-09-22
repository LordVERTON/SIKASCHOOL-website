import { NextRequest, NextResponse } from 'next/server';
import { AuthError } from 'next-auth';
import { createClient } from '@supabase/supabase-js';
import { signIn } from '@/auth';
import { supabaseAdmin } from '@/lib/supabase';
import {
  clearLoginChallenge,
  createLoginChallenge,
  getSms2faPhone,
  isSms2faEnabled,
  sendTwilioSms,
  maskPhone,
  isTwilioConfigured,
  verifyLoginChallenge,
} from '@/lib/sms-2fa';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const email = typeof body?.email === 'string' ? body.email.trim().toLowerCase() : '';
    const password = typeof body?.password === 'string' ? body.password : '';

    if (!email || !password) {
      return NextResponse.json({ error: 'E-mail et mot de passe requis' }, { status: 400 });
    }

    // Supabase Auth is the credential authority. This first call obtains the
    // immutable Auth user id needed by the optional SMS challenge.
    const authClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
    );
    const { data: authData, error: authError } = await authClient.auth.signInWithPassword({
      email,
      password,
    });
    if (authError || !authData.user) {
      return NextResponse.json({ error: 'E-mail ou mot de passe incorrect' }, { status: 401 });
    }

    const userId = authData.user.id;
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('first_name, last_name, role, is_active')
      .eq('id', userId)
      .single();
    if (!profile?.is_active) {
      return NextResponse.json({ error: 'Compte désactivé' }, { status: 403 });
    }
    if (await isSms2faEnabled(userId)) {
      if (!isTwilioConfigured()) {
        return NextResponse.json(
          { error: '2FA activée mais Twilio non configuré côté serveur' },
          { status: 500 },
        );
      }

      const phone = await getSms2faPhone(userId);
      if (!phone) {
        return NextResponse.json(
          { error: '2FA activée mais aucun téléphone vérifié n’est disponible' },
          { status: 500 },
        );
      }

      const code = typeof body?.twoFactorCode === 'string' ? body.twoFactorCode.trim() : '';
      const ticket = typeof body?.twoFactorTicket === 'string' ? body.twoFactorTicket.trim() : '';

      if (!code || !ticket) {
        const challenge = await createLoginChallenge(userId, phone);
        const sms = await sendTwilioSms(
          phone,
          `SikaSchool: votre code de connexion est ${challenge.code}. Il expire dans 10 minutes.`,
        );
        if (!sms.ok) return NextResponse.json({ error: sms.error }, { status: 502 });

        return NextResponse.json(
          {
            success: false,
            requiresTwoFactor: true,
            twoFactorTicket: challenge.ticket,
            message: `Code envoyé au ${maskPhone(phone)}`,
          },
          { status: 202 },
        );
      }

      if (!(await verifyLoginChallenge(userId, ticket, code))) {
        return NextResponse.json({ error: 'Code de double authentification invalide ou expiré' }, { status: 401 });
      }
      await clearLoginChallenge(userId);
    }

    await signIn('credentials', { email, password, redirect: false });

    return NextResponse.json({
      success: true,
      user: {
        id: authData.user.id,
        email: authData.user.email,
        name: `${profile.first_name} ${profile.last_name}`.trim(),
        role: profile.role,
      },
    });
  } catch (error) {
    if (error instanceof AuthError) {
      return NextResponse.json({ error: 'E-mail ou mot de passe incorrect' }, { status: 401 });
    }
    console.error('[auth/login]', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}
