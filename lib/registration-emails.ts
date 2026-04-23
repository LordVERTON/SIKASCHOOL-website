import { randomBytes } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Resend } from 'resend';
import { APP_CONFIG, CREDENTIAL_TYPES } from '@/lib/constants';
import { getAdminTutorEmails } from '@/lib/admin-permissions';

/** Client service-role : les types générés ne couvrent pas toutes les tables utilisées ici. */
type ServiceSupabase = SupabaseClient<any>;

const VERIFY_TTL_MS = 48 * 60 * 60 * 1000;

export function getAppBaseUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) {
    return explicit.replace(/\/$/, '');
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/^https?:\/\//, '')}`;
  }
  return 'http://localhost:3000';
}

function getResend(): Resend | null {
  const key = process.env.RESEND_API_KEY?.trim();
  if (!key) {
    return null;
  }
  return new Resend(key);
}

function getFromAddress(): string | null {
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!from) {
    console.warn('[email] RESEND_FROM_EMAIL manquant — configurez une adresse d’expéditeur vérifiée dans Resend.');
    return null;
  }
  return from;
}

/**
 * Génère un jeton, l’enregistre dans user_credentials (upsert) et retourne le jeton brut pour le lien e-mail.
 */
export async function upsertEmailVerificationToken(
  supabase: ServiceSupabase,
  userId: string
): Promise<string | null> {
  const token = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + VERIFY_TTL_MS).toISOString();
  const now = new Date().toISOString();

  const { error } = await supabase.from('user_credentials').upsert(
    {
      user_id: userId,
      credential_type: CREDENTIAL_TYPES.EMAIL_VERIFICATION,
      credential_value: token,
      is_active: true,
      expires_at: expiresAt,
      updated_at: now,
    },
    { onConflict: 'user_id,credential_type' }
  );

  if (error) {
    console.error('[email] Échec enregistrement jeton de vérification:', error);
    return null;
  }
  return token;
}

export type VerifyEmailResult =
  | { ok: true }
  | { ok: false; error: 'missing_token' | 'invalid_or_expired' | 'server_error' };

export async function verifyEmailToken(
  supabase: ServiceSupabase,
  token: string | null
): Promise<VerifyEmailResult> {
  if (!token?.trim()) {
    return { ok: false, error: 'missing_token' };
  }
  const raw = token.trim();

  try {
    const { data: row, error: fetchError } = await supabase
      .from('user_credentials')
      .select('user_id, expires_at, is_active')
      .eq('credential_type', CREDENTIAL_TYPES.EMAIL_VERIFICATION)
      .eq('credential_value', raw)
      .eq('is_active', true)
      .maybeSingle();

    if (fetchError || !row) {
      return { ok: false, error: 'invalid_or_expired' };
    }

    if (row.expires_at && new Date(row.expires_at).getTime() < Date.now()) {
      return { ok: false, error: 'invalid_or_expired' };
    }

    const { error: userErr } = await supabase
      .from('users')
      .update({ email_verified: true, updated_at: new Date().toISOString() })
      .eq('id', row.user_id);

    if (userErr) {
      console.error('[email] Mise à jour email_verified:', userErr);
      return { ok: false, error: 'server_error' };
    }

    await supabase
      .from('user_credentials')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', row.user_id)
      .eq('credential_type', CREDENTIAL_TYPES.EMAIL_VERIFICATION);

    return { ok: true };
  } catch (e) {
    console.error('[email] verifyEmailToken:', e);
    return { ok: false, error: 'server_error' };
  }
}

export type NewUserRow = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
};

