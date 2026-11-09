import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const { NextRequest } = require('next/server');
const code = ts.transpileModule(
  readFileSync(new URL('../app/api/auth/login/route.ts', import.meta.url), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
).outputText;

function setup({ profile = { first_name: 'Test', last_name: 'User', role: 'TUTOR', is_active: true }, profileError = null, authError = null } = {}) {
  const calls = { profile: 0, signIn: 0, twoFactor: 0, logs: [] };
  const route = { exports: {} };
  const user = { id: 'test-user-id', email: 'test@example.com' };
  vm.runInNewContext(code, {
    exports: route.exports,
    process: { env: {} },
    console: { error: (...args) => calls.logs.push(args) },
    require: name => {
      if (name === 'next-auth') return { AuthError: class AuthError extends Error {} };
      if (name === '@supabase/supabase-js') return {
        createClient: () => ({ auth: { signInWithPassword: async () => ({ data: { user }, error: authError }) } }),
      };
      if (name === '@/auth') return { signIn: async () => { calls.signIn++; } };
      if (name === '@/lib/supabase') return {
        supabaseAdmin: {
          from: table => {
            assert.equal(table, 'profiles');
            calls.profile++;
            return { select: () => ({ eq: (column, id) => {
              assert.equal(column, 'id');
              assert.equal(id, user.id);
              return { maybeSingle: async () => ({ data: profile, error: profileError }) };
            } }) };
          },
        },
      };
      if (name === '@/lib/sms-2fa') return { isSms2faEnabled: async () => { calls.twoFactor++; return false; } };
      return require(name);
    },
  });
  return {
    calls,
    post: () => route.exports.POST(new NextRequest('https://sikaschool.example/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: user.email, password: 'example-password' }),
    })),
  };
}

for (const error of [
  { code: 'PGRST205', message: 'Could not find the table public.profiles in the schema cache' },
  { code: '42501', message: 'permission denied for table profiles' },
  { message: 'fetch failed' },
]) {
  test(`Profile lookup failure ${error.code || 'network'} reports unavailability and blocks session creation`, async () => {
    const api = setup({ profile: null, profileError: error });
    const response = await api.post();
    assert.equal(response.status, 503);
    assert.match((await response.json()).error, /temporairement indisponible/);
    assert.equal(api.calls.signIn, 0);
    assert.equal(api.calls.twoFactor, 0);
    assert.equal(api.calls.logs.length, 1);
  });
}

for (const profile of [null, { is_active: null }]) {
  test(`A ${profile ? 'incomplete' : 'missing'} profile cannot create a session`, async () => {
    const api = setup({ profile });
    const response = await api.post();
    assert.equal(response.status, 403);
    assert.match((await response.json()).error, /Profil utilisateur indisponible/);
    assert.equal(api.calls.signIn, 0);
    assert.equal(api.calls.twoFactor, 0);
  });
}

test('A genuinely disabled account still receives the disabled account error', async () => {
  const api = setup({ profile: { is_active: false } });
  const response = await api.post();
  assert.equal(response.status, 403);
  assert.deepEqual(await response.json(), { error: 'Compte désactivé' });
  assert.equal(api.calls.signIn, 0);
  assert.equal(api.calls.twoFactor, 0);
});

test('An active profile can create a session and receives its application role', async () => {
  const api = setup();
  const response = await api.post();
  assert.equal(response.status, 200);
  const result = await response.json();
  assert.equal(result.success, true);
  assert.equal(result.user.role, 'TUTOR');
  assert.equal(api.calls.signIn, 1);
  assert.equal(api.calls.twoFactor, 1);
  assert.equal(api.calls.logs.length, 0);
});

test('Invalid credentials never reach the profile lookup or create a session', async () => {
  const api = setup({ authError: { message: 'Invalid login credentials' } });
  const response = await api.post();
  assert.equal(response.status, 401);
  assert.equal(api.calls.profile, 0);
  assert.equal(api.calls.signIn, 0);
});
