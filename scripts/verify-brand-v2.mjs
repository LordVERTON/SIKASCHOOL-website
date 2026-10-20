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
const output = resolve('artifacts/brand-v2');
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
    for (const width of [320, 768, 1440]) {
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
      assert.match(state.bodyFont.toLowerCase(), /sourcehanserif/);
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
  const select = page.locator('#hero-subject');
  const chosenSubject = await select
    .locator('option')
    .nth(1)
    .getAttribute('value');
  await select.selectOption(chosenSubject);
  const launches = [
    {
      label: 'hero with subject',
      locator: page.locator('.sika-hero-grid .sika-button').first(),
      subject: true,
    },
    {
      label: 'subject CTA',
      locator: page.locator('.sika-subject-bar button'),
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
