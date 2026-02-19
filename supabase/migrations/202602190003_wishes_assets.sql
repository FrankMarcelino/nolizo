create type wish_importance as enum ('baixa', 'media', 'alta', 'essencial');

create table if not exists wishes (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  name text not null,
  target_amount numeric(12, 2) not null check (target_amount > 0),
  importance wish_importance not null default 'media',
  target_date date,
  notes text,
  fulfilled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  name text not null,
  estimated_value numeric(12, 2) not null check (estimated_value >= 0),
  acquisition_date date,
  category text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists wishes_family_idx on wishes (family_id);
create index if not exists assets_family_idx on assets (family_id);

drop trigger if exists trg_wishes_updated_at on wishes;
create trigger trg_wishes_updated_at before update on wishes
for each row execute function trg_set_updated_at();

drop trigger if exists trg_assets_updated_at on assets;
create trigger trg_assets_updated_at before update on assets
for each row execute function trg_set_updated_at();
