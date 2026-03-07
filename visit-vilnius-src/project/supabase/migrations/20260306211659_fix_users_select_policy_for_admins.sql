/*
  # Fix users SELECT policy so admins can see all users

  Previously only "Users can view own profile" existed which limited SELECT to auth.uid() = id.
  This meant admins couldn't list all users. We add an admin policy.
*/

DROP POLICY IF EXISTS "Users can view own profile" ON users;

CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (( SELECT auth.uid()) = id);

CREATE POLICY "Admins can view all users"
  ON users FOR SELECT
  TO authenticated
  USING (is_admin());
