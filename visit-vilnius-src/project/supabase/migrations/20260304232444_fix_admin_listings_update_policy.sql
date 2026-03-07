/*
  # Fix admin RLS policies for listings table

  ## Problem
  The admin "ALL" policy wasn't reliably allowing UPDATE operations.
  Splitting into explicit per-operation policies ensures correct behavior.

  ## Changes
  - Drop the combined ALL policy for admins
  - Add explicit SELECT, INSERT, UPDATE, DELETE policies for admin users
*/

DROP POLICY IF EXISTS "Admin users have full access to listings" ON listings;

CREATE POLICY "Admins can select all listings"
  ON listings FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can insert listings"
  ON listings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update listings"
  ON listings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can delete listings"
  ON listings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );
