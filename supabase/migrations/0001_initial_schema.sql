-- =============================================================================
-- Expense Tracker: initial schema
-- Run once in the Supabase dashboard: SQL Editor -> New query -> paste -> Run.
--
-- Every table has Row-Level Security (RLS): a signed-in user can only read and
-- write their own rows. The public anon key alone cannot access anyone's data.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------
create table public.categories (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null default auth.uid() references auth.users (id) on delete cascade,
  name        text not null check (char_length(name) between 1 and 40),
  color       text not null default 'lavender'
              check (color in ('lavender', 'mint', 'peach', 'sky', 'rose', 'butter')),
  icon        text not null default 'tag',
  created_at  timestamptz not null default now(),
  unique (user_id, name),
  unique (id, user_id) -- lets other tables enforce same-owner references
);

-- ---------------------------------------------------------------------------
-- Expenses
-- ---------------------------------------------------------------------------
create table public.expenses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category_id  uuid,
  amount       numeric(12, 2) not null check (amount > 0),
  currency     char(3) not null default 'USD',
  spent_on     date not null default current_date,
  note         text check (note is null or char_length(note) <= 200),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  -- A category must belong to the same user; deleting it keeps the expense uncategorised.
  foreign key (category_id, user_id)
    references public.categories (id, user_id)
    on delete set null (category_id)
);

create index expenses_user_spent_on_idx on public.expenses (user_id, spent_on desc);
create index expenses_category_idx on public.expenses (category_id);

-- ---------------------------------------------------------------------------
-- Monthly budgets (one per category per month)
-- ---------------------------------------------------------------------------
create table public.budgets (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null default auth.uid() references auth.users (id) on delete cascade,
  category_id  uuid not null,
  month        date not null check (extract(day from month) = 1), -- first day of the month
  amount       numeric(12, 2) not null check (amount > 0),
  created_at   timestamptz not null default now(),
  unique (user_id, category_id, month),
  foreign key (category_id, user_id)
    references public.categories (id, user_id)
    on delete cascade
);

-- ---------------------------------------------------------------------------
-- Keep expenses.updated_at current
-- ---------------------------------------------------------------------------
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger expenses_set_updated_at
  before update on public.expenses
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------------------
alter table public.categories enable row level security;
alter table public.expenses   enable row level security;
alter table public.budgets    enable row level security;

create policy "Users manage their own categories"
  on public.categories for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage their own expenses"
  on public.expenses for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

create policy "Users manage their own budgets"
  on public.budgets for all to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- Give every new user a starter set of categories
-- ---------------------------------------------------------------------------
create function public.seed_default_categories()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.categories (user_id, name, color, icon) values
    (new.id, 'Food & Dining',  'peach',    'utensils'),
    (new.id, 'Groceries',      'mint',     'shopping-basket'),
    (new.id, 'Transport',      'sky',      'car'),
    (new.id, 'Housing',        'lavender', 'home'),
    (new.id, 'Bills & Utilities', 'butter', 'receipt'),
    (new.id, 'Shopping',       'rose',     'shopping-bag'),
    (new.id, 'Entertainment',  'lavender', 'film'),
    (new.id, 'Health',         'mint',     'heart-pulse'),
    (new.id, 'Travel',         'sky',      'plane'),
    (new.id, 'Other',          'butter',   'tag');
  return new;
end;
$$;

-- Only the trigger should call this function.
revoke execute on function public.seed_default_categories() from public, anon, authenticated;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.seed_default_categories();
