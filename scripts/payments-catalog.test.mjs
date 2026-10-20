import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import vm from 'node:vm';
const require = createRequire(import.meta.url);
const ts = require('typescript');
const catalogSource = readFileSync(
  new URL('../lib/payments-catalog.ts', import.meta.url),
  'utf8'
);
const catalogJs = ts.transpileModule(catalogSource, {
  compilerOptions: {
    module: ts.ModuleKind.ESNext,
    target: ts.ScriptTarget.ES2020,
  },
}).outputText;
const { CLIENT_PLANS, formatEuros, getPlanPricing } = await import(
  `data:text/javascript;base64,${Buffer.from(catalogJs).toString('base64')}`
);
const campaignJs = ts.transpileModule(
  readFileSync(new URL('../lib/campaigns.ts', import.meta.url), 'utf8'),
  {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
    },
  }
).outputText;
const { isCampaignActive, getActiveCampaign } = await import(
  `data:text/javascript;base64,${Buffer.from(campaignJs).toString('base64')}`
);
const returnPathJs = ts.transpileModule(
  readFileSync(
    new URL('../lib/public-offer-return.ts', import.meta.url),
    'utf8'
  ),
  {
    compilerOptions: {
      module: ts.ModuleKind.ESNext,
      target: ts.ScriptTarget.ES2020,
    },
  }
).outputText;
const { getPublicOfferReturnPath } = await import(
  `data:text/javascript;base64,${Buffer.from(returnPathJs).toString('base64')}`
);
test('Public offer return is limited to allowed roles and exact local paths', () => {
  for (const role of ['STUDENT', 'PARENT']) {
    assert.equal(getPublicOfferReturnPath('/packs', role), '/packs');
    assert.equal(
      getPublicOfferReturnPath('/book-online', role),
      '/book-online'
    );
    for (const path of [
      null,
      undefined,
      '//example.invalid',
      'https://example.invalid',
      '/admin',
      '/packs/../admin',
      '/packs?next=https://example.invalid',
    ]) {
      assert.equal(getPublicOfferReturnPath(path, role), null);
    }
  }
  for (const role of ['TUTOR', 'ADMIN', 'UNKNOWN'])
    assert.equal(getPublicOfferReturnPath('/packs', role), null);
});

test('No unapproved seasonal offer is active by default', () => {
  assert.equal(getActiveCampaign(), null);
});
test('Campaign dates include the start and exclude the end', () => {
  const campaign = {
    enabled: true,
    startsAt: '2030-01-01T00:00:00Z',
    endsAt: '2030-02-01T00:00:00Z',
  };
  assert.equal(
    isCampaignActive(campaign, new Date('2029-12-31T23:59:59Z')),
    false
  );
  assert.equal(isCampaignActive(campaign, new Date(campaign.startsAt)), true);
  assert.equal(
    isCampaignActive(campaign, new Date('2030-01-31T23:59:59Z')),
    true
  );
  assert.equal(isCampaignActive(campaign, new Date(campaign.endsAt)), false);
  assert.equal(
    isCampaignActive(
      { ...campaign, enabled: false },
      new Date(campaign.startsAt)
    ),
    false
  );
});
test('Invalid, missing or ambiguous campaign dates cannot activate an offer', () => {
  for (const [startsAt, endsAt] of [
    [null, null],
    ['invalid', 'invalid'],
    ['2030-01-01T00:00:00', '2030-02-01T00:00:00'],
    ['2030-02-01T00:00:00Z', '2030-01-01T00:00:00Z'],
  ]) {
    assert.equal(
      isCampaignActive(
        { enabled: true, startsAt, endsAt },
        new Date('2030-01-15T00:00:00Z')
      ),
      false
    );
  }
});

const cases = [
  ['pack_eco_college', 14400, 1800, 5600],
  ['pack_eco_lycee', 17600, 2200, 6400],
  ['pack_eco_superieur', 22400, 2800, 8000],
  ['pack_basic_college', 8800, 2200, 1200],
  ['pack_basic_lycee', 10800, 2700, 1200],
  ['pack_basic_superieur', 12800, 3200, 2400],
];
for (const [id, total, unit, savings] of cases) {
  test(`${id}: total, unit cost and savings use the same level`, () => {
    const plan = CLIENT_PLANS.find(plan => plan.id === id);
    assert.equal(plan.priceCents, total);
    assert.deepEqual(getPlanPricing(plan), {
      perSessionCents: unit,
      referenceCents: total + savings,
      savingsCents: savings,
    });
  });
}
test('Single sessions never advertise savings', () => {
  for (const plan of CLIENT_PLANS.filter(plan => plan.kind === 'SESSION')) {
    assert.equal(getPlanPricing(plan).savingsCents, 0);
    assert.equal(getPlanPricing(plan).perSessionCents, plan.priceCents);
  }
});
test('A missing or more expensive reference cannot invent a saving', () => {
  assert.equal(
    getPlanPricing({ ...CLIENT_PLANS[0], level: 'UNKNOWN' }).savingsCents,
    0
  );
  assert.equal(
    getPlanPricing({ ...CLIENT_PLANS[0], priceCents: 99999 }).savingsCents,
    0
  );
});
test('Euro formatting preserves cents', () => {
  assert.match(formatEuros(1975), /19,75\s*€/);
});
test('Stripe Checkout consumes the public catalog without changing amounts or IDs', () => {
  // Load the actual server module without a live key or any Stripe network access.
  const source = readFileSync(
    new URL('../lib/stripe.ts', import.meta.url),
    'utf8'
  );
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020,
    },
  }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, {
    exports,
    process: { env: { NODE_ENV: 'test' } },
    require: name => {
      if (name === './payments-catalog') return { CLIENT_PLANS };
      if (name === 'stripe') return {};
      throw new Error(`Unexpected dependency: ${name}`);
    },
  });
  assert.equal(Object.keys(exports.PLANS).length, CLIENT_PLANS.length);
  for (const plan of CLIENT_PLANS) {
    const serverPlan = exports.getPlan(plan.id);
    for (const key of [
      'id',
      'kind',
      'level',
      'priceCents',
      'sessions',
      'recurringInterval',
    ]) {
      assert.equal(serverPlan[key], plan[key], `${plan.id}: ${key}`);
    }
    assert.equal(serverPlan.currency, 'eur');
  }
  assert.equal(exports.getPlan('unknown'), null);
});
