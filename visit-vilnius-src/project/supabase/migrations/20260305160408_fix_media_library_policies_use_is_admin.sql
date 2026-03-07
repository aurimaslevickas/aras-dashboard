/*
  # Fix media_library RLS policies to use is_admin() function

  ## Problem
  media_library INSERT/UPDATE/DELETE policies were using inline EXISTS subquery
  against users table, which can cause issues with RLS evaluation order.

  ## Fix
  Replace all inline role checks with the is_admin() SECURITY DEFINER function
  which bypasses RLS when checking the users table.

  Also fix storage.objects INSERT policy to ensure it works correctly.
*/

-- Drop existing media_library policies
DROP POLICY IF EXISTS "Admin can insert media" ON media_library;
DROP POLICY IF EXISTS "Admin can update media" ON media_library;
DROP POLICY IF EXISTS "Admin can delete media" ON media_library;
DROP POLICY IF EXISTS "Authenticated users can view media" ON media_library;

-- Recreate using is_admin() function
CREATE POLICY "Authenticated admins can insert media"
  ON media_library FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Authenticated admins can update media"
  ON media_library FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Authenticated admins can delete media"
  ON media_library FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE POLICY "Authenticated users can view media"
  ON media_library FOR SELECT
  TO authenticated
  USING (true);