async function resolveAdminNotifyUsers(
  supabase: ServiceSupabase
): Promise<Array<{ id: string; email: string; role: string }>> {
  const tutorAdminEmails = getAdminTutorEmails();
  const extra =
    process.env.ADMIN_NOTIFY_EMAILS?.split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean) ?? [];
  const emailSet = new Set([...tutorAdminEmails.map((e) => e.toLowerCase()), ...extra]);
  const emails = Array.from(emailSet);

  const { data: roleAdmins, error: e1 } = await supabase
    .from('users')
    .select('id, email, role')
    .eq('role', 'ADMIN')
    .eq('is_active', true);

  if (e1) {
    console.error('[email] Lecture admins (rôle):', e1);
  }

  let listed: Array<{ id: string; email: string; role: string }> = [];
  if (emails.length > 0) {
    const { data: byEmail, error: e2 } = await supabase
      .from('users')
      .select('id, email, role')
      .in('email', emails)
      .eq('is_active', true);
    if (e2) {
      console.error('[email] Lecture admins (e-mails):', e2);
    }
    listed = byEmail ?? [];
  }

  const map = new Map<string, { id: string; email: string; role: string }>();
  for (const u of [...(roleAdmins ?? []), ...listed]) {
    if (u?.email) {
      map.set(u.email.toLowerCase(), u);
    }
  }
  return Array.from(map.values());
}

/**
 * Notifications in-app (table notifications) pour les admins — même logique métier que l’historique signup.
 */
export async function insertAdminNewStudentNotifications(
  supabase: ServiceSupabase,
  newUser: NewUserRow
): Promise<void> {
  const admins = await resolveAdminNotifyUsers(supabase);
  if (admins.length === 0) {
    return;
  }
  const studentName = `${newUser.first_name} ${newUser.last_name}`.trim();
  const adminNotifications = admins.map((admin) => ({
    user_id: admin.id,
    type: 'SYSTEM' as const,
    title: 'Nouvelle inscription',
    message: `${studentName} (${newUser.email}) vient de s'inscrire sur la plateforme. Veuillez assigner un tuteur à cet élève.`,
    data: {
      action: 'NEW_STUDENT_REGISTRATION',
      student_id: newUser.id,
      student_name: studentName,
      student_email: newUser.email,
      registered_at: new Date().toISOString(),
    },
    is_read: false,
  }));

  const { error } = await supabase.from('notifications').insert(adminNotifications as any);
  if (error) {
    console.error('[email] Insert notifications admin:', error);
  }
}

/**
 * Notification élève affichée dès la première connexion pour rappeler
 * de changer le mot de passe initial.
 */
