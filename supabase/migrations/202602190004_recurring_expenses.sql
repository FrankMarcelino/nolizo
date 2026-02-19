create type recurrence_type as enum ('unica', 'mensal', 'anual');

alter table expenses
  add column recurrence recurrence_type not null default 'unica',
  add column recurrence_parent_id uuid references expenses(id) on delete set null,
  add column installment_number int,
  add column total_installments int;

create index if not exists expenses_recurrence_parent_idx
  on expenses (recurrence_parent_id) where recurrence_parent_id is not null;
