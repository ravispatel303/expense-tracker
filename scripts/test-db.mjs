// Runs the SQL migration against an in-memory Postgres (PGlite) and checks
// that Row-Level Security keeps each user's data private. Usage: npm run test:db
import { PGlite } from '@electric-sql/pglite';
import { readFileSync } from 'node:fs';

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
await db.exec(
  readFileSync(new URL('../supabase/migrations/0001_initial_schema.sql', import.meta.url), 'utf8'),
);
await db.exec(`grant select, insert, update, delete on all tables in schema public to anon, authenticated;`);
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

await as(A, `delete from public.categories where id='${aCat}'`);
const e = (await as(A, `select category_id, user_id from public.expenses`)).rows[0];
check('deleting category keeps expense uncategorised', e.category_id === null && e.user_id === A);

await db.exec(`set role anon; select set_config('request.jwt.claim.sub','',false);`);
const anonRows = (await db.query(`select * from public.expenses`)).rows.length;
await db.exec(`reset role;`);
check('anonymous visitor sees nothing', anonRows === 0);
