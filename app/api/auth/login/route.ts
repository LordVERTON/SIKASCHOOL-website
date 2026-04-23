import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser, setUserSession } from '@/lib/auth-simple';
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
    const { email, password, twoFactorCode, twoFactorTicket } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'E-mail et mot de passe requis' },
        { status: 400 }
      );
    }

    const user = await authenticateUser(email, password);

    if (!user) {
      return NextResponse.json(
        { error: 'E-mail ou mot de passe incorrect' },
        { status: 401 }
      );
    }

    const twoFactorEnabled = await isSms2faEnabled(user.id);
    if (twoFactorEnabled) {
      if (!isTwilioConfigured()) {
        return NextResponse.json(
          { error: '2FA activée mais Twilio non configuré côté serveur' },
          { status: 500 }
        );
      }

      const phone = await getSms2faPhone(user.id);
      if (!phone) {
        return NextResponse.json(
          { error: '2FA activée mais numéro SMS introuvable, contactez le support' },
          { status: 500 }
        );
      }

      const hasCode = typeof twoFactorCode === 'string' && twoFactorCode.trim().length > 0;
      const hasTicket = typeof twoFactorTicket === 'string' && twoFactorTicket.trim().length > 0;

      if (!hasCode || !hasTicket) {
        const challenge = await createLoginChallenge(user.id, phone);
        const sms = await sendTwilioSms(
          phone,
          `SikaSchool: votre code de connexion est ${challenge.code}. Il expire dans 10 minutes.`
        );
        if (!sms.ok) {
          return NextResponse.json({ error: sms.error || 'Impossible d’envoyer le code SMS' }, { status: 502 });
        }
        return NextResponse.json(
          {
            success: false,
            requiresTwoFactor: true,
            twoFactorTicket: challenge.ticket,
            message: `Code SMS envoyé vers ${maskPhone(phone)}`,
          },
          { status: 202 }
        );
      }

      const valid = await verifyLoginChallenge(user.id, String(twoFactorTicket), String(twoFactorCode).trim());
      if (!valid) {
        return NextResponse.json({ error: 'Code de double authentification invalide ou expiré' }, { status: 401 });
      }
      await clearLoginChallenge(user.id);
    }

    await setUserSession(user);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Erreur de connexion:', error);
    return NextResponse.json(
      { error: 'Erreur interne du serveur' },
      { status: 500 }
    );
  }
}
