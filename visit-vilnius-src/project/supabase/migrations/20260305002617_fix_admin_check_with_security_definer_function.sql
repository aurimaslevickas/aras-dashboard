/*
  # Fix admin check using SECURITY DEFINER function

  The user_roles view doesn't bypass RLS on public.users when called
  from within another table's RLS policy. The fix is to use a proper
  SECURITY DEFINER function which runs as the function owner (postgres)
  and bypasses RLS entirely.

  Changes:
  - Recreate is_admin() as SECURITY DEFINER with proper search_path
  - Update site_settings policies to use is_admin() directly
*/

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

DROP POLICY IF EXISTS "Admins can insert site settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can update site settings" ON site_settings;
DROP POLICY IF EXISTS "Admins can delete site settings" ON site_settings;

CREATE POLICY "Admins can insert site settings"
  ON site_settings
  FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update site settings"
  ON site_settings
  FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete site settings"
  ON site_settings
  FOR DELETE
  TO authenticated
  USING (is_admin());
