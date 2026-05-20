import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { getUserSession } from '@/lib/auth-simple';
import { canAccessAdminFeatures } from '@/lib/admin-permissions';
import {
  getAdminNewStudentEmailRecipients,
  getAppBaseUrl,
  getMailFromAddress,
} from '@/lib/registration-emails';

function pickTestRecipients(request: NextRequest): string | string[] {
  const fromQuery = request.nextUrl.searchParams.get('to')?.trim();
  if (fromQuery) {
    return fromQuery;
  }
  const adminEmails = getAdminNewStudentEmailRecipients();
  if (adminEmails.length > 0) return adminEmails;
  return 'delivered@resend.dev';
}

export async function GET(request: NextRequest) {
  try {
    const user = await getUserSession();
    if (!user || !canAccessAdminFeatures(user)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const apiKey = process.env.RESEND_API_KEY?.trim();
    const from = getMailFromAddress();
    const appUrl = getAppBaseUrl();
    const to = pickTestRecipients(request);

    const missing: string[] = [];
    if (!apiKey) {
      missing.push('RESEND_API_KEY');
    }
    if (!process.env.NEXT_PUBLIC_APP_URL && !process.env.VERCEL_URL) {
      missing.push('NEXT_PUBLIC_APP_URL (or VERCEL_URL)');
    }

    if (missing.length > 0) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Configuration Resend incomplète',
          missing,
        },
        { status: 400 }
      );
    }

    const resend = new Resend(apiKey);
    const fromAddress = from as string;
    const { data, error } = await resend.emails.send({
      from: fromAddress,
      to,
      subject: 'SikaSchool - test Resend',
      html: `
        <p>Test Resend OK depuis SikaSchool.</p>
        <p><strong>Triggered by:</strong> ${user.email}</p>
        <p><strong>App URL:</strong> ${appUrl}</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `,
    });

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          message: 'Echec envoi email test',
          resendError: error,
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      ok: true,
      message: 'Resend configuré et email test envoyé',
      emailId: data?.id ?? null,
      sentTo: to,
      from: fromAddress,
      appUrl,
    });
  } catch (error) {
    console.error('[resend-health] unexpected error:', error);
    return NextResponse.json({ ok: false, error: 'Internal server error' }, { status: 500 });
  }
}
