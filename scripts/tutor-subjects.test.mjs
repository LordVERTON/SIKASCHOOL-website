import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';
import { createClient } from '@supabase/supabase-js';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const { NextRequest } = require('next/server');
const compile = path => ts.transpileModule(
  readFileSync(new URL(path, import.meta.url), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }
).outputText;
const routeCode = compile('../app/api/tutor-subjects/route.ts');
const catalogModule = { exports: {} };
vm.runInNewContext(compile('../lib/tutor-subjects.ts'), { exports: catalogModule.exports });
const catalog = Array.from(catalogModule.exports.TUTOR_SUBJECTS);

function setup({ rows = [], error, networkFailure = false } = {}) {
  const requests = [];
  const logs = [];
  const client = createClient('https://database.example', 'test-service-role', {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: async (url, options) => {
        requests.push({ url: new URL(url), method: options.method });
        if (networkFailure) throw new TypeError('fetch failed');
        return new Response(JSON.stringify(error || rows), {
          status: error ? 400 : 200,
          headers: { 'Content-Type': 'application/json' },
        });
      },
    },
  });
  const routeModule = { exports: {} };
  vm.runInNewContext(routeCode, {
    exports: routeModule.exports,
    require: name => {
      if (name === '@/lib/supabase') return {
        supabaseAdmin: client,
        isSupabaseUnreachableError: value => /fetch failed/.test(JSON.stringify(value)),
      };
      if (name === '@/lib/tutor-subjects') return catalogModule.exports;
      return require(name);
    },
    console: { error: (...args) => logs.push(args) },
  });
  return {
    requests,
    logs,
    get: query => routeModule.exports.GET(new NextRequest('https://sikaschool.app/api/tutor-subjects' + (query || ''))),
  };
}

test('The query follows user_id and excludes inactive accounts with an inner join', async () => {
  const api = setup({ rows: [{ subjects: [' Chimie ', 'Mathématiques'] }, { subjects: ['Chimie', 'Mathematiques', '', null] }, { subjects: null }] });
  const response = await api.get();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { subjects: ['Chimie', 'Mathématiques'] });
  assert.equal(api.requests.length, 1);
  const { url, method } = api.requests[0];
  assert.equal(method, 'GET');
  assert.equal(url.pathname, '/rest/v1/tutors');
  assert.equal(url.searchParams.get('select'), 'subjects,account:user_id!inner(is_active)');
  assert.equal(url.searchParams.get('account.is_active'), 'eq.true');
  assert.deepEqual(api.logs, []);
});

test('includeCatalog merges custom taught subjects with the catalog without duplicates', async () => {
  const api = setup({ rows: [{ subjects: ['Astronomie', 'Mathematiques'] }] });
  const response = await api.get('?includeCatalog=true');
  const { subjects } = await response.json();
  assert.equal(response.status, 200);
  assert.equal(subjects.length, catalog.length + 1);
  assert.ok(subjects.includes('Astronomie'));
  assert.ok(subjects.includes('Mathématiques'));
  assert.ok(!subjects.includes('Mathematiques'));
});

test('No active tutors retains the existing catalog fallback', async () => {
  const response = await setup().get();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { subjects: catalog });
});

test('Network failures retain the existing catalog fallback', async () => {
  const api = setup({ networkFailure: true });
  const response = await api.get();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { subjects: catalog });
  assert.deepEqual(api.logs, []);
});

test('Schema errors remain visible as 500s instead of being masked by catalog data', async () => {
  const api = setup({ error: { code: 'PGRST200', message: 'Missing relationship' } });
  const response = await api.get();
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { error: 'Erreur lors du chargement des matières' });
  assert.equal(api.logs.length, 1);
});

test('Permission errors are logged and do not expose database details in the response', async () => {
  const api = setup({ error: { code: '42501', message: 'permission denied for table tutors' } });
  const response = await api.get();
  assert.equal(response.status, 500);
  assert.deepEqual(await response.json(), { error: 'Erreur lors du chargement des matières' });
  assert.equal(api.logs.length, 1);
});
