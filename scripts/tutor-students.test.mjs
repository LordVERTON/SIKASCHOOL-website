import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import test from 'node:test';
import vm from 'node:vm';

const require = createRequire(import.meta.url);
const ts = require('typescript');
const code = ts.transpileModule(
  readFileSync(new URL('../app/api/tutor/students/route.ts', import.meta.url), 'utf8'),
  { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } },
).outputText;

const tutor = { id: 'tutor-id', role: 'TUTOR' };
const profile = {
  id: 'student-user-id', first_name: 'Léa', last_name: 'Démo',
  email: 'student@example.com', avatar_url: null, phone: '0123456789', postal_code: '1200',
};
const details = {
  user_id: profile.id, grade_level: 'Terminale', academic_goals: 'Réussir le bac',
  learning_style: JSON.stringify({ subject: 'Mathématiques', goalSummary: 'Progresser' }),
  phone: null, postal_code: null,
};
const assignment = (students) => ({
  id: 'assignment-id', student_id: profile.id, assigned_at: '2026-11-14', notes: null,
  student: { ...profile, students },
});

function setup({ assignments = [], error = null, user = tutor } = {}) {
  const calls = { filters: [], queries: 0 };
  const query = {
    select: () => query,
    eq: (key, value) => { calls.filters.push([key, value]); return query; },
    order: async () => ({ data: assignments, error }),
  };
  const route = { exports: {} };
  vm.runInNewContext(code, {
    exports: route.exports,
    console: { error() {}, warn() {} },
    require: (name) => {
      if (name === '@/lib/auth') return { getUserSession: async () => user };
      if (name === '@/lib/admin-permissions') return { canAccessTutorFeatures: (u) => u.role === 'TUTOR' };
      if (name === '@/lib/supabase') return {
        supabaseAdmin: { from: (table) => {
          assert.equal(table, 'tutor_student_assignments');
          calls.queries++;
          return query;
        } },
      };
      return require(name);
    },
  });
  return { get: route.exports.GET, calls };
}

for (const [shape, students] of [['object', details], ['array', [details]]]) {
  test(`Assigned student ${shape} relation supplies a message recipient and profile details`, async () => {
    const api = setup({ assignments: [assignment(students)] });
    const response = await api.get();
    assert.equal(response.status, 200);
    const { students: recipients, count } = await response.json();
    assert.equal(count, 1);
    assert.equal(recipients[0].id, profile.id);
    assert.equal(recipients[0].name, 'Léa Démo');
    assert.equal(recipients[0].email, profile.email);
    assert.equal(recipients[0].level, 'Terminale');
    assert.equal(recipients[0].preferredSubject, 'Mathématiques');
    assert.equal(recipients[0].academic_goals, 'Réussir le bac');
    assert.equal(recipients[0].phone, profile.phone);
    assert.equal(recipients[0].postalCode, profile.postal_code);
    assert.deepEqual(api.calls.filters, [['tutor_id', tutor.id], ['is_active', true]]);
  });
}

for (const students of [null, []]) {
  test(`A missing student detail record (${JSON.stringify(students)}) still allows messaging`, async () => {
    const response = await setup({ assignments: [assignment(students)] }).get();
    assert.equal(response.status, 200);
    const { students: recipients } = await response.json();
    assert.equal(recipients[0].id, profile.id);
    assert.equal(recipients[0].level, 'Débutant');
  });
}

test('An unavailable joined profile does not break the remaining recipients', async () => {
  const response = await setup({ assignments: [{ ...assignment(null), student: null }, assignment(details)] }).get();
  assert.equal(response.status, 200);
  assert.equal((await response.json()).count, 1);
});

test('Invalid intake JSON does not prevent choosing a recipient', async () => {
  const response = await setup({ assignments: [assignment({ ...details, learning_style: 'visual' })] }).get();
  assert.equal(response.status, 200);
  const { students } = await response.json();
  assert.equal(students[0].intake, null);
  assert.equal(students[0].academic_goals, details.academic_goals);
});

test('No assignments returns an empty recipient list', async () => {
  const response = await setup().get();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { students: [], count: 0 });
});

test('Database failures remain errors instead of appearing as no assigned students', async () => {
  const response = await setup({ assignments: null, error: { message: 'Unavailable' } }).get();
  assert.equal(response.status, 500);
});

for (const user of [null, { id: 'student-id', role: 'STUDENT' }]) {
  test(`Unauthorized ${user?.role || 'anonymous'} requests never query assignments`, async () => {
    const api = setup({ user });
    assert.equal((await api.get()).status, 401);
    assert.equal(api.calls.queries, 0);
  });
}
