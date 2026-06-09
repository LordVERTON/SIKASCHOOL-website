import { randomBytes } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import nodemailer, { type Transporter } from 'nodemailer';
import { Resend } from 'resend';
import { APP_CONFIG, CREDENTIAL_TYPES } from '@/lib/constants';
import { getAdminTutorEmails } from '@/lib/admin-permissions';

/** Client service-role : les types générés ne couvrent pas toutes les tables utilisées ici. */
type ServiceSupabase = SupabaseClient<any>;

const VERIFY_TTL_MS = 48 * 60 * 60 * 1000;
const DEFAULT_FROM_ADDRESS = 'SikaSchool <noreply@sikaschool.app>';
const DEFAULT_ADMIN_NEW_STUDENT_EMAILS = [
  'sikaschoolservice@gmail.com',
  'mbouza.ruudy@gmail.com',
  'dan.verton@pm.me',
];
let smtpTransporter: Transporter | null = null;

type EmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
};

type MailProvider = 'resend' | 'smtp';

function parseEmailList(value: string | undefined): string[] {
  return (
    value
      ?.split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean) ?? []
  );
}

export function getAdminNewStudentEmailRecipients(): string[] {
  const configured = parseEmailList(process.env.ADMIN_NEW_STUDENT_NOTIFY_EMAILS);
  return configured.length > 0 ? configured : DEFAULT_ADMIN_NEW_STUDENT_EMAILS;
}

export function getMailFromAddress(): string {
  return (
    process.env.MAIL_FROM_EMAIL?.trim() ||
    process.env.RESEND_FROM_EMAIL?.trim() ||
    DEFAULT_FROM_ADDRESS
  );
}

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
  const from = getMailFromAddress();
  if (!from) {
    console.warn('[email] MAIL_FROM_EMAIL/RESEND_FROM_EMAIL manquant — configurez une adresse d’expéditeur.');
    return null;
  }
  return from;
}

function getMailProvider(): MailProvider {
  const provider = process.env.MAIL_PROVIDER?.trim().toLowerCase();
  if (provider === 'smtp' || provider === 'mailpit') {
    return 'smtp';
  }
  if (provider === 'resend') {
    return 'resend';
  }
  if (process.env.NODE_ENV === 'production') {
    return 'resend';
  }
  return 'smtp';
}

function getSmtpTransporter(): Transporter | null {
  if (smtpTransporter) {
    return smtpTransporter;
  }

  const host = process.env.SMTP_HOST?.trim() || (process.env.NODE_ENV === 'production' ? '' : '127.0.0.1');
  if (!host) {
    return null;
  }

  const portRaw = process.env.SMTP_PORT?.trim();
  const parsedPort = portRaw ? Number(portRaw) : 1025;
  const port = Number.isFinite(parsedPort) ? parsedPort : 1025;
  const secure = (process.env.SMTP_SECURE?.trim() || 'false').toLowerCase() === 'true';
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();

  smtpTransporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: user && pass ? { user, pass } : undefined,
  });

  return smtpTransporter;
}

