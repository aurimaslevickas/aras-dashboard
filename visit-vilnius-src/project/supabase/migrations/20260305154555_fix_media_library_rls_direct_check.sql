/*
  # Fix media_library RLS - replace is_admin() with direct check

  Now that recursive policies on public.users are removed, is_admin()
  should work. But replacing with direct inline checks for extra safety.
*/

DROP POLICY IF EXISTS "Admin can insert media" ON media_library;
DROP POLICY IF EXISTS "Admin can update media" ON media_library;
DROP POLICY IF EXISTS "Admin can delete media" ON media_library;

CREATE POLICY "Admin can insert media"
  ON media_library FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

CREATE POLICY "Admin can update media"
  ON media_library FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

CREATE POLICY "Admin can delete media"
  ON media_library FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );
