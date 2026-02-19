create or replace function public.create_expense_with_shares(
  p_family_id uuid,
  p_amount numeric,
  p_category_id text,
  p_description text,
  p_due_date date,
  p_status expense_status,
  p_split_mode split_mode,
  p_responsible_member_ids uuid[],
  p_shares jsonb
)
returns table (
  id uuid,
  family_id uuid,
  amount numeric,
  category_id text,
  description text,
  due_date date,
  status expense_status,
  split_mode split_mode,
  shares jsonb
)
language plpgsql
security definer
as $$
declare
  v_expense_id uuid;
  v_share_count int;
  v_total_percentage numeric;
  v_total_fixed numeric;
begin
  if p_amount <= 0 then
    raise exception 'amount must be greater than zero';
  end if;

  if array_length(p_responsible_member_ids, 1) is null then
    raise exception 'at least one responsible member is required';
  end if;

  insert into public.expenses (family_id, amount, category_id, description, due_date, status, split_mode)
  values (p_family_id, p_amount, p_category_id, p_description, p_due_date, p_status, p_split_mode)
  returning expenses.id into v_expense_id;

  insert into public.expense_shares (expense_id, member_id, percentage, fixed_amount)
  select
    v_expense_id,
    (entry->>'memberId')::uuid,
    nullif(entry->>'percentage', '')::numeric,
    nullif(entry->>'fixedAmount', '')::numeric
  from jsonb_array_elements(p_shares) as entry;

  select count(*) into v_share_count
  from public.expense_shares
  where expense_id = v_expense_id;

  if v_share_count <> array_length(p_responsible_member_ids, 1) then
    raise exception 'shares count must match responsible members count';
  end if;

  if p_split_mode = 'percentual' then
    select coalesce(sum(percentage), 0) into v_total_percentage
    from public.expense_shares
    where expense_id = v_expense_id;

    if abs(v_total_percentage - 100) > 0.01 then
      raise exception 'percentual shares must sum to 100';
    end if;
  end if;

  if p_split_mode = 'valorFixo' then
    select coalesce(sum(fixed_amount), 0) into v_total_fixed
    from public.expense_shares
    where expense_id = v_expense_id;

    if abs(v_total_fixed - p_amount) > 0.01 then
      raise exception 'fixed shares must sum to amount';
    end if;
  end if;

  return query
  select
    e.id,
    e.family_id,
    e.amount,
    e.category_id,
    e.description,
    e.due_date,
    e.status,
    e.split_mode,
    (
      select jsonb_agg(
        jsonb_build_object(
          'memberId', s.member_id,
          'percentage', s.percentage,
          'fixedAmount', s.fixed_amount
        )
      )
      from public.expense_shares s
      where s.expense_id = e.id
    ) as shares
  from public.expenses e
  where e.id = v_expense_id;
end;
$$;