async function sendEmail(payload: EmailPayload): Promise<void> {
  const provider = getMailProvider();
  const from = getFromAddress();
  if (!from) {
    return;
  }

  if (provider === 'resend') {
    const resend = getResend();
    if (!resend) {
      console.warn('[email] MAIL_PROVIDER=resend mais RESEND_API_KEY est absent.');
      return;
    }
    const { error } = await resend.emails.send({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
    if (error) {
      console.error('[email] Envoi Resend échoué :', error);
    }
    return;
  }

  const transporter = getSmtpTransporter();
  if (!transporter) {
    console.warn('[email] SMTP_HOST absent — configurez Mailpit/SMTP pour les emails en local.');
    return;
  }

  try {
    await transporter.sendMail({
      from,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
    });
  } catch (error) {
    console.error('[email] Envoi SMTP échoué :', error);
  }
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
      console.error('[email] Échec de mise à jour email_verified :', userErr);
      return { ok: false, error: 'server_error' };
    }

    await supabase
      .from('user_credentials')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('user_id', row.user_id)
      .eq('credential_type', CREDENTIAL_TYPES.EMAIL_VERIFICATION);

    return { ok: true };
  } catch (e) {
    console.error('[email] Erreur verifyEmailToken :', e);
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

export type RegistrationIntakeDetails = {
  civility?: string;
  phone?: string;
  zip?: string;
  level?: string;
  subject?: string;
  goal?: string;
  goalOther?: string;
  goalSummary?: string;
  contest?: string;
  accountType?: string;
  capturedAt?: string;
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
  newUser: NewUserRow,
  intakeDetails?: RegistrationIntakeDetails
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
      phone: intakeDetails?.phone || null,
      zip: intakeDetails?.zip || null,
      level: intakeDetails?.level || null,
      subject: intakeDetails?.subject || null,
      goal: intakeDetails?.goalSummary || intakeDetails?.goal || null,
      contest: intakeDetails?.contest || null,
      account_type: intakeDetails?.accountType || null,
      registered_at: new Date().toISOString(),
    },
    is_read: false,
  }));

  const { error } = await supabase.from('notifications').insert(adminNotifications as any);
  if (error) {
    console.error('[email] Échec insertion notifications admin :', error);
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
    console.error('[email] Échec insertion notification changement mot de passe :', error);
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
  <p>Pour confirmer votre adresse e-mail, cliquez sur le lien ci-dessous. Ce lien reste valable 48&nbsp;h&nbsp;:</p>
  <p><a href="${params.verifyUrl}">Je confirme mon adresse e-mail</a></p>
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

function buildPasswordResetEmailHtml(params: {
  firstName: string;
  resetUrl: string;
}): string {
  const name = params.firstName?.trim() || 'Bonjour';
  return `
  <p>${escapeHtml(name)},</p>
  <p>Vous avez demandé la réinitialisation de votre mot de passe ${APP_CONFIG.NAME}.</p>
  <p>Pour choisir un nouveau mot de passe, cliquez sur le lien ci-dessous (valable 1 heure) :</p>
  <p><a href="${params.resetUrl}">Réinitialiser mon mot de passe</a></p>
  <p>Si vous n’êtes pas à l’origine de cette demande, ignorez ce message.</p>
  <p>Besoin d’aide ? Contactez <a href="mailto:${APP_CONFIG.SUPPORT_EMAIL}">${APP_CONFIG.SUPPORT_EMAIL}</a>.</p>
  `;
}

function buildAdminNewStudentHtml(
  student: NewUserRow,
  adminUrl: string,
  intakeDetails?: RegistrationIntakeDetails
): string {
  const name = `${student.first_name} ${student.last_name}`.trim();
  const details: Array<[string, string | undefined]> = [
    ['Civilité', intakeDetails?.civility],
    ['Téléphone', intakeDetails?.phone],
    ['Code postal', intakeDetails?.zip],
    ['Type de compte', intakeDetails?.accountType === 'parent' ? 'Parent' : intakeDetails?.accountType === 'student' ? 'Élève' : intakeDetails?.accountType],
    ['Classe / niveau', intakeDetails?.level],
    ['Matière demandée', intakeDetails?.subject],
    ['Objectif', intakeDetails?.goalSummary || intakeDetails?.goal],
    ['Objectif précisé', intakeDetails?.goalOther],
    ['Concours', intakeDetails?.contest],
    [
      'Date de demande',
      intakeDetails?.capturedAt
        ? new Date(intakeDetails.capturedAt).toLocaleString('fr-FR', {
            dateStyle: 'short',
            timeStyle: 'short',
          })
        : '',
    ],
  ].filter((detail): detail is [string, string] => {
    const value = detail[1];
    return typeof value === 'string' && value.trim().length > 0;
  });

  return `
  <p>Un nouvel élève s’est inscrit sur ${APP_CONFIG.NAME}.</p>
  <ul>
    <li><strong>Nom :</strong> ${escapeHtml(name)}</li>
    <li><strong>E-mail :</strong> ${escapeHtml(student.email)}</li>
    <li><strong>Rôle :</strong> ${escapeHtml(student.role)}</li>
    ${details
      .map(
        ([label, value]) =>
          `<li><strong>${escapeHtml(label)} :</strong> ${escapeHtml(String(value))}</li>`
      )
      .join('')}
  </ul>
  <p>Vous pouvez assigner un ou plusieurs tuteurs depuis l’administration (lien direct vers cet élève) :</p>
  <p><a href="${adminUrl}">Ouvrir les affectations</a></p>
  `;
}

function buildStudentTutorAssignedEmailHtml(params: {
  studentFirstName: string;
  tutorName: string;
  bookingUrl: string;
}): string {
  const name = params.studentFirstName?.trim() || 'Bonjour';
  return `
  <p>${escapeHtml(name)},</p>
  <p>Bonne nouvelle : <strong>${escapeHtml(params.tutorName)}</strong> vient d'être assigné(e) à votre suivi sur ${APP_CONFIG.NAME}.</p>
  <p>Vous pouvez dès maintenant vous connecter à votre espace étudiant pour <strong>réserver une nouvelle séance</strong>.</p>
  <p><a href="${params.bookingUrl}">Accéder à mon espace étudiant et réserver</a></p>
  <p>À très vite sur ${APP_CONFIG.NAME}.</p>
  `;
}

function buildStudentSessionDecisionEmailHtml(params: {
  studentFirstName: string;
  tutorName: string;
  action: 'ACCEPTED' | 'REJECTED';
  subject: string;
  startedAt: string;
  appUrl: string;
}): string {
  const name = params.studentFirstName?.trim() || 'Bonjour';
  const subjectLabel = params.subject?.trim() || 'votre séance';
  const startedAtDate = new Date(params.startedAt);
  const isValidDate = !Number.isNaN(startedAtDate.getTime());
  const dateLabel = isValidDate
    ? startedAtDate.toLocaleDateString('fr-FR')
    : '';
  const timeLabel = isValidDate
    ? startedAtDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : '';
  const sessionLabel = dateLabel
    ? `${subjectLabel} du ${dateLabel}${timeLabel ? ` à ${timeLabel}` : ''}`
    : subjectLabel;
  const isAccepted = params.action === 'ACCEPTED';
  const tutorLabel = params.tutorName?.trim() || 'votre tuteur';

  return `
  <p>${escapeHtml(name)},</p>
  <p>${escapeHtml(tutorLabel)} a ${
    isAccepted ? 'confirmé' : 'refusé'
  } votre demande de séance <strong>${escapeHtml(sessionLabel)}</strong>.</p>
  ${
    isAccepted
      ? `<p>Rendez-vous dans votre espace étudiant pour consulter les détails de la séance.</p>`
      : `<p>Nous vous invitons à réserver une nouvelle séance depuis votre espace étudiant.</p>`
  }
  <p><a href="${params.appUrl}">Accéder à mon espace étudiant</a></p>
  <p>L’équipe ${APP_CONFIG.NAME}</p>
  `;
}

function buildTutorNewBookingRequestEmailHtml(params: {
  tutorFirstName: string;
  studentName: string;
  subject: string;
  startedAt: string;
  notificationsUrl: string;
}): string {
  const name = params.tutorFirstName?.trim() || 'Bonjour';
  const subjectLabel = params.subject?.trim() || 'Cours';
  const startedAtDate = new Date(params.startedAt);
  const isValidDate = !Number.isNaN(startedAtDate.getTime());
  const dateLabel = isValidDate ? startedAtDate.toLocaleDateString('fr-FR') : '';
  const timeLabel = isValidDate
    ? startedAtDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : '';

  return `
  <p>${escapeHtml(name)},</p>
  <p>Vous avez une <strong>nouvelle demande de séance</strong> de ${escapeHtml(params.studentName)}.</p>
  <ul>
    <li><strong>Matière :</strong> ${escapeHtml(subjectLabel)}</li>
    <li><strong>Date :</strong> ${escapeHtml(dateLabel || 'Non précisée')}</li>
    <li><strong>Heure :</strong> ${escapeHtml(timeLabel || 'Non précisée')}</li>
  </ul>
  <p>Connectez-vous à votre espace tuteur pour <strong>répondre à la demande (confirmer ou refuser)</strong>.</p>
  <p><a href="${params.notificationsUrl}">Voir la demande et répondre</a></p>
  <p>L’équipe ${APP_CONFIG.NAME}</p>
  `;
}

function buildTutorSessionCancelledEmailHtml(params: {
  tutorFirstName: string;
  cancelledByName: string;
  subject: string;
  startedAt: string;
  reason?: string | null;
  notificationsUrl: string;
}): string {
  const name = params.tutorFirstName?.trim() || 'Bonjour';
  const subjectLabel = params.subject?.trim() || 'Cours';
  const startedAtDate = new Date(params.startedAt);
  const isValidDate = !Number.isNaN(startedAtDate.getTime());
  const dateLabel = isValidDate ? startedAtDate.toLocaleDateString('fr-FR') : '';
  const timeLabel = isValidDate
    ? startedAtDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : '';

  return `
  <p>${escapeHtml(name)},</p>
  <p><strong>${escapeHtml(params.cancelledByName)}</strong> a annulé la séance suivante :</p>
  <ul>
    <li><strong>Matière :</strong> ${escapeHtml(subjectLabel)}</li>
    <li><strong>Date :</strong> ${escapeHtml(dateLabel || 'Non précisée')}</li>
    <li><strong>Heure :</strong> ${escapeHtml(timeLabel || 'Non précisée')}</li>
    ${
      params.reason
        ? `<li><strong>Raison :</strong> ${escapeHtml(params.reason)}</li>`
        : ''
    }
  </ul>
  <p>Consultez votre espace tuteur pour voir les détails mis à jour.</p>
  <p><a href="${params.notificationsUrl}">Ouvrir mes notifications tuteur</a></p>
  <p>L’équipe ${APP_CONFIG.NAME}</p>
  `;
}

function buildStudentSessionCancelledEmailHtml(params: {
  studentFirstName: string;
  tutorName: string;
  subject: string;
  startedAt: string;
  reason?: string | null;
  studentParticipantsCount?: number;
  studentUrl: string;
}): string {
  const name = params.studentFirstName?.trim() || 'Bonjour';
  const subjectLabel = params.subject?.trim() || 'Cours';
  const startedAtDate = new Date(params.startedAt);
  const isValidDate = !Number.isNaN(startedAtDate.getTime());
  const dateLabel = isValidDate ? startedAtDate.toLocaleDateString('fr-FR') : '';
  const timeLabel = isValidDate
    ? startedAtDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
    : '';
  const tutorLabel = params.tutorName?.trim() || 'Votre tuteur';
  const isGroupSession = (params.studentParticipantsCount ?? 1) > 1;

  return `
  <p>${escapeHtml(name)},</p>
  <p><strong>${escapeHtml(tutorLabel)}</strong> a annulé la séance suivante :</p>
  <ul>
    <li><strong>Matière :</strong> ${escapeHtml(subjectLabel)}</li>
    <li><strong>Date :</strong> ${escapeHtml(dateLabel || 'Non précisée')}</li>
    <li><strong>Heure :</strong> ${escapeHtml(timeLabel || 'Non précisée')}</li>
    ${
      params.reason
        ? `<li><strong>Raison :</strong> ${escapeHtml(params.reason)}</li>`
        : ''
    }
  </ul>
  ${
    isGroupSession
      ? `<p><strong>Information :</strong> cette séance était une séance de groupe (${params.studentParticipantsCount} élèves concernés).</p>`
      : ''
  }
  <p>Consultez votre espace étudiant pour réserver une autre séance si besoin.</p>
  <p><a href="${params.studentUrl}">Accéder à mon espace étudiant</a></p>
  <p>L’équipe ${APP_CONFIG.NAME}</p>
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
    intakeDetails?: RegistrationIntakeDetails;
  }
): Promise<void> {
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
    await sendEmail({
      to: options.newUser.email,
      subject: `Confirmez votre adresse e-mail - ${APP_CONFIG.NAME}`,
      html: buildVerificationEmailHtml({
        firstName: options.newUser.first_name,
        verifyUrl,
      }),
    });
  }

  if (plainPassword) {
    await sendEmail({
      to: options.newUser.email,
      subject: `Vos informations de connexion - ${APP_CONFIG.NAME}`,
      html: buildPasswordEmailHtml({
        firstName: options.newUser.first_name,
        plainPassword,
        signinUrl,
      }),
    });
  }

  if (options.newUser.role === 'STUDENT' || options.newUser.role === 'PARENT') {
    const adminEmails = getAdminNewStudentEmailRecipients();
    if (adminEmails.length === 0) {
      return;
    }
    const adminUrl = `${base}${adminPath}`;
    const studentName = `${options.newUser.first_name} ${options.newUser.last_name}`.trim();
    await sendEmail({
      to: adminEmails,
      subject: `[${APP_CONFIG.NAME}] Nouvelle inscription : ${studentName}`,
      html: buildAdminNewStudentHtml(options.newUser, adminUrl, options.intakeDetails),
    });
  }
}

export async function sendStudentTutorAssignmentEmail(options: {
  studentEmail: string;
  studentFirstName: string;
  tutorName: string;
}): Promise<void> {
  const base = getAppBaseUrl();
  const bookingUrl = `${base}/student/tutors`;

  await sendEmail({
    to: options.studentEmail,
    subject: `Nouveau tuteur assigné - Réservez votre séance | ${APP_CONFIG.NAME}`,
    html: buildStudentTutorAssignedEmailHtml({
      studentFirstName: options.studentFirstName,
      tutorName: options.tutorName,
      bookingUrl,
    }),
  });
}

export async function sendStudentSessionDecisionEmail(options: {
  studentEmail: string;
  studentFirstName: string;
  tutorName: string;
  action: 'ACCEPTED' | 'REJECTED';
  subject: string;
  startedAt: string;
}): Promise<void> {
  const appUrl = `${getAppBaseUrl()}/student`;
  const isAccepted = options.action === 'ACCEPTED';
  const subjectLine = isAccepted
    ? `Séance confirmée par votre tuteur | ${APP_CONFIG.NAME}`
    : `Séance refusée par votre tuteur | ${APP_CONFIG.NAME}`;

  await sendEmail({
    to: options.studentEmail,
    subject: subjectLine,
    html: buildStudentSessionDecisionEmailHtml({
      studentFirstName: options.studentFirstName,
      tutorName: options.tutorName,
      action: options.action,
      subject: options.subject,
      startedAt: options.startedAt,
      appUrl,
    }),
  });
}

export async function sendTutorNewBookingRequestEmail(options: {
  tutorEmail: string;
  tutorFirstName: string;
  studentName: string;
  subject: string;
  startedAt: string;
}): Promise<void> {
  const notificationsUrl = `${getAppBaseUrl()}/tutor/notifications`;
  await sendEmail({
    to: options.tutorEmail,
    subject: `Nouvelle demande de cours - Action requise | ${APP_CONFIG.NAME}`,
    html: buildTutorNewBookingRequestEmailHtml({
      tutorFirstName: options.tutorFirstName,
      studentName: options.studentName,
      subject: options.subject,
      startedAt: options.startedAt,
      notificationsUrl,
    }),
  });
}

export async function sendTutorSessionCancelledEmail(options: {
  tutorEmail: string;
  tutorFirstName: string;
  cancelledByName: string;
  subject: string;
  startedAt: string;
  reason?: string | null;
}): Promise<void> {
  const notificationsUrl = `${getAppBaseUrl()}/tutor/notifications`;
  await sendEmail({
    to: options.tutorEmail,
    subject: `Séance annulée - ${options.subject || 'Cours'} | ${APP_CONFIG.NAME}`,
    html: buildTutorSessionCancelledEmailHtml({
      tutorFirstName: options.tutorFirstName,
      cancelledByName: options.cancelledByName,
      subject: options.subject,
      startedAt: options.startedAt,
      reason: options.reason,
      notificationsUrl,
    }),
  });
}

export async function sendStudentSessionCancelledEmail(options: {
  studentEmail: string;
  studentFirstName: string;
  tutorName: string;
  subject: string;
  startedAt: string;
  reason?: string | null;
  studentParticipantsCount?: number;
}): Promise<void> {
  const studentUrl = `${getAppBaseUrl()}/student`;
  await sendEmail({
    to: options.studentEmail,
    subject: `Séance annulée - ${options.subject || 'Cours'} | ${APP_CONFIG.NAME}`,
    html: buildStudentSessionCancelledEmailHtml({
      studentFirstName: options.studentFirstName,
      tutorName: options.tutorName,
      subject: options.subject,
      startedAt: options.startedAt,
      reason: options.reason,
      studentParticipantsCount: options.studentParticipantsCount,
      studentUrl,
    }),
  });
}

export async function sendPasswordResetEmail(options: {
  to: string;
  firstName?: string | null;
  resetToken: string;
}): Promise<void> {
  const resetUrl = `${getAppBaseUrl()}/auth/reset-password?token=${encodeURIComponent(options.resetToken)}`;
  await sendEmail({
    to: options.to,
    subject: `Réinitialisez votre mot de passe - ${APP_CONFIG.NAME}`,
    html: buildPasswordResetEmailHtml({
      firstName: options.firstName?.trim() || 'Bonjour',
      resetUrl,
    }),
  });
}
