-- ================================================================
-- MIGRATIONS PENDENTES - Rodar no Supabase SQL Editor de uma vez
-- ================================================================

-- ── Migration 003: wishes & assets ──
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'wish_importance') THEN
    CREATE TYPE wish_importance AS ENUM ('baixa', 'media', 'alta', 'essencial');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS wishes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name text NOT NULL,
  target_amount numeric(12, 2) NOT NULL CHECK (target_amount > 0),
  importance wish_importance NOT NULL DEFAULT 'media',
  target_date date,
  notes text,
  fulfilled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id uuid NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  name text NOT NULL,
  estimated_value numeric(12, 2) NOT NULL CHECK (estimated_value >= 0),
  acquisition_date date,
  category text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS wishes_family_idx ON wishes (family_id);
CREATE INDEX IF NOT EXISTS assets_family_idx ON assets (family_id);

DROP TRIGGER IF EXISTS trg_wishes_updated_at ON wishes;
CREATE TRIGGER trg_wishes_updated_at BEFORE UPDATE ON wishes
FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();

DROP TRIGGER IF EXISTS trg_assets_updated_at ON assets;
CREATE TRIGGER trg_assets_updated_at BEFORE UPDATE ON assets
FOR EACH ROW EXECUTE FUNCTION trg_set_updated_at();


-- ── Migration 004: recurring expenses ──
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'recurrence_type') THEN
    CREATE TYPE recurrence_type AS ENUM ('unica', 'mensal', 'anual');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'recurrence'
  ) THEN
    ALTER TABLE expenses
      ADD COLUMN recurrence recurrence_type NOT NULL DEFAULT 'unica',
      ADD COLUMN recurrence_parent_id uuid REFERENCES expenses(id) ON DELETE SET NULL,
      ADD COLUMN installment_number int,
      ADD COLUMN total_installments int;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS expenses_recurrence_parent_idx
  ON expenses (recurrence_parent_id) WHERE recurrence_parent_id IS NOT NULL;


-- ── Migration 005: expense priority ──
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'priority'
  ) THEN
    ALTER TABLE expenses
      ADD COLUMN priority int NOT NULL DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
      ADD COLUMN interest_rate numeric(5, 2) DEFAULT 0,
      ADD COLUMN penalty_amount numeric(12, 2) DEFAULT 0;
  END IF;
END $$;

COMMENT ON COLUMN expenses.priority IS '1=maxima, 5=minima. Definida pelo usuario.';
COMMENT ON COLUMN expenses.interest_rate IS 'Taxa de juros mensal (%) informada pelo usuario.';
COMMENT ON COLUMN expenses.penalty_amount IS 'Valor de multa por atraso informado pelo usuario.';


-- ── Migration 006: expense type + updated RPC ──
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'expense_kind') THEN
    CREATE TYPE expense_kind AS ENUM ('fixa', 'variavel');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'expenses' AND column_name = 'expense_type'
  ) THEN
    ALTER TABLE expenses
      ADD COLUMN expense_type expense_kind NOT NULL DEFAULT 'variavel';
  END IF;
END $$;

-- Updated RPC with expense_type support
CREATE OR REPLACE FUNCTION public.create_expense_with_shares(
  p_family_id uuid,
  p_amount numeric,
  p_category_id text,
  p_description text,
  p_due_date date,
  p_status expense_status,
  p_split_mode split_mode,
  p_responsible_member_ids uuid[],
  p_shares jsonb,
  p_expense_type expense_kind DEFAULT 'variavel'
)
RETURNS TABLE (
  id uuid,
  family_id uuid,
  amount numeric,
  category_id text,
  description text,
  due_date date,
  status expense_status,
  split_mode split_mode,
  expense_type expense_kind,
  shares jsonb
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_expense_id uuid;
  v_share_count int;
  v_total_percentage numeric;
  v_total_fixed numeric;
BEGIN
  IF p_amount <= 0 THEN
    RAISE EXCEPTION 'amount must be greater than zero';
  END IF;

  IF array_length(p_responsible_member_ids, 1) IS NULL THEN
    RAISE EXCEPTION 'at least one responsible member is required';
  END IF;

  INSERT INTO public.expenses (family_id, amount, category_id, description, due_date, status, split_mode, expense_type)
  VALUES (p_family_id, p_amount, p_category_id, p_description, p_due_date, p_status, p_split_mode, p_expense_type)
  RETURNING expenses.id INTO v_expense_id;

  INSERT INTO public.expense_shares (expense_id, member_id, percentage, fixed_amount)
  SELECT
    v_expense_id,
    (entry->>'memberId')::uuid,
    nullif(entry->>'percentage', '')::numeric,
    nullif(entry->>'fixedAmount', '')::numeric
  FROM jsonb_array_elements(p_shares) AS entry;

  SELECT count(*) INTO v_share_count
  FROM public.expense_shares
  WHERE expense_id = v_expense_id;

  IF v_share_count <> array_length(p_responsible_member_ids, 1) THEN
    RAISE EXCEPTION 'shares count must match responsible members count';
  END IF;

  IF p_split_mode = 'percentual' THEN
    SELECT coalesce(sum(percentage), 0) INTO v_total_percentage
    FROM public.expense_shares
    WHERE expense_id = v_expense_id;

    IF abs(v_total_percentage - 100) > 0.01 THEN
      RAISE EXCEPTION 'percentual shares must sum to 100';
    END IF;
  END IF;

  IF p_split_mode = 'valorFixo' THEN
    SELECT coalesce(sum(fixed_amount), 0) INTO v_total_fixed
    FROM public.expense_shares
    WHERE expense_id = v_expense_id;

    IF abs(v_total_fixed - p_amount) > 0.01 THEN
      RAISE EXCEPTION 'fixed shares must sum to amount';
    END IF;
  END IF;

  RETURN QUERY
  SELECT
    e.id,
    e.family_id,
    e.amount,
    e.category_id,
    e.description,
    e.due_date,
    e.status,
    e.split_mode,
    e.expense_type,
    (
      SELECT jsonb_agg(
        jsonb_build_object(
          'memberId', s.member_id,
          'percentage', s.percentage,
          'fixedAmount', s.fixed_amount
        )
      )
      FROM public.expense_shares s
      WHERE s.expense_id = e.id
    ) AS shares
  FROM public.expenses e
  WHERE e.id = v_expense_id;
END;
$$;
