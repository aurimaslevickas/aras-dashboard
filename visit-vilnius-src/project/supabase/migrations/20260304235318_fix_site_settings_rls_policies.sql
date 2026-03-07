/*
  # Fix site_settings RLS policies

  1. Changes
    - Drops the combined FOR ALL policy which had no explicit WITH CHECK clause
    - Replaces with separate, explicit SELECT, INSERT, UPDATE, DELETE policies
    - Each policy has proper USING and WITH CHECK clauses
    - Admin check uses EXISTS on users table

  2. Purpose
    - Resolves silent update failures where the FOR ALL policy didn't properly
      apply WITH CHECK for UPDATE operations
*/

DROP POLICY IF EXISTS "Admins can manage site settings" ON site_settings;

CREATE POLICY "Admins can select site settings"
  ON site_settings FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert site settings"
  ON site_settings FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update site settings"
  ON site_settings FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete site settings"
  ON site_settings FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
