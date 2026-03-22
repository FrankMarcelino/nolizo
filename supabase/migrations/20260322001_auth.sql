-- ============================================================
-- Auth migration: link Supabase auth users to family_members
-- and enable Row Level Security on all tables.
-- ============================================================

-- 1. Add user_id to family_members
ALTER TABLE family_members
  ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS family_members_user_id_idx ON family_members(user_id);

-- 2. Enable RLS on all tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE expense_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE inflows ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE wishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;

-- 3. Helper function: returns the authenticated user's family_id
-- Must be in public schema (auth schema requires superuser on Supabase)
CREATE OR REPLACE FUNCTION public.user_family_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT family_id
  FROM family_members
  WHERE user_id = auth.uid()
    AND active = true
  LIMIT 1;
$$;

-- 4. RLS Policies
-- NOTE: All API routes use the service role key (bypasses RLS).
-- These policies protect direct database access (e.g., Supabase Studio,
-- client-side queries). The service role key is never exposed to the browser.

-- families
CREATE POLICY "families_own" ON families
  FOR ALL USING (id = public.user_family_id());

-- family_members
CREATE POLICY "family_members_own" ON family_members
  FOR ALL USING (family_id = public.user_family_id());

-- expenses
CREATE POLICY "expenses_own" ON expenses
  FOR ALL USING (family_id = public.user_family_id());

-- expense_shares
CREATE POLICY "expense_shares_own" ON expense_shares
  FOR ALL USING (
    expense_id IN (
      SELECT id FROM expenses WHERE family_id = public.user_family_id()
    )
  );

-- inflows
CREATE POLICY "inflows_own" ON inflows
  FOR ALL USING (family_id = public.user_family_id());

-- categories: global (family_id IS NULL) or user's family
CREATE POLICY "categories_own" ON categories
  FOR ALL USING (family_id IS NULL OR family_id = public.user_family_id());

-- wishes
CREATE POLICY "wishes_own" ON wishes
  FOR ALL USING (family_id = public.user_family_id());

-- assets
CREATE POLICY "assets_own" ON assets
  FOR ALL USING (family_id = public.user_family_id());
