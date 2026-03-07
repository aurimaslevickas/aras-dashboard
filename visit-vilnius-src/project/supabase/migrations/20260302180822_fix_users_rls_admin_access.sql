/*
  # Fix Users RLS for Admin Access

  1. Changes
    - Drop circular dependency policy "Admins can view all users"
    - Add simple policy that allows authenticated users to read their own profile
    - Add policy that allows admins to read all user profiles after they can read their own

  2. Security
    - Users can only read their own profile initially
    - Once admin role is confirmed, they can read all profiles
*/

-- Drop the circular dependency policy
DROP POLICY IF EXISTS "Admins can view all users" ON users;

-- Ensure the basic "Users can view own profile" policy exists
DROP POLICY IF EXISTS "Users can view own profile" ON users;
CREATE POLICY "Users can view own profile"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Add a new policy for admins to view all users (non-circular)
CREATE POLICY "Admins can view all users after auth"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    -- First allow user to see their own record to check role
    (auth.uid() = id) 
    OR
    -- Then if they are admin (checked from their own record), allow all
    (
      EXISTS (
        SELECT 1 FROM users u
        WHERE u.id = auth.uid() 
        AND u.role = 'admin'
      )
    )
  );
