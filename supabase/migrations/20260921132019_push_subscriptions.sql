create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  family_id uuid not null references families(id) on delete cascade,
  member_id uuid references family_members(id) on delete cascade,
  -- endpoint identifica o navegador/aparelho. UNIQUE para que reinscrever
  -- ATUALIZE em vez de criar duplicata: o mesmo aparelho reinscreve sempre que
  -- a permissao e reconcedida ou a inscricao expira.
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists push_subscriptions_family_idx
  on push_subscriptions (family_id);

alter table push_subscriptions enable row level security;

create policy "push_subscriptions_own" on push_subscriptions
  for all using (family_id = public.user_family_id());

drop trigger if exists trg_push_subscriptions_updated_at on push_subscriptions;
create trigger trg_push_subscriptions_updated_at before update on push_subscriptions
for each row execute function trg_set_updated_at();
