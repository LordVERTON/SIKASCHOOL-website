// Public interactions use mocked mutations. Auth fixtures exist only in local Supabase.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd(), true);
const baseURL = process.argv[2] || 'https://localhost:3000';
assert.ok(['localhost', '127.0.0.1'].includes(new URL(baseURL).hostname), 'Local app required');
assert.ok(['localhost', '127.0.0.1'].includes(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname), 'Local DB required');
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } });
const browser = await chromium.launch({ headless: true,
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || undefined });
const output = 'artifacts/roadmap-2026-11';
await mkdir(output, { recursive: true });
const report = { checkedAt: new Date().toISOString(), baseURL, checks: [], errors: [] };
const fixtures = [];
const reply = (route, data, status = 200) => route.fulfill({ status, contentType: 'application/json', body: JSON.stringify(data) });
async function context(width = 1440, dark = false) {
  const context = await browser.newContext({ baseURL, ignoreHTTPSErrors: true,
    viewport: { width, height: 960 }, reducedMotion: 'reduce', colorScheme: dark ? 'dark' : 'light' });
  context.on('page', page => page.on('console', message => {
    if (message.type() === 'error' && /hydrat/i.test(message.text())) report.errors.push(message.text());
  }));
  await context.addInitScript(theme => {
    localStorage.setItem('theme', theme); localStorage.setItem('language', 'fr');
  }, dark ? 'dark' : 'light');
  return context;
}
async function capture(page, name) {
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 1), false, `${name}: horizontal overflow`);
  await page.screenshot({ path: `${output}/${name}.png`, fullPage: true });
}
async function modalChecks(page) {
  const dialog = page.getByRole('dialog');
  await dialog.waitFor();
  assert.equal(await dialog.evaluate(el => el.matches(':modal')), true);
  assert.ok(await dialog.getAttribute('aria-labelledby'));
  for (const key of [...Array(12).fill('Tab'), 'Shift+Tab']) {
    await page.keyboard.press(key);
    assert.ok(await dialog.evaluate(el => el.contains(document.activeElement)), 'Focus escaped dialog');
  }
  assert.equal(await dialog.evaluate(el => el.scrollWidth > el.clientWidth + 1), false);
}
async function account(role) {
  const email = `roadmap-${randomUUID()}@example.invalid`;
  const password = `Test-${randomUUID()}!`;
  const { data, error } = await db.auth.admin.createUser({ email, password, email_confirm: true,
    user_metadata: { first_name: 'Recette', last_name: role } });
  if (error) throw new Error(`Local fixture creation failed: ${error.code}`);
  fixtures.push(data.user.id);
  const update = await db.from('profiles').update({ role, is_active: true }).eq('id', data.user.id);
  assert.equal(update.error, null);
  return { id: data.user.id, email, password };
}
async function login(context, user) {
  const response = await context.request.post('/api/auth/login', { data: { email: user.email, password: user.password } });
  assert.equal(response.status(), 200, 'Local fixture login failed');
  const me = await context.request.get('/api/auth/me');
  assert.equal((await me.json()).id, user.id);
}
try {
  for (const width of [375, 1440]) {
    for (const dark of [false, true]) {
      const ctx = await context(width, dark);
      const page = await ctx.newPage();
      page.on('pageerror', error => report.errors.push(error.message));
      let forgotCalls = 0;
      await page.route('**/api/auth/forgot-password', route => {
        forgotCalls++;
        return forgotCalls === 1 ? reply(route, { error: 'internal test detail' }, 503) : reply(route, { success: true });
      });
      await page.goto('/auth/signin');
      const trigger = page.getByRole('button', { name: /Mot de passe oublié/i });
      await trigger.click();
      await modalChecks(page);
      const dialog = page.getByRole('dialog');
      await dialog.getByLabel('Adresse e-mail').fill('test@example.invalid');
      await dialog.getByRole('button', { name: 'Envoyer le lien' }).click();
      await page.getByRole('alert').filter({ hasText: 'Le lien n’a pas pu être envoyé' }).waitFor();
      assert.equal(await dialog.getByLabel('Adresse e-mail').inputValue(), 'test@example.invalid');
      await capture(page, `forgot-error-${width}-${dark ? 'dark' : 'light'}`);
      await dialog.getByRole('button', { name: 'Envoyer le lien' }).click();
      await dialog.getByRole('heading', { name: 'Vérifiez votre messagerie' }).waitFor();
      await modalChecks(page);
      await capture(page, `forgot-success-${width}-${dark ? 'dark' : 'light'}`);
      await page.keyboard.press('Escape');
      await dialog.waitFor({ state: 'hidden' });
      assert.equal(await trigger.evaluate(el => document.activeElement === el), true);
      report.checks.push(`Forgot password ${width}px ${dark ? 'dark' : 'light'}: focus, retry, preserved e-mail, success, Escape`);
      await ctx.close();
    }
  }
  for (const role of ['STUDENT', 'PARENT', 'TUTOR', 'ADMIN']) {
    const user = await account(role);
    const ctx = await context(role === 'PARENT' ? 375 : 1440);
    await login(ctx, user);
    const health = await ctx.request.get('/api/admin/health');
    assert.equal(health.status(), role === 'ADMIN' ? 200 : 403);
    if (role === 'ADMIN') assert.deepEqual(await health.json(), { app: 'up', database: 'up' });
    const page = await ctx.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    let emptySessions = false;
    const session = { id: 'test-session', started_at: new Date(Date.now() + 172800000).toISOString(),
      course: 'Mathématiques', subject: 'Mathématiques', type: 'NOTA', level: 'Collège', status: 'PENDING',
      date: '15/11/2026', time: '14:00', duration: 60, tutor: 'Tuteur test', student: 'Élève test',
      participants: ['Élève test'], topics: [], homework: '', tutorAvatar: '/images/user/user-01.png' };
    // Authentication and health hit the real local APIs. Everything else is a read fixture.
    await page.route('**/api/**', route => {
      const { pathname } = new URL(route.request().url());
      if (pathname === '/api/auth/me' || pathname === '/api/admin/health') return route.continue();
      if (pathname === '/api/sessions/cancel') return reply(route, { error: 'La demande n’a pas pu être traitée.' }, 503);
      assert.equal(route.request().method(), 'GET', `Unexpected write: ${pathname}`);
      if (pathname === '/api/admin/users/with-profiles' || pathname === '/api/admin/users') return reply(route, []);
      if (pathname === '/api/admin/sessions' || pathname === '/api/admin/payments') return reply(route, []);
      if (pathname.endsWith('/sessions')) return reply(route, { sessions: emptySessions ? [] : [session] });
      if (pathname.endsWith('/payments/history')) return reply(route, { items: [{ ...session, declaredAt: session.started_at, durationMinutes: 60 }] });
      if (pathname.endsWith('/payments/overview')) return reply(route, { payments: [], credits: [], subscriptions: [], totals: {} });
      return reply(route, { notifications: [], users: [], payments: [], reviews: [], assignments: [], items: [], payouts: [], annual: [], summary: {}, stats: {} });
    });
    if (role === 'ADMIN') {
      await page.goto('/tutor/administration');
      await page.getByText('Base de données accessible.', { exact: true }).waitFor();
      await capture(page, 'admin-health');
      await page.route('**/api/admin/health', route => reply(route, { database: 'unavailable' }, 503));
      await page.getByRole('button', { name: 'Vérifier à nouveau' }).click();
      await page.getByRole('alert').filter({ hasText: 'La connexion à la base' }).waitFor();
      await capture(page, 'admin-health-unavailable');
      // Verify immediate revocation despite the previously issued ADMIN JWT.
      await db.from('profiles').update({ role: 'TUTOR' }).eq('id', user.id);
      assert.equal((await ctx.request.get('/api/admin/health')).status(), 403);
      report.checks.push('Admin: real read-only health, simulated outage/retry, immediate persisted role revocation');
    } else {
      const path = role === 'TUTOR' ? '/tutor/paiements' : role === 'PARENT' ? '/family/history' : '/student/history';
      await page.goto(path);
      await page.getByText('En attente de confirmation', { exact: true }).first().waitFor();
      await capture(page, `${role.toLowerCase()}-status`);
      report.checks.push(`${role}: real login, admin API denied, French session status rendered`);
      if (role !== 'TUTOR') {
        emptySessions = true;
        await page.reload();
        const reserve = page.getByRole('link', { name: 'Réserver une séance', exact: true });
        await reserve.waitFor();
        assert.equal(await reserve.getAttribute('href'), role === 'PARENT' ? '/family/calendar' : '/student/calendar');
        await reserve.click();
        await page.waitForURL(`**/${role === 'PARENT' ? 'family' : 'student'}/calendar`);
        report.checks.push(`${role}: empty history booking link opens the authorized calendar`);
        emptySessions = false;
        session.status = 'SCHEDULED';
        // Mobile agenda exposes the cancel action directly; desktop requires day details.
        await page.setViewportSize({ width: 375, height: 960 });
        await page.reload();
        const cancel = page.getByRole('button', { name: 'Annuler', exact: true }).first();
        await cancel.click();
        await modalChecks(page);
        await capture(page, `${role.toLowerCase()}-confirm-cancel`);
        await page.keyboard.press('Escape');
        await page.getByRole('dialog').waitFor({ state: 'hidden' });
        await cancel.click();
        await page.getByRole('dialog').getByRole('button', { name: 'Annuler', exact: true }).click();
        await page.getByRole('dialog', { name: 'Erreur', exact: true }).waitFor();
        await modalChecks(page);
        await capture(page, `${role.toLowerCase()}-alert-cancel`);
        await page.keyboard.press('Escape');
        report.checks.push(`${role}: accessible confirmation and failure alert, cancellation mocked`);
        const base = role === 'PARENT' ? '/family' : '/student';
        for (const outcome of ['success', 'cancel']) {
          await page.goto(`${base}/paiements/${outcome}`);
          await page.getByRole('heading', { name: outcome === 'success' ? 'Retour du paiement' : 'Achat interrompu' }).waitFor();
          const link = page.getByRole('link', { name: outcome === 'success' ? 'Vérifier mon paiement' : 'Retour aux paiements', exact: true });
          assert.equal(await link.getAttribute('href'), `${base}/paiements`);
          await capture(page, `${role.toLowerCase()}-payment-${outcome}`);
        }
        report.checks.push(`${role}: payment return pages preserve role space and make no unverified credit claim`);
      }
    }
    await ctx.close();
  }
  assert.deepEqual(report.errors, [], 'Browser runtime errors');
} finally {
  await browser.close();
  for (const id of fixtures) {
    const { error } = await db.auth.admin.deleteUser(id);
    if (error) report.errors.push(`Fixture cleanup failed: ${error.code}`);
  }
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
}
assert.deepEqual(report.errors, []);
process.stdout.write(`${report.checks.length} browser scenarios passed; screenshots: ${output}\n`);
