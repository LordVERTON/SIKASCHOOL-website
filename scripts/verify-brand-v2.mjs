// Read-only browser checks. Usage: node scripts/verify-brand-v2.mjs [baseUrl] [path/to/playwright/package.json]
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const require = createRequire(
  process.argv[3] ? resolve(process.argv[3]) : import.meta.url
);
const { chromium } = require('playwright');
const baseUrl = process.argv[2] || 'http://localhost:3100';
const output = resolve('artifacts/v2.1/after');
await mkdir(output, { recursive: true });
const browser = await chromium.launch({ headless: true });
const report = {
  baseUrl,
  checkedAt: new Date().toISOString(),
  pages: [],
  booking: [],
  api: {},
  errors: [],
};
const context = await browser.newContext({ reducedMotion: 'reduce' });
// This recipe must never submit a real lead, email or payment.
await context.route('**/api/**', route =>
  ['GET', 'HEAD', 'OPTIONS'].includes(route.request().method())
    ? route.continue()
    : route.abort('blockedbyclient')
);
const page = await context.newPage();
page.on('pageerror', error => report.errors.push(error.stack || error.message));

try {
  const paths = [
    '/',
    '/about',
    '/how-to',
    '/packs',
    '/book-online',
    '/booking',
    '/support',
    '/donnees-personnelles',
    '/error',
    '/auth/signin',
    '/auth/signup',
    '/auth/verify-email',
    '/auth/reset-password',
  ];
  for (const path of process.argv.includes('--booking-only') ? [] : paths) {
    for (const width of path === '/'
      ? [320, 375, 390, 430, 768, 1024, 1440]
      : [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 1000 });
      const response = await page.goto(baseUrl + path, {
        waitUntil: 'load',
      });
      assert.equal(
        response.status(),
        200,
        `${path}: HTTP ${response.status()}`
      );
      await page.locator('.sika-site').waitFor();
      await page.evaluate(() => document.fonts.ready);
      // Trigger existing below-the-fold reveal components before taking captures.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 700) {
          window.scrollTo(0, y);
          await new Promise(done => setTimeout(done, 25));
        }
        window.scrollTo(0, 0);
      });
      const state = await page.evaluate(() => ({
        main: document.querySelectorAll('main').length,
        h1: document.querySelectorAll('h1').length,
        overflow: document.documentElement.scrollWidth > innerWidth + 1,
        bodyFont: getComputedStyle(document.querySelector('.sika-site'))
          .fontFamily,
        headingFont: (() => {
          const heading = document.querySelector(
            '.sika-site :is(h1, h2, h3, h4, h5, h6)'
          );
          return heading ? getComputedStyle(heading).fontFamily : null;
        })(),
        blue: getComputedStyle(document.documentElement)
          .getPropertyValue('--sika-brand-blue')
          .trim(),
        overflowElements: [...document.querySelectorAll('body *')]
          .filter(el => {
            const rect = el.getBoundingClientRect();
            return (
              rect.right > innerWidth + 1 &&
              getComputedStyle(el).visibility !== 'hidden' &&
              !el.closest('nextjs-portal')
            );
          })
          .slice(0, 15)
          .map(el => ({
            tag: el.tagName,
            class: el.className,
            right: el.getBoundingClientRect().right,
          })),
      }));
      if (state.overflow) {
        process.stdout.write(
          JSON.stringify({ path, width, ...state }, null, 2) + '\n'
        );
        await page.screenshot({
          path: `${output}/overflow.png`,
          fullPage: true,
        });
      }
      assert.equal(state.main, 1, `${path}: main landmark count`);
      assert.equal(state.overflow, false, `${path}: overflow at ${width}px`);
      assert.equal(state.blue.toLowerCase(), '#1e3a8a');
      assert.match(state.bodyFont.toLowerCase(), /poppins/);
      if (state.headingFont) {
        assert.match(state.headingFont.toLowerCase(), /sensawild/);
      }
      report.pages.push({ path, width, theme: 'light', ...state });
      if (
        path === '/' ||
        (width === 320 && ['/packs', '/about', '/booking'].includes(path))
      ) {
        await page.waitForTimeout(1100);
        await page.screenshot({
          path: `${output}/${path.replaceAll('/', '-') || 'home'}-${width}.png`,
          fullPage: true,
        });
      }
    }
    await page.evaluate(() => document.documentElement.classList.add('dark'));
    const darkState = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > innerWidth + 1,
      surface: getComputedStyle(document.querySelector('.sika-site'))
        .backgroundColor,
    }));
    assert.equal(darkState.overflow, false, `${path}: dark overflow`);
    assert.equal(darkState.surface, 'rgb(24, 28, 49)');
    report.pages.push({ path, width: 1440, theme: 'dark', ...darkState });
    if (path === '/')
      await page.screenshot({
        path: `${output}/home-dark.png`,
        fullPage: true,
      });
    await page.evaluate(() =>
      document.documentElement.classList.remove('dark')
    );
  }

  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(baseUrl, { waitUntil: 'load' });
  try {
    const subjectsResponse = await context.request.get(
      baseUrl + '/api/tutor-subjects',
      { timeout: 12000 }
    );
    report.api.subjects = {
      status: subjectsResponse.status(),
      ...(await subjectsResponse.json()),
    };
  } catch {
    report.api.subjects = {
      unavailable: true,
      note: 'Request timed out; UI fallback catalog checked independently.',
    };
  }
  const select = page.locator('input[name="hero-subject"]').first();
  // The initial local catalogue can be replaced by the API after hydration.
  // Wait for that replacement before choosing an entry by position.
  if (Array.isArray(report.api.subjects?.subjects)) {
    await page.waitForFunction(expected => {
      const values = [
        ...document.querySelectorAll('input[name="hero-subject"]'),
      ]
        .map(input => input.value)
        .filter(Boolean);
      return JSON.stringify(values) === JSON.stringify(expected);
    }, report.api.subjects.subjects);
  }
  const chosenSubject = await select.getAttribute('value');
  await select.check();
  const launches = [
    {
      label: 'hero with subject',
      locator: page.locator('.sika-hero-grid .sika-button').first(),
      subject: true,
    },
    {
      label: 'subject CTA',
      locator: page.locator('[data-subject-booking]'),
      subject: true,
    },
    {
      label: 'header',
      locator: page
        .locator('header .xl\\:flex button')
        .filter({ hasText: /Réserver/ })
        .last(),
    },
    { label: 'final CTA', locator: page.locator('.sika-final-cta button') },
  ];
  for (const launch of launches) {
    await launch.locator.click();
    const dialog = page.getByRole('dialog');
    await dialog.waitFor();
    assert.equal(await dialog.count(), 1, `${launch.label}: duplicate dialogs`);
    assert.ok(
      await page
        .locator('main')
        .evaluate(element => Boolean(element.closest('[inert]'))),
      'Background must be inert'
    );
    if (launch.subject) {
      await page.waitForFunction(
        subject =>
          [...document.querySelectorAll('[role="dialog"] select')].some(
            select => select.value === subject
          ),
        chosenSubject
      );
    }
    for (let i = 0; i < 4; i++) {
      await page.keyboard.press('Shift+Tab');
      assert.ok(
        await dialog.evaluate(element =>
          element.contains(document.activeElement)
        ),
        'Focus escaped dialog'
      );
    }
    await page.screenshot({
      path: `${output}/booking-${launch.label.replaceAll(' ', '-')}.png`,
    });
    await page.keyboard.press('Escape');
    await dialog.waitFor({ state: 'detached' });
    assert.ok(
      await launch.locator.evaluate(
        element => element === document.activeElement
      ),
      `${launch.label}: focus not restored`
    );
    report.booking.push({
      launch: launch.label,
      singleDialog: true,
      focusTrap: true,
      focusRestored: true,
      subject: launch.subject ? chosenSubject : undefined,
    });
  }

  await page.setViewportSize({ width: 320, height: 700 });
  await page.goto(baseUrl, { waitUntil: 'load' });
  await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
  const mobileCta = page
    .locator('.navbar button')
    .filter({ hasText: /Réserver/ });
  await mobileCta.click();
  assert.equal(await page.getByRole('dialog').count(), 1);
  assert.equal(
    await page
      .getByRole('dialog')
      .evaluate(el => el.scrollWidth > el.clientWidth + 1),
    false
  );
  await page.screenshot({ path: `${output}/booking-mobile.png` });
  await page.keyboard.press('Escape');
  await page.getByRole('dialog').waitFor({ state: 'detached' });
  assert.equal(
    await page.evaluate(() =>
      document.activeElement?.getAttribute('aria-label')
    ),
    'Ouvrir le menu',
    'Mobile focus must return to menu trigger'
  );
  report.booking.push({
    launch: 'mobile menu',
    singleDialog: true,
    noHorizontalOverflow: true,
    focusRestored: true,
  });

  // A 200% CSS zoom exercises effective 320px layout at a 640px viewport.
  await page.setViewportSize({ width: 640, height: 1000 });
  await page.goto(baseUrl, { waitUntil: 'load' });
  await page.evaluate(() => (document.body.style.zoom = '2'));
  const zoomState = await page.evaluate(() => ({
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    bodyWidth: document.body.scrollWidth,
    elements: [...document.querySelectorAll('body *')]
      .filter(el => el.getBoundingClientRect().right > innerWidth + 1)
      .slice(0, 12)
      .map(el => ({
        tag: el.tagName,
        class: el.className,
        right: el.getBoundingClientRect().right,
        visibility: getComputedStyle(el).visibility,
      })),
  }));
  if (zoomState.scrollWidth > zoomState.width + 1) {
    process.stdout.write(JSON.stringify({ zoomState }, null, 2) + '\n');
    await page.screenshot({
      path: `${output}/zoom-overflow.png`,
      fullPage: true,
    });
  }
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth > innerWidth + 1
    ),
    false,
    '200% zoom overflow'
  );
  await page.evaluate(() => (document.body.style.zoom = ''));
  for (const path of ['/student', '/family', '/tutor', '/admin']) {
    const response = await context.request.get(baseUrl + path, {
      maxRedirects: 0,
    });
    assert.equal(
      response.status(),
      307,
      `${path}: anonymous access must redirect`
    );
    assert.match(response.headers().location, /\/auth\/signin/);
  }
  await page.goto(baseUrl, { waitUntil: 'load' });
  await page.keyboard.press('Tab');
  assert.equal(
    await page.evaluate(() => document.activeElement?.getAttribute('href')),
    '#main-content'
  );
  await page.keyboard.press('Enter');
  assert.equal(
    await page.evaluate(() => document.activeElement?.id),
    'main-content'
  );
  await page.getByRole('button', { name: 'Select language' }).click();
  await page.getByRole('button', { name: /English/ }).click();
  await page.waitForFunction(() => document.documentElement.lang === 'en');
  assert.match(await page.locator('#hero-title').innerText(), /forward/i);
  report.navigation = {
    skipLink: true,
    protectedPortals: true,
    englishCopy: true,
    htmlLang: 'en',
    zoom200: true,
  };
  await verifyHomepageV21();
  assert.equal(
    report.errors.length,
    0,
    `Browser errors: ${report.errors.join('; ')}`
  );
  process.stdout.write(
    JSON.stringify(
      {
        publicRouteChecks: report.pages.length,
        bookingChecks: report.booking,
        api: report.api,
        browserErrors: report.errors,
        output,
      },
      null,
      2
    ) + '\n'
  );
} finally {
  await writeFile(
    `${output}/${process.argv.includes('--booking-only') ? 'report-booking' : 'report'}.json`,
    JSON.stringify(report, null, 2)
  );
  await browser.close();
}

