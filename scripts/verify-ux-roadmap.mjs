// Browser regression checks with intercepted API writes; no account, booking or payment is created.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const require = createRequire(
  process.argv[3] ? resolve(process.argv[3]) : import.meta.url
);
const { chromium } = require('playwright');
const baseUrl = process.argv[2] || 'http://localhost:3106';
const output = resolve('artifacts/ux-roadmap');
await mkdir(output, { recursive: true });
const report = {
  checkedAt: new Date().toISOString(),
  baseUrl,
  checks: [],
  errors: [],
};
const browser = await chromium.launch({ headless: true });
const subjects = ['Mathématiques', 'Français', 'Préparation à un concours'];
const slots = [0, 1].map(index => ({
  tutorId: `test-tutor-${index}`,
  tutorName: `Tuteur test ${index + 1}`,
  startedAt: new Date(Date.now() + (48 + index * 2) * 3600000).toISOString(),
  duration: 60,
}));
const respond = (route, status, data) =>
  route.fulfill({
    status,
    contentType: 'application/json',
    body: JSON.stringify(data),
  });

async function setup(width, language = 'fr') {
  const context = await browser.newContext({
    viewport: { width, height: 900 },
    reducedMotion: 'reduce',
  });
  await context.addInitScript(
    lang => localStorage.setItem('language', lang),
    language
  );
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  const state = {
    leadPosts: [],
    slotPosts: [],
    slotLoads: 0,
    checkoutPosts: [],
    authStatus: 200,
    checkoutStatus: 503,
    leadFailure: true,
    slotsFailure: true,
    conflict: true,
    availableSlots: slots,
  };
  await page.route('**/api/**', route => {
    const request = route.request();
    const path = new URL(request.url()).pathname;
    if (path === '/api/tutor-subjects')
      return respond(route, 200, { subjects });
    if (path === '/api/faqs') return respond(route, 200, { faqs: [] });
    if (path === '/api/leads' && request.method() === 'POST') {
      state.leadPosts.push(request.postDataJSON());
      if (state.leadFailure) {
        state.leadFailure = false;
        return respond(route, 503, { error: 'test outage' });
      }
      return respond(route, 200, { success: true });
    }
    if (path === '/api/leads/first-session-slots') {
      if (request.method() === 'GET') {
        state.slotLoads++;
        if (state.slotsFailure) {
          state.slotsFailure = false;
          return respond(route, 503, {});
        }
        return respond(route, 200, { slots: state.availableSlots });
      }
      state.slotPosts.push(request.postDataJSON());
      if (state.conflict) {
        state.conflict = false;
        return respond(route, 409, {});
      }
      return respond(route, 200, { success: true });
    }
    if (path === '/api/auth/me')
      return respond(
        route,
        state.authStatus,
        state.authStatus === 200 ? { role: 'PARENT' } : {}
      );
    if (path === '/api/auth/login' && request.method() === 'POST') {
      state.authStatus = 200;
      return respond(route, 200, { success: true, user: { role: 'PARENT' } });
    }
    if (
      path === '/api/student/payments/checkout' &&
      request.method() === 'POST'
    ) {
      state.checkoutPosts.push(request.postDataJSON());
      return respond(route, state.checkoutStatus, {});
    }
    // Every other mutation is blocked instead of reaching a real service.
    if (request.method() !== 'GET')
      throw new Error(`Unexpected API write: ${request.method()} ${path}`);
    return respond(route, 200, {});
  });
  return { context, page, state };
}

async function assertDialog(page) {
  const dialog = page.getByRole('dialog');
  await dialog.waitFor({ state: 'visible' });
  assert.equal(await dialog.count(), 1);
  assert.equal(await dialog.evaluate(el => el.matches(':modal')), true);
  assert.equal(
    await dialog.evaluate(el => el.scrollWidth > el.clientWidth + 1),
    false
  );
  // Programmatic focus cannot reach the background either.
  await page.locator('header a[href="/"]').evaluate(el => el.focus());
  assert.ok(await dialog.evaluate(el => el.contains(document.activeElement)));
  for (const key of ['Shift+Tab', ...Array(24).fill('Tab')]) {
    await page.keyboard.press(key);
    assert.ok(
      await dialog.evaluate(el => el.contains(document.activeElement)),
      `Focus escaped after ${key}`
    );
  }
  return dialog;
}

