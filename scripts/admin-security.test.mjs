import assert from 'node:assert/strict';
import test from 'node:test';
import { loadModule } from './test-module.mjs';

const permissions = loadModule('lib/admin-permissions.ts');
test('admin permission matrix rejects every non-admin including former e-mail exceptions', () => {
  for (const role of ['ADMIN', 'TUTOR', 'STUDENT', 'PARENT', 'unknown']) {
    for (const email of ['daniel.verton@sikaschool.com', 'ruudy.mbouza-bayonne@sikaschool.com', 'test@example.test']) {
      for (const guard of ['hasAdminPermissions', 'requireAdminPermissions', 'canAccessAdminFeatures']) {
        assert.equal(permissions[guard]({ role, email }), role === 'ADMIN');
      }
    }
  }
  assert.equal(permissions.hasAdminPermissions(null), false);
});
test('API session uses the current persisted role and denies inactive profiles', async () => {
  for (const profile of [{ role: 'TUTOR', is_active: true }, { role: 'ADMIN', is_active: false }, null]) {
    const api = loadModule('lib/auth.ts', {
      '@/auth': { auth: async () => ({ user: { id: 'user', email: 'test@example.test', role: 'ADMIN' } }) },
      '@/lib/constants': { ROLE_REDIRECTS: {} },
      '@/lib/supabase': { supabaseAdmin: { from: () => ({ select: () => ({ eq: () => ({ abortSignal: () => ({ maybeSingle: async () => ({ data: profile, error: null }) }) }) }) }) } },
    });
    const user = await api.getUserSession();
    assert.equal(user?.role ?? null, profile?.is_active ? 'TUTOR' : null);
  }
});
for (const role of [null, 'STUDENT', 'PARENT', 'TUTOR', 'ADMIN']) {
  test(`DB health probe permissions: ${role ?? 'anonymous'}`, async () => {
    let calls = 0;
    const route = loadModule('app/api/admin/health/route.ts', {
      '@/lib/auth': { getUserSession: async () => role ? { role } : null },
      '@/lib/admin-permissions': permissions,
      '@/lib/supabase': { supabaseAdmin: { from: table => {
        calls++; assert.equal(table, 'profiles');
        return { select: (columns, options) => {
          assert.equal(options.head, true); assert.equal(columns, 'id');
          return { limit: () => ({ abortSignal: async () => ({ error: null }) }) };
        } };
      } } },
    });
    const response = await route.GET();
    assert.equal(response.status, role === 'ADMIN' ? 200 : 403);
    assert.equal(calls, role === 'ADMIN' ? 1 : 0);
    assert.equal(response.headers.get('Cache-Control'), 'no-store');
  });
}
test('DB outage returns 503 without leaking error details', async () => {
  const route = loadModule('app/api/admin/health/route.ts', {
    '@/lib/auth': { getUserSession: async () => ({ role: 'ADMIN' }) },
    '@/lib/admin-permissions': permissions,
    '@/lib/supabase': { supabaseAdmin: { from: () => ({ select: () => ({ limit: () => ({ abortSignal: async () => ({ error: { message: 'secret' } }) }) }) }) } },
  });
  const response = await route.GET();
  assert.equal(response.status, 503);
  assert.doesNotMatch(await response.text(), /secret/);
});
