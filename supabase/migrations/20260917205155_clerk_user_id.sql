-- Clerk emite IDs em formato texto (user_2abc...), nao UUID.
-- A FK para auth.users deixa de fazer sentido: o usuario passa a viver no Clerk.

ALTER TABLE family_members
  DROP CONSTRAINT IF EXISTS family_members_user_id_fkey;

ALTER TABLE family_members
  ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- A funcao de RLS passa a ler o 'sub' do token do Clerk em vez de auth.uid().
CREATE OR REPLACE FUNCTION public.user_family_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT family_id
  FROM family_members
  WHERE user_id = auth.jwt() ->> 'sub'
    AND active = true
  LIMIT 1;
$$;
