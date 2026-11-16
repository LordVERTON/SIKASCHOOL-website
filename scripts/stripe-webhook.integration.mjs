// Full local HTTP -> signed handler -> Supabase RPC -> ledger/balance flow.
// Generates synthetic events locally; never contacts Stripe or charges a card.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import https from 'node:https';
import http from 'node:http';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import nextEnv from '@next/env';

nextEnv.loadEnvConfig(process.cwd(), true);
const baseURL = new URL(process.argv[2] || 'https://localhost:3000');
assert.ok(['localhost', '127.0.0.1'].includes(baseURL.hostname));
assert.ok(['localhost', '127.0.0.1'].includes(new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname));
assert.ok(process.env.STRIPE_WEBHOOK_SECRET, 'A local webhook secret must be configured');
const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY,
  { auth: { persistSession: false, autoRefreshToken: false } });
const stripe = new Stripe('sk_test_local_no_external_calls');
const suffix = randomUUID();
const { data, error } = await db.auth.admin.createUser({ email: `webhook-${suffix}@example.invalid`,
  password: randomUUID(), email_confirm: true, user_metadata: { first_name: 'Test', last_name: 'Webhook' } });
assert.equal(error, null);
const studentId = data.user.id;
const meta = { sikaschool_student_id: studentId, plan_id: 'pack_eco_college',
  plan_kind: 'PACK', plan_level: 'COLLEGE', sessions_count: '8' };
const checkout = { id: `cs_local_${suffix}`, object: 'checkout.session', mode: 'payment',
  payment_status: 'paid', amount_total: 14400, currency: 'eur', metadata: meta, invoice: null };
function post(object, valid = true) {
  const body = JSON.stringify({ id: `evt_local_${suffix}`, object: 'event', type: 'checkout.session.completed',
    created: Math.floor(Date.now() / 1000), data: { object } });
  const signature = stripe.webhooks.generateTestHeaderString({ payload: body,
    secret: valid ? process.env.STRIPE_WEBHOOK_SECRET : 'invalid-test-secret' });
  return new Promise((resolve, reject) => {
    const transport = baseURL.protocol === 'https:' ? https : http;
    const request = transport.request(new URL('/api/webhooks/stripe', baseURL), {
      method: 'POST', rejectUnauthorized: false, timeout: 15000,
      headers: { 'Content-Type': 'application/json', 'stripe-signature': signature },
    }, response => {
      response.resume(); response.on('end', () => resolve(response.statusCode));
    });
    request.on('timeout', () => request.destroy(new Error('Local webhook timed out')));
    request.on('error', reject); request.end(body);
  });
}
try {
  assert.equal(await post(checkout, false), 400);
  assert.equal(await post({ ...checkout, payment_status: 'unpaid' }), 200);
  const before = await db.from('student_credit_ledger').select('id').eq('student_id', studentId);
  assert.equal(before.error, null); assert.equal(before.data.length, 0);
  const statuses = await Promise.all(Array.from({ length: 4 }, () => post(checkout)));
  assert.deepEqual(statuses, [200, 200, 200, 200]);
  const ledger = await db.from('student_credit_ledger').select('delta, payment_id, stripe_event_id').eq('student_id', studentId);
  assert.equal(ledger.error, null); assert.equal(ledger.data.length, 1); assert.equal(ledger.data[0].delta, 8);
  const balance = await db.from('student_credits').select('remaining_sessions, total_purchased').eq('student_id', studentId).single();
  assert.equal(balance.error, null); assert.equal(balance.data.remaining_sessions, 8); assert.equal(balance.data.total_purchased, 8);
  const payment = await db.from('payments').select('status, amount_cents').eq('id', ledger.data[0].payment_id).single();
  assert.equal(payment.error, null); assert.equal(payment.data.status, 'PAID'); assert.equal(payment.data.amount_cents, 14400);
  assert.equal(await post({ ...checkout, metadata: { ...meta, sessions_count: '-8' } }), 500);
  process.stdout.write('PASS: real local signed HTTP webhook, invalid signature, unpaid guard, 4 replays, atomic DB records, safe failure\n');
} finally {
  const cleanup = await db.auth.admin.deleteUser(studentId);
  assert.equal(cleanup.error, null);
}
