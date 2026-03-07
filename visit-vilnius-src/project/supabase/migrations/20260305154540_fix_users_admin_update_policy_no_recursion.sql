/*
  # Fix admin update policy - remove recursion

  Replace the recursive admin update policy with a simple one
  that only allows users to update their own profile.
  Admin management of users is handled via service role in edge functions.
*/

DROP POLICY IF EXISTS "Admins can update any user" ON public.users;

CREATE POLICY "Admins can update any user"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);
