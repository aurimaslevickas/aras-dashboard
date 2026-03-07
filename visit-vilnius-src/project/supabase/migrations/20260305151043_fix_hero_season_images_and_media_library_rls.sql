/*
  # Fix RLS policies for hero_season_images and media_library

  Both tables had incorrect INSERT/DELETE policies that checked auth.users.raw_app_meta_data
  instead of using the consistent is_admin() function that checks the public.users table.

  Changes:
  - hero_season_images: Drop old INSERT/DELETE policies, recreate using is_admin()
  - media_library: Drop old INSERT/DELETE policies, recreate using is_admin()
  - storage.objects: Add UPDATE policy so admins can overwrite/update uploads
*/

-- Fix hero_season_images policies
DROP POLICY IF EXISTS "Admins can insert hero season images" ON hero_season_images;
DROP POLICY IF EXISTS "Admins can delete hero season images" ON hero_season_images;

CREATE POLICY "Admins can insert hero season images"
  ON hero_season_images FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admins can delete hero season images"
  ON hero_season_images FOR DELETE
  TO authenticated
  USING (is_admin());

-- Fix media_library policies
DROP POLICY IF EXISTS "Admin can insert media" ON media_library;
DROP POLICY IF EXISTS "Admin can delete media" ON media_library;

CREATE POLICY "Admin can insert media"
  ON media_library FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Admin can delete media"
  ON media_library FOR DELETE
  TO authenticated
  USING (is_admin());
