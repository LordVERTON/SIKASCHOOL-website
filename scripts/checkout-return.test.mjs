import assert from 'node:assert/strict';
import test from 'node:test';
import { loadModule } from './test-module.mjs';

for (const role of ['STUDENT', 'PARENT', 'TUTOR', 'ADMIN', null]) {
  test(`Checkout authorizes the effective student and preserves the ${role} return space`, async () => {
    const calls = [];
    const route = loadModule('app/api/student/payments/checkout/route.ts', {
      '@/lib/auth': { getUserSession: async () => role ? { id: 'account', role, email: 'test@example.invalid' } : null },
      '@/lib/student-access': {
        canAccessStudentFeatures: user => user?.role === 'STUDENT' || user?.role === 'PARENT',
        getEffectiveStudentAccess: async () => ({ effectiveStudentId: 'effective-student' }),
        getStudentSpaceBasePath: r => r === 'PARENT' ? '/family' : '/student',
      },
      '@/lib/stripe-customer': { getOrCreateStripeCustomer: async () => 'cus_test' },
      '@/lib/stripe': {
        assertStripeConfigured: () => {},
        getPlan: () => ({ id: 'test', kind: 'PACK', level: 'COLLEGE', sessions: 8, priceCents: 14400, currency: 'eur' }),
        stripe: { checkout: { sessions: { create: async value => { calls.push(value); return { id: 'cs_test', url: 'https://checkout.stripe.com/test' }; } } } },
      },
    }, { process: { env: { NEXT_PUBLIC_APP_URL: 'https://example.test' } } });
    const response = await route.POST(new Request('https://example.test/api/student/payments/checkout', {
      method: 'POST', body: JSON.stringify({ planId: 'test' }),
    }));
    const allowed = role === 'STUDENT' || role === 'PARENT';
    assert.equal(response.status, allowed ? 200 : 401);
    assert.equal(calls.length, allowed ? 1 : 0);
    if (allowed) {
      const base = role === 'PARENT' ? '/family' : '/student';
      assert.equal(calls[0].success_url, `https://example.test${base}/paiements/success?session_id={CHECKOUT_SESSION_ID}`);
      assert.equal(calls[0].cancel_url, `https://example.test${base}/paiements/cancel`);
      assert.equal(calls[0].metadata.sikaschool_student_id, 'effective-student');
    }
  });
}
