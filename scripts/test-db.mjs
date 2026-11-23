// Runs every SQL migration against an in-memory Postgres (PGlite), then checks
// that signed-in users can use their own data and nobody else's. Usage: npm run test:db
//
// Like a new Supabase project, tables start with NO grants to the API roles, so
// the migrations themselves must grant access (see 0002_grant_table_access.sql).
import { PGlite } from '@electric-sql/pglite';
import { readdirSync, readFileSync } from 'node:fs';

const db = new PGlite();
const A = '11111111-1111-1111-1111-111111111111';
const B = '22222222-2222-2222-2222-222222222222';

// Minimal stand-in for Supabase's auth schema and roles.
await db.exec(`
  create role anon; create role authenticated;
  create schema auth;
  create table auth.users (id uuid primary key, email text);
  create function auth.uid() returns uuid language sql stable as
    $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
  grant usage on schema auth, public to anon, authenticated;
  grant execute on function auth.uid() to anon, authenticated;
`);
const migrationsDir = new URL('../supabase/migrations/', import.meta.url);
for (const file of readdirSync(migrationsDir)
  .filter((f) => f.endsWith('.sql'))
  .sort()) {
  await db.exec(readFileSync(new URL(file, migrationsDir), 'utf8'));
}
await db.exec(`insert into auth.users values ('${A}','a@x.com'),('${B}','b@x.com');`);

const n = (await db.query(`select count(*)::int c from public.categories`)).rows[0].c;
console.log('seeded categories (2 users):', n);

async function as(uid, sql) {
  await db.exec(`set role authenticated; select set_config('request.jwt.claim.sub','${uid}',false);`);
  try {
    return await db.query(sql);
  } finally {
    await db.exec(`reset role;`);
  }
}
const check = (label, ok) => {
  console.log((ok ? 'PASS ' : 'FAIL ') + label);
  if (!ok) process.exitCode = 1;
};

const aCats = await as(A, `select id from public.categories`);
check('user A sees only own 10 categories', aCats.rows.length === 10);
const bCat = (await db.query(`select id from public.categories where user_id='${B}' limit 1`)).rows[0].id;
const aCat = aCats.rows[0].id;

await as(A, `insert into public.expenses (amount, category_id, note) values (12.50, '${aCat}', 'lunch')`);
check('user A can add an expense', (await as(A, `select * from public.expenses`)).rows.length === 1);
check('user B cannot see A expense', (await as(B, `select * from public.expenses`)).rows.length === 0);

let blocked = false;
try {
  await as(A, `insert into public.expenses (amount, category_id) values (5, '${bCat}')`);
} catch {
  blocked = true;
}
check('A cannot use B category', blocked);

blocked = false;
try {
  await as(A, `insert into public.expenses (user_id, amount) values ('${B}', 5)`);
} catch {
  blocked = true;
}
check('A cannot insert rows as B', blocked);

blocked = false;
try {
  await as(A, `insert into public.expenses (amount) values (-3)`);
} catch {
  blocked = true;
}
check('negative amount rejected', blocked);

const aCat2 = aCats.rows[1].id;
await as(
  A,
  `insert into public.budgets (category_id, month, amount) values ('${aCat2}', '2026-11-01', 100)
  on conflict (user_id, category_id, month) do update set amount = excluded.amount`,
);
await as(
  A,
  `insert into public.budgets (category_id, month, amount) values ('${aCat2}', '2026-11-01', 250)
  on conflict (user_id, category_id, month) do update set amount = excluded.amount`,
);
const budgetRows = (await as(A, `select amount::float8 a from public.budgets`)).rows;
check('budget upsert updates instead of duplicating', budgetRows.length === 1 && budgetRows[0].a === 250);
check('user B cannot see A budget', (await as(B, `select * from public.budgets`)).rows.length === 0);

await as(A, `delete from public.categories where id='${aCat}'`);
const e = (await as(A, `select category_id, user_id from public.expenses`)).rows[0];
check('deleting category keeps expense uncategorised', e.category_id === null && e.user_id === A);

await db.exec(`set role anon; select set_config('request.jwt.claim.sub','',false);`);
let anonBlocked = false;
try {
  await db.query(`select * from public.expenses`);
} catch {
  anonBlocked = true;
}
await db.exec(`reset role;`);
check('anonymous visitor is denied access', anonBlocked);
