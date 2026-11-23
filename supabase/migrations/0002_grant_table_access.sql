-- =============================================================================
-- Expense Tracker: allow signed-in users to reach the tables through the API
--
-- Newer Supabase projects don't automatically expose new tables to the API
-- roles. Without these grants, every request fails with
-- "permission denied for table ...".
--
-- Only the `authenticated` role gets access; signed-out visitors (`anon`) get
-- none. Row-Level Security (from 0001) still limits each user to their own rows.
--
-- Safe to run more than once.
-- =============================================================================

grant usage on schema public to authenticated;

grant select, insert, update, delete
  on public.categories, public.expenses, public.budgets
  to authenticated;