try {
  for (const width of [320, 390, 768, 1280, 1440]) {
    const { context, page } = await setup(width);
    for (const path of ['/', '/packs', '/book-online', '/booking', '/how-to']) {
      const response = await page.goto(baseUrl + path);
      assert.equal(response.status(), 200);
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('main').count(), 1);
      assert.equal(await page.locator('h1').count(), 1);
      assert.equal(
        await page.evaluate(
          () => document.documentElement.scrollWidth > innerWidth + 1
        ),
        false,
        `${path} overflows at ${width}px`
      );
      await page.screenshot({
        path: `${output}/${path.replaceAll('/', '') || 'home'}-${width}.png`,
        fullPage: true,
      });
      report.checks.push({ type: 'responsive', path, width });
    }
    await page.goto(baseUrl);
    if (width < 1280) {
      await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
      await assertDialog(page);
      await page.keyboard.press('Escape');
      await page.getByRole('dialog').waitFor({ state: 'detached' });
      assert.equal(
        await page
          .locator('[data-menu-trigger]')
          .evaluate(el => el === document.activeElement),
        true
      );
      await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
      await page
        .locator('.navbar')
        .getByRole('button', { name: /Réserver/ })
        .click();
    } else {
      await page
        .locator('header')
        .getByRole('button', { name: /Réserver/ })
        .click();
    }
    await assertDialog(page);
    await page.keyboard.press('Escape');
    await page.getByRole('dialog').waitFor({ state: 'detached' });
    assert.equal(await page.evaluate(() => document.body.style.overflow), '');
    if (width < 1280)
      assert.equal(
        await page
          .locator('[data-menu-trigger]')
          .evaluate(el => el === document.activeElement),
        true
      );
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    await page.locator('.sika-hero-grid .sika-button').first().click();
    await assertDialog(page);
    await page.screenshot({ path: `${output}/dialog-dark-${width}.png` });
    await page.keyboard.press('Escape');
    report.checks.push({ type: 'dialogs-keyboard-dark', width });
    await context.close();
  }

  for (const [width, accountType, language, startsEmpty] of [
    [320, 'PARENT', 'fr'],
    [1440, 'STUDENT', 'en'],
    [390, 'PARENT', 'fr', true],
  ]) {
    const { context, page, state } = await setup(width, language);
    const fr = language === 'fr';
    if (startsEmpty) state.availableSlots = [];
    await page.goto(baseUrl);
    await page.locator('#hero-subject').selectOption('Mathématiques');
    await page.locator('.sika-hero-grid .sika-button').first().click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible' });
    const next = dialog.getByRole('button', {
      name: fr ? 'Continuer' : 'Continue',
      exact: true,
    });
    await next.click();
    assert.equal(
      await dialog.locator('#lead-email').count(),
      0,
      'Required needs cannot be skipped'
    );
    await dialog
      .locator(`input[name="accountType"][value="${accountType}"]`)
      .check();
    await dialog.locator('input[name="level"][value="6ème"]').check();
    await dialog.locator('#lead-subject').selectOption('Français');
    await dialog.locator('#lead-goal').selectOption('Autre');
    await dialog.locator('#lead-goal-other').fill('Une méthode de travail');
    await next.click();
    await dialog.locator('#lead-civility').selectOption('Mme');
    await dialog.locator('#lead-last-name').fill('Test');
    await dialog.locator('#lead-first-name').fill('Test');
    await dialog.locator('#lead-email').fill('ux-regression@example.invalid');
    await dialog.locator('#lead-phone-country').selectOption('CH');
    await dialog.locator('#lead-phone').fill('791234567');
    await dialog.locator('#lead-zip').fill('1200');
    await dialog
      .getByRole('button', {
        name: fr ? 'Retour aux besoins' : 'Back to needs',
      })
      .click();
    assert.equal(
      await dialog.locator('#lead-subject').inputValue(),
      'Français'
    );
    assert.equal(
      await dialog.locator('#lead-goal-other').inputValue(),
      'Une méthode de travail'
    );
    await next.click();
    assert.equal(
      await dialog.locator('#lead-email').inputValue(),
      'ux-regression@example.invalid'
    );
    assert.equal(
      await dialog.locator('#lead-phone-country').inputValue(),
      'CH'
    );
    await page.keyboard.press('Escape');
    await page.locator('.sika-hero-grid .sika-button').first().click();
    assert.equal(
      await dialog.locator('#lead-email').inputValue(),
      'ux-regression@example.invalid'
    );
    const submit = dialog.getByRole('button', {
      name: fr
        ? 'Envoyer et voir les créneaux'
        : 'Submit and view available times',
    });
    await submit.evaluate(button => {
      button.click();
      button.click();
    });
    await dialog.getByRole('alert').waitFor();
    assert.equal(
      await dialog.locator('#lead-email').inputValue(),
      'ux-regression@example.invalid'
    );
    assert.equal(state.leadPosts.length, 1);
    assert.equal(state.leadPosts[0].accountType, accountType);
    assert.equal(state.leadPosts[0].phoneDialCode, '+41');
    assert.equal(state.leadPosts[0].subject, 'Français');
    assert.equal(state.leadPosts[0].goalOther, 'Une méthode de travail');
    await submit.click();
    await dialog.getByRole('alert').waitFor(); // First slots load intentionally fails.
    assert.equal(state.leadPosts.length, 2);
    await dialog
      .getByRole('button', {
        name: fr ? 'Actualiser les créneaux' : 'Refresh available times',
      })
      .click();
    if (startsEmpty) {
      await dialog
        .getByRole('status')
        .filter({ hasText: /Aucun créneau/ })
        .waitFor();
      assert.equal(state.slotPosts.length, 0);
      assert.equal(
        await dialog
          .getByRole('button', { name: 'Demander ce créneau' })
          .isDisabled(),
        true
      );
      state.availableSlots = slots;
      await dialog
        .getByRole('button', { name: 'Actualiser les créneaux' })
        .click();
    }
    await dialog.locator('input[name="first-session-slot"]').first().waitFor();
    await dialog.locator('input[name="first-session-slot"]').first().check();
    const confirm = dialog.getByRole('button', {
      name: fr ? 'Demander ce créneau' : 'Request this time',
    });
    await confirm.click();
    await dialog.getByRole('alert').waitFor();
    assert.equal(
      await dialog.locator('input[name="first-session-slot"]').count(),
      1,
      'A conflicting time is removed'
    );
    assert.equal(await confirm.isDisabled(), true);
    await dialog.locator('input[name="first-session-slot"]').first().check();
    await confirm.click();
    await dialog.getByRole('status').waitFor();
    assert.match(
      await dialog.getByRole('status').innerText(),
      fr ? /doit encore confirmer/ : /still needs to confirm/
    );
    assert.equal(state.slotPosts.length, 2);
    assert.equal(state.slotPosts[1].email, 'ux-regression@example.invalid');
    await page.screenshot({
      path: `${output}/booking-complete-${width}-${language}.png`,
    });
    report.checks.push({
      type: 'booking-retry-conflict-success',
      width,
      accountType,
      language,
      leadRequests: state.leadPosts.length,
      bookingRequests: state.slotPosts.length,
      emptyState: Boolean(startsEmpty),
    });
    await context.close();
  }

  const { context, page, state } = await setup(1440);
  await page.goto(baseUrl + '/packs');
  const plan = page.getByRole('button', {
    name: 'Choisir le pack Collège Eco',
  });
  await plan.click();
  await page.getByRole('alert').waitFor();
  assert.equal(
    await plan.isEnabled(),
    true,
    'Checkout failure must permit retry'
  );
  assert.deepEqual(state.checkoutPosts[0], { planId: 'pack_eco_college' });
  state.authStatus = 401;
  await plan.click();
  await page.waitForURL('**/auth/signin?**');
  assert.equal(new URL(page.url()).searchParams.get('next'), '/packs');
  // The second Supabase session is also intercepted: no real login is attempted.
  const fakeUser = {
    id: '00000000-0000-4000-8000-000000000001',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'ux-regression@example.invalid',
    app_metadata: {},
    user_metadata: {},
    created_at: new Date().toISOString(),
  };
  const encode = value =>
    Buffer.from(JSON.stringify(value)).toString('base64url');
  const accessToken = `${encode({ alg: 'HS256', typ: 'JWT' })}.${encode({ sub: fakeUser.id, exp: Math.floor(Date.now() / 1000) + 3600 })}.test-signature`;
  await page.route('**/auth/v1/**', route =>
    respond(route, 200, {
      access_token: accessToken,
      refresh_token: 'test-only-refresh-token',
      expires_in: 3600,
      token_type: 'bearer',
      user: fakeUser,
    })
  );
  await page.locator('input[name="email"]').fill(fakeUser.email);
  await page.locator('input[name="password"]').fill('Test-only-password-123!');
  await page
    .locator('form')
    .getByRole('button', { name: 'Connexion', exact: true })
    .click();
  await page.waitForURL(baseUrl + '/packs');
  report.checks.push({
    type: 'checkout-error-retry-signin-and-return-after-login',
  });
  await page.goto(baseUrl);
  await page.locator('header a[href="/#tutors"]').click();
  await page.waitForFunction(
    () =>
      document
        .querySelector('header a[href="/#tutors"]')
        ?.getAttribute('aria-current') === 'location'
  );
  assert.ok(
    await page
      .locator('#tutors')
      .evaluate(el => el.getBoundingClientRect().top >= 70)
  );
  const links = await page
    .locator('header nav a')
    .evaluateAll(links => links.map(link => link.getAttribute('href')));
  assert.deepEqual(links, [
    '/#reviews',
    '/#how-it-works',
    '/#tutors',
    '/#pricing',
  ]);
  report.checks.push({ type: 'homepage-navigation-order-and-active-section' });
  const publicLinks = await page
    .locator('header a, footer a')
    .evaluateAll(elements =>
      elements.map(element => element.getAttribute('href'))
    );
  assert.ok(publicLinks.every(href => href && href !== '#'));
  for (const href of new Set(
    publicLinks.filter(href => href.startsWith('/'))
  )) {
    const url = new URL(href, baseUrl);
    if (url.hash) assert.equal(await page.locator(url.hash).count(), 1);
    const response = await context.request.get(url.href, { maxRedirects: 0 });
    assert.equal(response.status(), 200, `Public navigation target: ${href}`);
  }
  report.checks.push({
    type: 'header-footer-destinations',
    count: new Set(publicLinks).size,
  });
  await context.close();
  assert.deepEqual(report.errors, []);
  process.stdout.write(JSON.stringify(report, null, 2) + '\n');
} catch (error) {
  report.failure = error.stack;
  throw error;
} finally {
  await writeFile(`${output}/report.json`, JSON.stringify(report, null, 2));
  await browser.close();
}
