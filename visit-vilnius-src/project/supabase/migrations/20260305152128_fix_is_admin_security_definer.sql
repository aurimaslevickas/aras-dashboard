/*
  # Fix is_admin() function to use SECURITY DEFINER

  The is_admin() function queries public.users but runs under the caller's
  RLS context. The users table has a self-referencing SELECT policy that
  causes infinite recursion or silently returns no rows, making is_admin()
  always return false — even for real admins.

  Making is_admin() SECURITY DEFINER lets it bypass RLS and directly read
  the users table as the function owner (postgres), resolving the issue.
*/

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'::user_role
  );
$$;
