alter table expenses
  add column priority int not null default 3 check (priority between 1 and 5),
  add column interest_rate numeric(5, 2) default 0,
  add column penalty_amount numeric(12, 2) default 0;

comment on column expenses.priority is '1=maxima, 5=minima. Definida pelo usuario.';
comment on column expenses.interest_rate is 'Taxa de juros mensal (%) informada pelo usuario.';
comment on column expenses.penalty_amount is 'Valor de multa por atraso informado pelo usuario.';
