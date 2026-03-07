/*
  # Fix recursive RLS on public.users

  The "Admins can view all users after auth" policy contained a recursive
  EXISTS subquery on the users table itself, causing infinite recursion
  whenever is_admin() or any policy tried to read public.users.

  Solution: remove all recursive policies and keep only simple, non-recursive ones.
  Admins can see all users via a direct auth.uid() = id check or the catch-all
  "Anyone can view" policy which uses USING (true).
*/

-- Drop the problematic recursive policy
DROP POLICY IF EXISTS "Admins can view all users after auth" ON public.users;

-- Drop the redundant ALL policy that could also cause issues
DROP POLICY IF EXISTS "Admins have full access to users" ON public.users;

-- The remaining policies are safe:
-- "Anyone can view active users" USING (true) - allows all reads, no recursion
-- "Users can view own profile" USING (auth.uid() = id) - simple check
-- "Users can update own profile" USING (auth.uid() = id) - simple check

-- Add a clean admin update policy without recursion
CREATE POLICY "Admins can update any user"
  ON public.users FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = id
    OR
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'::user_role
  )
  WITH CHECK (
    auth.uid() = id
    OR
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'admin'::user_role
  );
