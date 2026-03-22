  -- Add contract fields to expenses table
  DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_name = 'expenses' AND column_name = 'has_contract'
    ) THEN
      ALTER TABLE expenses
        ADD COLUMN has_contract boolean NOT NULL DEFAULT false,
        ADD COLUMN contract_start_date date,
        ADD COLUMN contract_end_date date;
    END IF;
  END $$;

  -- Ensure end >= start when both are set
  DO $$ BEGIN
    IF NOT EXISTS (
      SELECT 1 FROM pg_constraint WHERE conname = 'chk_contract_dates'
    ) THEN
      ALTER TABLE expenses
        ADD CONSTRAINT chk_contract_dates
        CHECK (
          NOT has_contract
          OR (contract_start_date IS NOT NULL AND contract_end_date IS NOT NULL AND contract_end_date >= contract_start_date)
        );
    END IF;
  END $$;
