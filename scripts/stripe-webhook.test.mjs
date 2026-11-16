import assert from 'node:assert/strict';
import test from 'node:test';
import { loadModule } from './test-module.mjs';

const studentId = '10000000-0000-4000-8000-000000000001';
const meta = { sikaschool_student_id: studentId, plan_id: 'pack_eco_college',
  plan_kind: 'PACK', plan_level: 'COLLEGE', sessions_count: '8' };
const paymentModule = loadModule('lib/stripe-payment.ts');
function setup({ dbError = null } = {}) {
  const calls = { rpc: [], queries: [], retrieves: [] };
  const db = {
    rpc: async (name, payload) => { calls.rpc.push({ name, payload }); return { error: dbError }; },
    from: table => {
      const query = { table };
      calls.queries.push(query);
      const chain = {
        update: value => { query.update = value; return chain; },
        upsert: value => { query.upsert = value; return chain; },
        eq: () => chain,
        in: (key, values) => { query.filter = { key, values }; return chain; },
        then: resolve => resolve({ error: dbError }),
      };
      return chain;
    },
  };
  const stripe = {
    invoices: { retrieve: async id => { calls.retrieves.push(id); return { id }; } },
    subscriptions: { retrieve: async id => ({ id, metadata: { ...meta, plan_kind: 'SUBSCRIPTION', sessions_count: '4' },
      status: 'canceled', items: { data: [] }, customer: 'cus_test', cancel_at_period_end: false }) },
  };
  const service = loadModule('lib/stripe-webhook.ts', {
    '@/lib/stripe': { stripe }, '@/lib/supabase': { supabaseAdmin: db },
    '@/lib/stripe-payment': paymentModule,
  });
  return { calls, process: (type, object) => service.processStripeEvent({ id: 'evt_test', created: 1800000000, type, data: { object } }) };
}
const checkout = { id: 'cs_test', mode: 'payment', payment_status: 'paid', metadata: meta,
  amount_total: 14400, currency: 'eur', payment_intent: { id: 'pi_test' } };

test('settled checkout uses exactly one atomic payment RPC with validated metadata', async () => {
  const api = setup();
  await api.process('checkout.session.completed', checkout);
  assert.equal(api.calls.rpc.length, 1);
  const { name, payload } = api.calls.rpc[0];
  assert.equal(name, 'apply_stripe_payment');
  assert.equal(payload.p_event_id, 'evt_test');
  assert.equal(payload.p_payment.stripe_payment_intent, 'pi_test');
  assert.equal(payload.p_payment.sessions_count, 8);
  assert.equal(api.calls.queries.length, 0);
});
test('unpaid checkout and subscription checkout cannot credit or double-count the first invoice', async () => {
  for (const object of [{ ...checkout, payment_status: 'unpaid' }, { ...checkout, mode: 'subscription' }]) {
    const api = setup(); await api.process('checkout.session.completed', object);
    assert.equal(api.calls.rpc.length, 0); assert.equal(api.calls.queries.length, 0);
  }
});
test('delayed payment success credits through the same transaction', async () => {
  const api = setup(); await api.process('checkout.session.async_payment_succeeded', checkout);
  assert.equal(api.calls.rpc.length, 1);
});
test('both invoice success events use the same invoice source', async () => {
  const api = setup();
  for (const type of ['invoice.paid', 'invoice.payment_succeeded']) {
    await api.process(type, { id: 'in_test', status: 'paid', parent: { subscription_details: { subscription: 'sub_test' } },
      amount_paid: 9900, currency: 'eur', status_transitions: { paid_at: 1800000000 } });
  }
  assert.equal(api.calls.rpc.length, 2);
  for (const { payload } of api.calls.rpc) {
    assert.equal(payload.p_payment.stripe_invoice_id, 'in_test');
    assert.equal(payload.p_payment.stripe_checkout_session, null);
  }
});
test('invalid metadata fails before writes', async () => {
  for (const metadata of [{ ...meta, sessions_count: '-8' }, { ...meta, plan_level: 'OTHER' }, { ...meta, sikaschool_student_id: 'bad' }]) {
    const api = setup(); await assert.rejects(api.process('checkout.session.completed', { ...checkout, metadata }));
    assert.equal(api.calls.rpc.length, 0);
  }
});
test('DB failure rejects the event so the HTTP boundary returns 500 for a retry', async () => {
  const api = setup({ dbError: { message: 'private database detail' } });
  await assert.rejects(api.process('checkout.session.completed', checkout), /transaction failed/);
});
test('late failed invoice cannot downgrade a paid or refunded payment', async () => {
  const api = setup(); await api.process('invoice.payment_failed', { id: 'in_test' });
  assert.deepEqual(Array.from(api.calls.queries[0].filter.values), ['PENDING', 'FAILED']);
});
test('subscription projection uses current Stripe state', async () => {
  const api = setup(); await api.process('customer.subscription.updated', { id: 'sub_test', status: 'active' });
  assert.equal(api.calls.queries[0].upsert.status, 'canceled');
});
test('partial refund does not mark the full payment refunded', async () => {
  const api = setup(); await api.process('charge.refunded', { payment_intent: 'pi_test', refunded: false });
  assert.equal(api.calls.queries.length, 0);
});
test('signature failures and processing failures return safe HTTP responses', async () => {
  for (const mode of ['signature', 'processing', 'success']) {
    const logs = [];
    const route = loadModule('app/api/webhooks/stripe/route.ts', {
      '@/lib/stripe': { stripe: { webhooks: { constructEvent: () => {
        if (mode === 'signature') throw new Error('private signature detail');
        return { id: 'evt_test', type: 'checkout.session.completed' };
      } } } },
      '@/lib/stripe-webhook': { processStripeEvent: async () => { if (mode === 'processing') throw new Error('private db detail'); } },
    }, { process: { env: { STRIPE_WEBHOOK_SECRET: 'test-only' } }, console: { error: (...args) => logs.push(args) } });
    const result = await route.POST(new Request('https://example.test/api/webhooks/stripe', {
      method: 'POST', headers: { 'stripe-signature': 'test-only' }, body: '{}',
    }));
    assert.equal(result.status, mode === 'signature' ? 400 : mode === 'processing' ? 500 : 200);
    assert.doesNotMatch(await result.text(), /private/);
    assert.doesNotMatch(JSON.stringify(logs), /private/);
  }
});
