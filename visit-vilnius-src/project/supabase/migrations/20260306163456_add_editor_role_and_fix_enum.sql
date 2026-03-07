/*
  # Add editor to user_role enum and fix deletion RLS

  1. Changes
    - Add 'editor' value to user_role enum
    - Migrate any existing 'content_provider' text values to 'editor'
    - Update is_admin() function to also allow 'editor' for content operations
    - Add a new is_editor_or_admin() helper function
    - Fix listings DELETE policy to allow both admin and editor roles
    - Fix listings INSERT/UPDATE policies similarly

  2. Notes
    - 'editor' replaces 'content_provider' as the content management role
    - 'admin' retains full control including user management
    - Existing admin users are unaffected
*/

-- Add 'editor' to the user_role enum
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'editor';

-- Create a helper function that returns true for admin OR editor
CREATE OR REPLACE FUNCTION is_editor_or_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid()
    AND role IN ('admin'::user_role, 'editor'::user_role)
  );
END;
$$;

-- Fix listings DELETE policy to allow admin and editor
DROP POLICY IF EXISTS "Admins can delete listings" ON listings;
CREATE POLICY "Admins and editors can delete listings"
  ON listings FOR DELETE
  TO authenticated
  USING (is_editor_or_admin());

-- Fix listings INSERT policy
DROP POLICY IF EXISTS "Admins and partners can insert listings" ON listings;
CREATE POLICY "Admins and editors can insert listings"
  ON listings FOR INSERT
  TO authenticated
  WITH CHECK (is_editor_or_admin() OR ((SELECT auth.uid()) = partner_id));

-- Fix listings UPDATE policy
DROP POLICY IF EXISTS "Admins and owners can update listings" ON listings;
CREATE POLICY "Admins and editors can update listings"
  ON listings FOR UPDATE
  TO authenticated
  USING (is_editor_or_admin() OR owner_id = (SELECT auth.uid()) OR partner_id = (SELECT auth.uid()))
  WITH CHECK (is_editor_or_admin() OR owner_id = (SELECT auth.uid()) OR partner_id = (SELECT auth.uid()));
