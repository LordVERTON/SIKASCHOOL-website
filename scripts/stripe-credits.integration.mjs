/* eslint-disable no-console -- CLI test results */
// Local Docker database only. Every fixture is generated for this run and removed.
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { randomUUID } from 'node:crypto';

const exec = promisify(execFile);
const container = process.env.LOCAL_DB_CONTAINER || 'supabase_db_sikaschool';
if (!/^supabase_db_[a-zA-Z0-9_-]+$/.test(container)) throw new Error('Local container required');
const student = randomUUID();
const suffix = randomUUID().replaceAll('-', '');
const literal = value => `'${String(value).replaceAll("'", "''")}'`;
async function sql(query) {
  const { stdout } = await exec('docker', ['exec', '-i', container, 'psql', '-X', '-U', 'postgres', '-d', 'postgres', '-v', 'ON_ERROR_STOP=1', '-tA', '-c', query]);
  return stdout.trim();
}
function payment(source, kind = 'PACK', sessions = 8) {
  return {
    student_id: student, stripe_checkout_session: kind === 'SUBSCRIPTION' ? null : `cs_${suffix}_${source}`,
    stripe_invoice_id: kind === 'SUBSCRIPTION' ? `in_${suffix}_${source}` : null,
    plan_id: 'test_only', kind, level: 'COLLEGE', sessions_count: sessions,
    amount_cents: 14400, currency: 'EUR', paid_at: new Date().toISOString(),
  };
}
const apply = (event, data) => `select * from public.apply_stripe_payment(${literal(`evt_${suffix}_${event}`)}, ${literal(JSON.stringify(data))}::jsonb)`;
try {
  await sql(`begin;
    insert into auth.users (id, email) values ('${student}', 'roadmap-${suffix}@example.invalid');
    insert into public.profiles (id, email, first_name, last_name, role)
      values ('${student}', 'roadmap-${suffix}@example.invalid', 'Test', 'Roadmap', 'STUDENT')
      on conflict (id) do update set role = 'STUDENT';
    commit;`);
  assert.equal(await sql("select has_function_privilege('anon', 'public.apply_stripe_payment(text,jsonb)', 'execute')"), 'f');
  assert.equal(await sql("select has_function_privilege('authenticated', 'public.apply_stripe_payment(text,jsonb)', 'execute')"), 'f');
  assert.equal(await sql("select has_function_privilege('service_role', 'public.apply_stripe_payment(text,jsonb)', 'execute')"), 't');
  const pack = payment('same_pack');
  const results = await Promise.all(Array.from({ length: 12 }, () => sql(apply('same_event', pack))));
  assert.equal(results.filter(result => result.endsWith('|t')).length, 1);
  assert.equal(results.filter(result => result.endsWith('|f')).length, 11);
  console.log('PASS: 12 concurrent replays, exactly one attribution');
  const invoice = payment('same_invoice', 'SUBSCRIPTION', 4);
  const invoices = await Promise.all(['invoice_paid', 'invoice_succeeded'].map(event => sql(apply(event, invoice))));
  assert.equal(invoices.filter(result => result.endsWith('|t')).length, 1);
  console.log('PASS: distinct event types for one invoice, exactly one attribution');
  await Promise.all(Array.from({ length: 10 }, (_, i) => sql(apply(`separate_${i}`, payment(`separate_${i}`, 'SESSION', 1)))));
  assert.equal(await sql(`select remaining_sessions || '|' || total_purchased from public.student_credits where student_id = '${student}'`), '22|22');
  assert.equal(await sql(`select sum(delta) from public.student_credit_ledger where student_id = '${student}'`), '22');
  assert.equal(await sql(`select count(*) from public.payments where student_id = '${student}'`), '12');
  console.log('PASS: concurrent distinct purchases, ledger and balance reconcile (22 credits)');
  // A failure after payment and ledger insertion must roll both back.
  await sql(`begin;
    create function pg_temp.reject_test_balance() returns trigger language plpgsql as $$
      begin if new.student_id = '${student}' then raise check_violation; end if; return new; end $$;
    create trigger roadmap_test_failure before insert or update on public.student_credits
      for each row execute function pg_temp.reject_test_balance();
    do $$ begin
      begin
        perform public.apply_stripe_payment(${literal(`evt_${suffix}_rollback`)}, ${literal(JSON.stringify(payment('rollback')))}::jsonb);
        raise exception 'Expected failure';
      exception when check_violation then null; end;
      if exists(select 1 from public.payments where stripe_checkout_session = 'cs_${suffix}_rollback')
        or exists(select 1 from public.student_credit_ledger where stripe_event_id = 'evt_${suffix}_rollback') then
        raise exception 'Partial transaction escaped rollback';
      end if;
    end $$;
    rollback;`);
  assert.ok((await sql(apply('rollback', payment('rollback')))).endsWith('|t'));
  console.log('PASS: forced balance failure rolls back payment/ledger; retry succeeds');
  // An old PAID payment without reference cannot safely be replayed.
  await sql(`insert into public.payments (student_id, stripe_checkout_session, plan_id, kind, level, sessions_count, amount_cents, status)
    values ('${student}', 'cs_${suffix}_legacy', 'test_only', 'PACK', 'COLLEGE', 8, 14400, 'PAID')`);
  await assert.rejects(sql(apply('legacy', payment('legacy'))), /Legacy payment requires reconciliation/);
  console.log('PASS: legacy paid payment requires reconciliation instead of silent recredit');
  await assert.rejects(sql(apply('invalid', { ...payment('invalid'), sessions_count: -1 })), /Invalid Stripe/);
  console.log('PASS: invalid credit amount rejected');
} finally {
  // Only UUID generated above is touched; never resets the local database.
  await sql(`begin; delete from public.profiles where id = '${student}'; delete from auth.users where id = '${student}'; commit;`);
}
