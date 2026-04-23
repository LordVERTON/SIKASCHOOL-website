import { NextResponse } from 'next/server';
import { getUserSession } from '@/lib/auth-simple';
import {
  clearSetupCode,
  createSetupCode,
  getSms2faPhone,
  isSms2faEnabled,
  isTwilioConfigured,
  maskPhone,
  normalizePhone,
  saveSms2faPhone,
  sendTwilioSms,
  setSms2faEnabled,
  verifySetupCode,
} from '@/lib/sms-2fa';

export async function GET() {
  const user = await getUserSession();
  if (!user || user.role !== 'STUDENT') {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const enabled = await isSms2faEnabled(user.id);
  const phone = await getSms2faPhone(user.id);
  return NextResponse.json({
    enabled,
    phoneMasked: maskPhone(phone),
    twilioConfigured: isTwilioConfigured(),
  });
}

export async function POST(request: Request) {
  try {
    const user = await getUserSession();
    if (!user || user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const action = String(body.action || '');

    if (action === 'disable') {
      await setSms2faEnabled(user.id, false);
      return NextResponse.json({ success: true });
    }

    if (action === 'send_setup_code') {
      const rawPhone = String(body.phone || '');
      const phone = normalizePhone(rawPhone);
      if (!phone || phone.length < 8) {
        return NextResponse.json({ error: 'Numéro invalide. Utilisez un format international (+33...)' }, { status: 400 });
      }
      const code = await createSetupCode(user.id, phone);
      const sms = await sendTwilioSms(phone, `SikaSchool: votre code de verification 2FA est ${code}. Il expire dans 10 minutes.`);
      if (!sms.ok) {
        return NextResponse.json({ error: sms.error || 'Erreur envoi SMS' }, { status: 502 });
      }
      return NextResponse.json({ success: true, message: 'Code SMS envoyé.' });
    }

    if (action === 'verify_setup_code') {
      const rawPhone = String(body.phone || '');
      const code = String(body.code || '').trim();
      const phone = normalizePhone(rawPhone);
      if (!code) {
        return NextResponse.json({ error: 'Code requis' }, { status: 400 });
      }
      const valid = await verifySetupCode(user.id, phone, code);
      if (!valid) {
        return NextResponse.json({ error: 'Code invalide ou expiré' }, { status: 400 });
      }

      await saveSms2faPhone(user.id, phone);
      await setSms2faEnabled(user.id, true);
      await clearSetupCode(user.id);
      return NextResponse.json({ success: true, message: '2FA SMS activée.' });
    }

    return NextResponse.json({ error: 'Action invalide' }, { status: 400 });
  } catch (error) {
    console.error('Erreur API 2FA student:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
  }
}

