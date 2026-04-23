import { createHash, randomBytes } from 'node:crypto';
import { CREDENTIAL_TYPES } from '@/lib/constants';
import { supabaseAdmin } from '@/lib/supabase';

const OTP_TTL_MS = 10 * 60 * 1000;

function getOtpSecret(): string {
  return process.env.TWO_FA_OTP_SECRET || process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-dev-secret';
}

function hashOtp(code: string): string {
  return createHash('sha256').update(`${getOtpSecret()}:${code}`).digest('hex');
}

export function generateOtpCode(): string {
  const value = Math.floor(100000 + Math.random() * 900000);
  return String(value);
}

export function generateTicket(): string {
  return randomBytes(16).toString('hex');
}

export function normalizePhone(input: string): string {
  const trimmed = (input || '').trim();
  if (!trimmed.startsWith('+')) {
    return `+${trimmed.replace(/\D+/g, '')}`;
  }
  return `+${trimmed.slice(1).replace(/\D+/g, '')}`;
}

export function maskPhone(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const clean = phone.trim();
  if (clean.length <= 4) return clean;
  return `${clean.slice(0, 4)}******${clean.slice(-2)}`;
}

export function isTwilioConfigured(): boolean {
  return Boolean(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM_PHONE);
}

export async function sendTwilioSms(to: string, body: string): Promise<{ ok: boolean; error?: string }> {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_PHONE;

  if (!sid || !token || !from) {
    return { ok: false, error: 'Twilio non configuré (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_PHONE)' };
  }

  const form = new URLSearchParams();
  form.set('To', to);
  form.set('From', from);
  form.set('Body', body);

  const auth = Buffer.from(`${sid}:${token}`).toString('base64');
  const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  });

  if (!response.ok) {
    const details = await response.text();
    return { ok: false, error: `Twilio ${response.status}: ${details}` };
  }

  return { ok: true };
}

export async function isSms2faEnabled(userId: string): Promise<boolean> {
  const { data } = await (supabaseAdmin as any)
    .from('user_credentials')
    .select('credential_value, is_active')
    .eq('user_id', userId)
    .eq('credential_type', CREDENTIAL_TYPES.SMS_2FA_ENABLED)
    .maybeSingle();

  return Boolean(data?.is_active && data?.credential_value === 'true');
}

export async function getSms2faPhone(userId: string): Promise<string | null> {
  const { data } = await (supabaseAdmin as any)
    .from('user_credentials')
    .select('credential_value, is_active')
    .eq('user_id', userId)
    .eq('credential_type', CREDENTIAL_TYPES.SMS_2FA_PHONE)
    .maybeSingle();

  if (!data?.is_active) return null;
  return typeof data.credential_value === 'string' ? data.credential_value : null;
}

export async function saveSms2faPhone(userId: string, phone: string): Promise<void> {
  await (supabaseAdmin as any).from('user_credentials').upsert(
    {
      user_id: userId,
      credential_type: CREDENTIAL_TYPES.SMS_2FA_PHONE,
      credential_value: phone,
      is_active: true,
      expires_at: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,credential_type' }
  );
}

export async function setSms2faEnabled(userId: string, enabled: boolean): Promise<void> {
  await (supabaseAdmin as any).from('user_credentials').upsert(
    {
      user_id: userId,
      credential_type: CREDENTIAL_TYPES.SMS_2FA_ENABLED,
      credential_value: enabled ? 'true' : 'false',
      is_active: enabled,
      expires_at: null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,credential_type' }
  );
}

export async function createSetupCode(userId: string, phone: string): Promise<string> {
  const code = generateOtpCode();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();
  await (supabaseAdmin as any).from('user_credentials').upsert(
    {
      user_id: userId,
      credential_type: CREDENTIAL_TYPES.SMS_2FA_SETUP,
      credential_value: JSON.stringify({ codeHash: hashOtp(code), phone }),
      is_active: true,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,credential_type' }
  );
  return code;
}

export async function verifySetupCode(userId: string, phone: string, code: string): Promise<boolean> {
  const { data } = await (supabaseAdmin as any)
    .from('user_credentials')
    .select('credential_value, expires_at, is_active')
    .eq('user_id', userId)
    .eq('credential_type', CREDENTIAL_TYPES.SMS_2FA_SETUP)
    .maybeSingle();

  if (!data?.is_active) return false;
  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) return false;

  let parsed: any = null;
  try {
    parsed = JSON.parse(data.credential_value || '{}');
  } catch {
    return false;
  }

  if (!parsed?.codeHash || !parsed?.phone) return false;
  if (normalizePhone(parsed.phone) !== normalizePhone(phone)) return false;
  return parsed.codeHash === hashOtp(code);
}

export async function clearSetupCode(userId: string): Promise<void> {
  await (supabaseAdmin as any)
    .from('user_credentials')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('credential_type', CREDENTIAL_TYPES.SMS_2FA_SETUP);
}

export async function createLoginChallenge(userId: string, phone: string): Promise<{ ticket: string; code: string }> {
  const code = generateOtpCode();
  const ticket = generateTicket();
  const expiresAt = new Date(Date.now() + OTP_TTL_MS).toISOString();
  await (supabaseAdmin as any).from('user_credentials').upsert(
    {
      user_id: userId,
      credential_type: CREDENTIAL_TYPES.SMS_2FA_LOGIN,
      credential_value: JSON.stringify({ ticket, codeHash: hashOtp(code) }),
      is_active: true,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id,credential_type' }
  );
  return { ticket, code };
}

export async function verifyLoginChallenge(userId: string, ticket: string, code: string): Promise<boolean> {
  const { data } = await (supabaseAdmin as any)
    .from('user_credentials')
    .select('credential_value, expires_at, is_active')
    .eq('user_id', userId)
    .eq('credential_type', CREDENTIAL_TYPES.SMS_2FA_LOGIN)
    .maybeSingle();

  if (!data?.is_active) return false;
  if (data.expires_at && new Date(data.expires_at).getTime() < Date.now()) return false;

  let parsed: any = null;
  try {
    parsed = JSON.parse(data.credential_value || '{}');
  } catch {
    return false;
  }

  if (!parsed?.ticket || !parsed?.codeHash) return false;
  if (parsed.ticket !== ticket) return false;
  return parsed.codeHash === hashOtp(code);
}

export async function clearLoginChallenge(userId: string): Promise<void> {
  await (supabaseAdmin as any)
    .from('user_credentials')
    .update({ is_active: false, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .eq('credential_type', CREDENTIAL_TYPES.SMS_2FA_LOGIN);
}