export async function insertStudentPasswordChangeNotification(
  supabase: ServiceSupabase,
  userId: string,
  source: 'signup_form' | 'lead_form' | 'register_form' = 'signup_form'
): Promise<void> {
  const { error } = await supabase.from('notifications').insert({
    user_id: userId,
    type: 'PASSWORD',
    title: 'Sécurisez votre compte',
    message:
      'Après votre première connexion, pensez à modifier votre mot de passe depuis votre espace.',
    data: {
      action: 'CHANGE_PASSWORD_RECOMMENDED',
      source,
      created_at: new Date().toISOString(),
    },
    is_read: false,
  } as any);

  if (error) {
    console.error('[email] Insert notification changement mot de passe:', error);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildVerificationEmailHtml(params: {
  firstName: string;
  verifyUrl: string;
}): string {
  const name = params.firstName?.trim() || 'Bonjour';
  return `
  <p>${escapeHtml(name)},</p>
  <p>Merci de rejoindre ${APP_CONFIG.NAME}.</p>
  <p><strong>Confirmez votre adresse e-mail</strong> (lien valable 48 h) :</p>
  <p><a href="${params.verifyUrl}">Confirmer mon adresse e-mail</a></p>
  <p>Si vous n’êtes pas à l’origine de cette inscription, ignorez ce message.</p>
  `;
}

function buildPasswordEmailHtml(params: {
  firstName: string;
  plainPassword: string;
  signinUrl: string;
}): string {
  const name = params.firstName?.trim() || 'Bonjour';
  return `
  <p>${escapeHtml(name)},</p>
  <p>Voici votre mot de passe de connexion pour ${APP_CONFIG.NAME} :</p>
  <p style="font-family:monospace;font-size:15px;padding:10px 12px;background:#f4f4f5;border-radius:8px;">${escapeHtml(
    params.plainPassword
  )}</p>
  <p>Par sécurité, nous vous recommandons de le modifier juste après votre première connexion.</p>
  <p><a href="${params.signinUrl}">Se connecter</a></p>
  <p style="font-size:12px;color:#666;">L’e-mail n’est pas un canal totalement sûr : évitez de le transférer et gardez ce message confidentiel.</p>
  <p>En cas de besoin, contactez <a href="mailto:${APP_CONFIG.SUPPORT_EMAIL}">${APP_CONFIG.SUPPORT_EMAIL}</a>.</p>
  `;
}

function buildAdminNewStudentHtml(student: NewUserRow, adminUrl: string): string {
  const name = `${student.first_name} ${student.last_name}`.trim();
  return `
  <p>Un nouvel élève s’est inscrit sur ${APP_CONFIG.NAME}.</p>
  <ul>
    <li><strong>Nom :</strong> ${name}</li>
    <li><strong>E-mail :</strong> ${student.email}</li>
    <li><strong>Rôle :</strong> ${student.role}</li>
  </ul>
  <p>Vous pouvez assigner un ou plusieurs tuteurs depuis l’administration (lien direct vers cet élève) :</p>
  <p><a href="${adminUrl}">Ouvrir les affectations</a></p>
  `;
}

/**
 * Envoie l’e-mail de vérification à l’utilisateur et un e-mail récap aux admins (élèves uniquement pour le mail admin).
 * Les erreurs Resend sont journalisées ; l’inscription peut quand même réussir.
 */
export async function sendRegistrationResendEmails(
  supabase: ServiceSupabase,
  options: {
    newUser: NewUserRow;
    verifyToken: string | null;
    /** Mot de passe saisi à l’inscription, uniquement pour l’e-mail de rappel (jamais journalisé). */
    plainPassword?: string | null;
  }
): Promise<void> {
  const resend = getResend();
  const from = getFromAddress();
  if (!resend || !from) {
    if (!process.env.RESEND_API_KEY) {
      console.warn('[email] RESEND_API_KEY absent — e-mails de confirmation non envoyés.');
    }
    return;
  }

  const base = getAppBaseUrl();
  const signinUrl = `${base}/auth/signin`;
  const adminPath =
    options.newUser.role === 'STUDENT'
      ? `/tutor/administration?tab=assignments&studentId=${encodeURIComponent(options.newUser.id)}`
      : '/tutor/administration?tab=assignments';

  const verifyUrl = options.verifyToken
    ? `${base}/auth/verify-email?token=${encodeURIComponent(options.verifyToken)}`
    : null;
  const plainPassword = options.plainPassword?.trim() || null;
  if (verifyUrl) {
    const { error } = await resend.emails.send({
      from,
      to: options.newUser.email,
      subject: `Confirmez votre adresse e-mail - ${APP_CONFIG.NAME}`,
      html: buildVerificationEmailHtml({
        firstName: options.newUser.first_name,
        verifyUrl,
      }),
    });
    if (error) {
      console.error('[email] Envoi e-mail de confirmation:', error);
    }
  }

  if (plainPassword) {
    const { error } = await resend.emails.send({
      from,
      to: options.newUser.email,
      subject: `Vos informations de connexion - ${APP_CONFIG.NAME}`,
      html: buildPasswordEmailHtml({
        firstName: options.newUser.first_name,
        plainPassword,
        signinUrl,
      }),
    });
    if (error) {
      console.error('[email] Envoi e-mail mot de passe:', error);
    }
  }

  if (options.newUser.role === 'STUDENT') {
    const admins = await resolveAdminNotifyUsers(supabase);
    const adminEmails = admins.map((a) => a.email).filter(Boolean);
    if (adminEmails.length === 0) {
      return;
    }
    const adminUrl = `${base}${adminPath}`;
    const studentName = `${options.newUser.first_name} ${options.newUser.last_name}`.trim();
    const { error } = await resend.emails.send({
      from,
      to: adminEmails,
      subject: `[${APP_CONFIG.NAME}] Nouvel élève : ${studentName}`,
      html: buildAdminNewStudentHtml(options.newUser, adminUrl),
    });
    if (error) {
      console.error('[email] Envoi notification admins:', error);
    }
  }
}
