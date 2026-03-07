/*
  # Fix is_admin() to bypass RLS on public.users

  SECURITY DEFINER alone does not bypass RLS unless the function owner
  has the BYPASSRLS privilege. Adding SET row_security = off ensures
  the function can always read public.users to check the admin role,
  regardless of any RLS policies on that table.
*/

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
SET row_security = off
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'::user_role
  );
END;
$$;
