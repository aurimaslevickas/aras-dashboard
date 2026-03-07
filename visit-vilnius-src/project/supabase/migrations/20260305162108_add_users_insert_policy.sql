/*
  # Add INSERT policy for users table

  Missing INSERT policy means signUp cannot create user profile row.
  Without user row, admin-write function sees no role and returns 403.
*/

CREATE POLICY "Users can insert own profile on signup"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);
