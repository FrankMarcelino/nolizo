create extension if not exists "pgcrypto";

create type category_type as enum ('entrada', 'saida');
create type split_mode as enum ('igual', 'percentual', 'valorFixo');
create type expense_status as enum ('a_vencer', 'vencida', 'paga');
create type inflow_status as enum ('confirmada', 'projetada');

create table if not exists families (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists family_members (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  name text not null,
  email text,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists categories (
  id text primary key,
  family_id uuid references families(id) on delete cascade,
  name text not null,
  type category_type not null,
  is_custom boolean not null default false,
  is_favorite boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_id_format check (id ~ '^[a-z0-9_]+$')
);

create unique index if not exists categories_family_name_type_unique
  on categories (coalesce(family_id, '00000000-0000-0000-0000-000000000000'::uuid), lower(name), type);

create table if not exists inflows (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  member_id uuid references family_members(id) on delete set null,
  amount numeric(12, 2) not null check (amount > 0),
  category_id text not null references categories(id),
  source text not null,
  inflow_date date not null,
  status inflow_status not null default 'confirmada',
  recurrence text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  amount numeric(12, 2) not null check (amount > 0),
  category_id text not null references categories(id),
  description text,
  due_date date not null,
  status expense_status not null default 'a_vencer',
  split_mode split_mode not null default 'igual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists expense_shares (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid not null references expenses(id) on delete cascade,
  member_id uuid not null references family_members(id) on delete restrict,
  percentage numeric(7, 4),
  fixed_amount numeric(12, 2),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint expense_shares_member_once unique (expense_id, member_id),
  constraint expense_shares_percentage_non_negative check (percentage is null or percentage >= 0),
  constraint expense_shares_fixed_non_negative check (fixed_amount is null or fixed_amount >= 0)
);

create index if not exists expenses_family_due_date_idx on expenses (family_id, due_date);
create index if not exists expenses_family_status_idx on expenses (family_id, status);
create index if not exists inflows_family_date_idx on inflows (family_id, inflow_date);

create or replace function trg_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_families_updated_at on families;
create trigger trg_families_updated_at before update on families
for each row execute function trg_set_updated_at();

drop trigger if exists trg_family_members_updated_at on family_members;
create trigger trg_family_members_updated_at before update on family_members
for each row execute function trg_set_updated_at();

drop trigger if exists trg_categories_updated_at on categories;
create trigger trg_categories_updated_at before update on categories
for each row execute function trg_set_updated_at();

drop trigger if exists trg_inflows_updated_at on inflows;
create trigger trg_inflows_updated_at before update on inflows
for each row execute function trg_set_updated_at();

drop trigger if exists trg_expenses_updated_at on expenses;
create trigger trg_expenses_updated_at before update on expenses
for each row execute function trg_set_updated_at();

drop trigger if exists trg_expense_shares_updated_at on expense_shares;
create trigger trg_expense_shares_updated_at before update on expense_shares
for each row execute function trg_set_updated_at();
