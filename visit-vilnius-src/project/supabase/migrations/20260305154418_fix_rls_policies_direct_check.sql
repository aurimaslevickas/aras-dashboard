/*
  # Fix RLS policies - replace is_admin() with direct inline check

  The is_admin() function may not correctly bypass RLS in all Supabase
  environments. Replacing all policies with direct inline subqueries
  that check public.users.role, bypassing the function call entirely.

  Also adds a direct EXISTS check on public.users without relying on
  SECURITY DEFINER function to avoid any privilege issues.
*/

-- Drop and recreate category_sections policies with direct check
DROP POLICY IF EXISTS "Admins can insert category sections" ON category_sections;
DROP POLICY IF EXISTS "Admins can update category sections" ON category_sections;
DROP POLICY IF EXISTS "Admins can delete category sections" ON category_sections;

CREATE POLICY "Admins can insert category sections"
  ON category_sections FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

CREATE POLICY "Admins can update category sections"
  ON category_sections FOR UPDATE
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

CREATE POLICY "Admins can delete category sections"
  ON category_sections FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

-- Drop and recreate hero_season_images policies with direct check
DROP POLICY IF EXISTS "Admins can insert hero season images" ON hero_season_images;
DROP POLICY IF EXISTS "Admins can delete hero season images" ON hero_season_images;
DROP POLICY IF EXISTS "Admins can update hero season images" ON hero_season_images;

CREATE POLICY "Admins can insert hero season images"
  ON hero_season_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );

CREATE POLICY "Admins can update hero season images"
  ON hero_season_images FOR UPDATE
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

CREATE POLICY "Admins can delete hero season images"
  ON hero_season_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'::user_role
    )
  );
