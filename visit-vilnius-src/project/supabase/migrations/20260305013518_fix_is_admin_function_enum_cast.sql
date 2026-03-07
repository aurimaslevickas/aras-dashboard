/*
  # Fix is_admin() function enum cast

  The function was comparing role = 'admin' (text) but role is user_role enum.
  This caused the function to always return false, blocking all analytics SELECT queries.
*/

CREATE OR REPLACE FUNCTION is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'::user_role
  );
$$;