async function verifyHomepageV21() {
  report.v21 = { matrix: [], checks: [], metrics: [] };
  // These are controlled browser fixtures, never published site content.
  const catalog = [
    'Mathématiques',
    'Physiques',
    'Sciences de l’ingénieur',
    'Français',
    'Chimie',
    'Méthodologie',
  ];
  const faqs = [
    {
      id: 71,
      quest: 'Comment fonctionne une séance ?',
      ans: 'Après réservation, l’élève retrouve la séance dans son calendrier et rejoint le cours depuis son espace.',
    },
    {
      id: 85,
      quest: 'Quels niveaux sont proposés ?',
      ans: 'Collège, lycée et supérieur.',
    },
    {
      id: 92,
      quest: 'Comment contacter le support ?',
      ans: 'Depuis la page de contact.',
    },
  ];
  const fixture = await browser.newContext({ reducedMotion: 'reduce' });
  await fixture.route('**/api/**', route => {
    const request = route.request();
    if (!['GET', 'HEAD', 'OPTIONS'].includes(request.method()))
      return route.abort('blockedbyclient');
    const path = new URL(request.url()).pathname;
    if (path === '/api/tutor-subjects')
      return route.fulfill({ json: { subjects: catalog } });
    if (path === '/api/faqs') return route.fulfill({ json: faqs });
    return route.continue();
  });
  const target = await fixture.newPage();
  target.on('pageerror', error => report.errors.push(error.message));
  await target.addInitScript(() => {
    window.__sikaMetrics = { lcp: null, cls: 0 };
    new PerformanceObserver(list => {
      for (const entry of list.getEntries())
        window.__sikaMetrics.lcp = entry.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver(list => {
      for (const entry of list.getEntries())
        if (!entry.hadRecentInput) window.__sikaMetrics.cls += entry.value;
    }).observe({ type: 'layout-shift', buffered: true });
  });
  for (const language of ['fr', 'en']) {
    await target.addInitScript(
      lang => localStorage.setItem('language', lang),
      language
    );
    for (const width of [320, 375, 390, 430, 768, 1024, 1440]) {
      await target.setViewportSize({ width, height: 900 });
      await target.goto(baseUrl, { waitUntil: 'load' });
      await target.waitForFunction(
        lang => document.documentElement.lang === lang,
        language
      );
      await target.locator('#faq [data-accordion-trigger]').first().waitFor();
      await target.waitForFunction(() =>
        document
          .querySelector('#faq [data-accordion-trigger]')
          ?.textContent.includes('Comment fonctionne une séance')
      );
      await target.evaluate(() => document.fonts.ready);
      await target.waitForTimeout(250);
      report.v21.metrics.push({
        language,
        width,
        ...(await target.evaluate(() => window.__sikaMetrics)),
      });
      // Load below-the-fold portraits before full-page captures. Metrics above
      // deliberately describe the initial viewport, before this scroll.
      await target.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 700) {
          window.scrollTo(0, y);
          await new Promise(done => setTimeout(done, 25));
        }
        window.scrollTo(0, 0);
      });
      await target.waitForFunction(() =>
        [...document.querySelectorAll('.sika-tutor-photo img')].every(
          img => img.complete && img.naturalWidth > 0
        )
      );
      for (const dark of [false, true]) {
        await target.evaluate(
          value => document.documentElement.classList.toggle('dark', value),
          dark
        );
        const state = await target.evaluate(() => ({
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          h1: document.querySelectorAll('h1').length,
          sections: [
            ...document.querySelectorAll(
              'main > section, main > div > section'
            ),
          ].map(el => el.getAttribute('aria-labelledby') || el.id),
          motionReduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
          imageLoaded:
            document.querySelector('.sika-hero-photo img')?.naturalWidth > 0,
          ctaHeight: document
            .querySelector('.sika-hero-actions button')
            .getBoundingClientRect().height,
          radioTransition: getComputedStyle(
            document.querySelector('.sika-subject-chip')
          ).transitionDuration,
        }));
        assert.equal(
          state.overflow,
          false,
          `V2.1 ${language}/${width}/${dark}: overflow`
        );
        assert.equal(state.h1, 1);
        assert.equal(state.imageLoaded, true);
        assert.ok(state.ctaHeight >= 48);
        assert.equal(state.motionReduced, true);
        assert.equal(state.radioTransition, '0s');
        assert.deepEqual(state.sections, [
          'hero-title',
          'reassurance',
          'method-title',
          'tutors-title',
          'reviews-title',
          'identity-title',
          'pricing-title',
          'faq-title',
          'contact-title',
          'final-cta-title',
        ]);
        report.v21.matrix.push({
          language,
          width,
          theme: dark ? 'dark' : 'light',
          ...state,
        });
        await target.screenshot({
          path: `${output}/home-${language}-${width}-${dark ? 'dark' : 'light'}.png`,
          fullPage: true,
        });
      }
    }
  }
  // Return to FR for interaction assertions, with the real catalogue spelling.
  await target.evaluate(() => localStorage.setItem('language', 'fr'));
  await target.goto(baseUrl);
  // The last init script sets EN, so switch through the actual language control.
  await target.getByRole('button', { name: 'Select language' }).click();
  await target.getByRole('button', { name: /Français/ }).click();
  await target.waitForFunction(() => document.documentElement.lang === 'fr');
  await target.evaluate(() =>
    document.documentElement.classList.remove('dark')
  );
  await target.setViewportSize({ width: 1440, height: 1000 });
  const radios = target.locator('input[name="hero-subject"]');
  assert.equal(await radios.count(), catalog.length + 1);
  assert.deepEqual(
    await radios.evaluateAll(nodes =>
      nodes.map(node => node.value).filter(Boolean)
    ),
    catalog
  );
  await target
    .getByRole('radio', { name: 'Mathématiques', exact: true })
    .check();
  await target.keyboard.press('ArrowRight');
  assert.equal(
    await target
      .getByRole('radio', { name: 'Physiques', exact: true })
      .isChecked(),
    true
  );
  await target.getByRole('button', { name: /Autres matières/ }).click();
  await target.getByRole('radio', { name: 'Chimie', exact: true }).check();
  assert.equal(
    await target.locator('input[name="hero-subject"]:checked').count(),
    1
  );
  await target.locator('[data-subject-booking]').click();
  const dialog = target.getByRole('dialog');
  await dialog.waitFor();
  assert.equal(await dialog.count(), 1);
  await target.waitForFunction(() =>
    [...document.querySelectorAll('dialog select')].some(
      el => el.value === 'Chimie'
    )
  );
  await target.keyboard.press('Escape');
  await dialog.waitFor({ state: 'detached' });
  assert.equal(
    await target
      .locator('[data-subject-booking]')
      .evaluate(el => el === document.activeElement),
    true
  );
  await target
    .getByRole('radio', { name: 'Je choisirai plus tard', exact: true })
    .check();
  await target.locator('.sika-hero-actions button').click();
  await dialog.waitFor();
  await target.keyboard.press('Escape');
  await dialog.waitFor({ state: 'detached' });
  report.v21.checks.push(
    'API catalogue, all subjects, native arrow keys, one checked state, Chimie prefill, optional subject, single dialog, Escape and focus restoration'
  );

  const questions = target.locator('#faq [data-accordion-trigger]');
  await questions.first().focus();
  await target.keyboard.press('Enter');
  assert.equal(await questions.first().getAttribute('aria-expanded'), 'true');
  const panelId = await questions.first().getAttribute('aria-controls');
  assert.equal(
    await target.locator(`[id="${panelId}"]`).innerText(),
    faqs[0].ans
  );
  await target.keyboard.press('Space');
  assert.equal(await questions.first().getAttribute('aria-expanded'), 'false');
  await target.keyboard.press('ArrowDown');
  assert.equal(
    await questions.nth(1).evaluate(el => el === document.activeElement),
    true
  );
  await target.keyboard.press('ArrowUp');
  assert.equal(
    await questions.first().evaluate(el => el === document.activeElement),
    true
  );
  await target.keyboard.press('End');
  assert.equal(
    await questions.last().evaluate(el => el === document.activeElement),
    true
  );
  await target.keyboard.press('Home');
  assert.equal(
    await questions.first().evaluate(el => el === document.activeElement),
    true
  );
  report.v21.checks.push(
    'FAQ: API answer preserved, Enter, Space, Up/Down, Home/End, expanded and labelled panel'
  );

  for (const width of [390, 1440]) {
    await target.setViewportSize({ width, height: 900 });
    for (const id of ['how-it-works', 'tutors', 'reviews', 'pricing']) {
      if (width < 1280)
        await target.getByRole('button', { name: 'Ouvrir le menu' }).click();
      const nav =
        width < 1280
          ? target.locator('#mobile-navigation')
          : target.locator('header');
      await nav.locator(`a[href="/#${id}"]`).click();
      await target.waitForFunction(
        section =>
          document
            .querySelector(`header a[href="/#${section}"]`)
            ?.getAttribute('aria-current') === 'location',
        id
      );
      const top = await target
        .locator(`#${id}`)
        .evaluate(el => el.getBoundingClientRect().top);
      assert.ok(top >= 70 && top <= 180, `${width}/${id}: anchor top ${top}`);
    }
  }
  report.v21.checks.push(
    'Desktop/mobile navigation: all four anchors, header clearance and active section'
  );
  const publicLinks = await target
    .locator('header a, footer a')
    .evaluateAll(nodes => nodes.map(node => node.getAttribute('href')));
  for (const href of new Set(publicLinks)) {
    assert.ok(href && href !== '#');
    if (!href.startsWith('/')) continue;
    const url = new URL(href, baseUrl);
    if (url.hash) assert.equal(await target.locator(url.hash).count(), 1, href);
    assert.equal((await fixture.request.get(url.href)).status(), 200, href);
  }
  report.v21.checks.push('Header/footer links and unique anchor destinations');
  await fixture.close();

  // Slow, unavailable, empty and malformed FAQ responses all retain useful content.
  for (const mode of ['slow', 'error', 'empty', 'malformed']) {
    const fallbackContext = await browser.newContext({
      viewport: { width: 390, height: 900 },
      reducedMotion: 'reduce',
    });
    let recover = false;
    await fallbackContext.addInitScript(() =>
      localStorage.setItem('language', 'en')
    );
    await fallbackContext.route('**/api/**', async route => {
      if (route.request().method() !== 'GET')
        return route.abort('blockedbyclient');
      const path = new URL(route.request().url()).pathname;
      if (path === '/api/tutor-subjects')
        return route.fulfill({ json: { subjects: catalog } });
      if (path !== '/api/faqs') return route.continue();
      if (recover) return route.fulfill({ json: faqs });
      if (mode === 'slow') {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return route.fulfill({ json: faqs });
      }
      return route.fulfill({
        status: mode === 'error' ? 503 : 200,
        json: mode === 'empty' ? [] : { unexpected: true },
      });
    });
    const fallbackPage = await fallbackContext.newPage();
    fallbackPage.on('pageerror', error => report.errors.push(error.message));
    await fallbackPage.goto(baseUrl);
    if (mode === 'slow') {
      assert.ok(
        (await fallbackPage.locator('#faq [data-accordion-trigger]').count()) >=
          3
      );
      await fallbackPage
        .getByRole('button', { name: faqs[0].quest, exact: true })
        .waitFor();
    } else {
      await fallbackPage
        .getByRole('button', { name: 'Try again', exact: true })
        .waitFor();
      assert.equal(
        await fallbackPage
          .locator('#faq .sika-accordion-item')
          .first()
          .getAttribute('lang'),
        'en'
      );
      await fallbackPage
        .locator('#faq [data-accordion-trigger]')
        .first()
        .click();
      assert.equal(
        await fallbackPage
          .locator('#faq [data-accordion-trigger]')
          .first()
          .getAttribute('aria-expanded'),
        'true'
      );
      recover = true;
      await fallbackPage
        .getByRole('button', { name: 'Try again', exact: true })
        .click();
      await fallbackPage
        .getByRole('button', { name: faqs[0].quest, exact: true })
        .waitFor();
    }
    assert.match(
      await fallbackPage.locator('#faq [role="status"]').innerText(),
      /available in French/
    );
    assert.equal(
      await fallbackPage
        .locator('#faq .sika-accordion-item')
        .first()
        .getAttribute('lang'),
      'fr'
    );
    report.v21.checks.push(
      `FAQ ${mode}: content accessible, EN fallback or French notice, retry/recovery`
    );
    await fallbackContext.close();
  }
}
