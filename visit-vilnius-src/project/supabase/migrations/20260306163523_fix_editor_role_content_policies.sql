/*
  # Fix content table policies to allow editor role

  1. Changes
    - articles: allow editor to insert, update, delete
    - hero_images: allow editor to insert, update, delete
    - hero_season_images: allow editor to insert, update, delete
    - category_sections: allow editor to insert, update, delete
    - media_library: allow editor to insert, update, delete
    - listing_images: allow editor
    - listing_translations: allow editor

  2. Notes
    - site_settings, analytics, audit_log, login_history remain admin-only
    - Uses is_editor_or_admin() helper created in previous migration
*/

-- articles
DROP POLICY IF EXISTS "Admin can delete articles" ON articles;
CREATE POLICY "Admins and editors can delete articles"
  ON articles FOR DELETE TO authenticated USING (is_editor_or_admin());

DROP POLICY IF EXISTS "Admin can insert articles" ON articles;
CREATE POLICY "Admins and editors can insert articles"
  ON articles FOR INSERT TO authenticated WITH CHECK (is_editor_or_admin());

DROP POLICY IF EXISTS "Admin can update articles" ON articles;
CREATE POLICY "Admins and editors can update articles"
  ON articles FOR UPDATE TO authenticated
  USING (is_editor_or_admin()) WITH CHECK (is_editor_or_admin());

-- hero_images
DROP POLICY IF EXISTS "Admins delete hero images" ON hero_images;
CREATE POLICY "Admins and editors delete hero images"
  ON hero_images FOR DELETE TO authenticated USING (is_editor_or_admin());

DROP POLICY IF EXISTS "Admins insert hero images" ON hero_images;
CREATE POLICY "Admins and editors insert hero images"
  ON hero_images FOR INSERT TO authenticated WITH CHECK (is_editor_or_admin());

DROP POLICY IF EXISTS "Admins update hero images" ON hero_images;
CREATE POLICY "Admins and editors update hero images"
  ON hero_images FOR UPDATE TO authenticated
  USING (is_editor_or_admin()) WITH CHECK (is_editor_or_admin());

-- hero_season_images
DROP POLICY IF EXISTS "Admins can delete hero season images" ON hero_season_images;
CREATE POLICY "Admins and editors can delete hero season images"
  ON hero_season_images FOR DELETE TO authenticated USING (is_editor_or_admin());

DROP POLICY IF EXISTS "Admins can insert hero season images" ON hero_season_images;
CREATE POLICY "Admins and editors can insert hero season images"
  ON hero_season_images FOR INSERT TO authenticated WITH CHECK (is_editor_or_admin());

DROP POLICY IF EXISTS "Admins can update hero season images" ON hero_season_images;
CREATE POLICY "Admins and editors can update hero season images"
  ON hero_season_images FOR UPDATE TO authenticated
  USING (is_editor_or_admin()) WITH CHECK (is_editor_or_admin());

-- category_sections
DROP POLICY IF EXISTS "Admins can delete category sections" ON category_sections;
CREATE POLICY "Admins and editors can delete category sections"
  ON category_sections FOR DELETE TO authenticated USING (is_editor_or_admin());

DROP POLICY IF EXISTS "Admins can insert category sections" ON category_sections;
CREATE POLICY "Admins and editors can insert category sections"
  ON category_sections FOR INSERT TO authenticated WITH CHECK (is_editor_or_admin());

DROP POLICY IF EXISTS "Admins can update category sections" ON category_sections;
CREATE POLICY "Admins and editors can update category sections"
  ON category_sections FOR UPDATE TO authenticated
  USING (is_editor_or_admin()) WITH CHECK (is_editor_or_admin());

-- media_library
DROP POLICY IF EXISTS "Authenticated admins can delete media" ON media_library;
CREATE POLICY "Admins and editors can delete media"
  ON media_library FOR DELETE TO authenticated USING (is_editor_or_admin());

DROP POLICY IF EXISTS "Authenticated admins can insert media" ON media_library;
CREATE POLICY "Admins and editors can insert media"
  ON media_library FOR INSERT TO authenticated WITH CHECK (is_editor_or_admin());

DROP POLICY IF EXISTS "Authenticated admins can update media" ON media_library;
CREATE POLICY "Admins and editors can update media"
  ON media_library FOR UPDATE TO authenticated
  USING (is_editor_or_admin()) WITH CHECK (is_editor_or_admin());

-- listing_images
DROP POLICY IF EXISTS "Admins and partners delete listing images" ON listing_images;
CREATE POLICY "Admins, editors and partners delete listing images"
  ON listing_images FOR DELETE TO authenticated
  USING (is_editor_or_admin());

DROP POLICY IF EXISTS "Admins and partners insert listing images" ON listing_images;
CREATE POLICY "Admins, editors and partners insert listing images"
  ON listing_images FOR INSERT TO authenticated
  WITH CHECK (is_editor_or_admin());

-- listing_translations
DROP POLICY IF EXISTS "Admins and partners delete listing translations" ON listing_translations;
CREATE POLICY "Admins and editors delete listing translations"
  ON listing_translations FOR DELETE TO authenticated USING (is_editor_or_admin());

DROP POLICY IF EXISTS "Admins and partners insert listing translations" ON listing_translations;
CREATE POLICY "Admins and editors insert listing translations"
  ON listing_translations FOR INSERT TO authenticated WITH CHECK (is_editor_or_admin());

DROP POLICY IF EXISTS "Admins and partners update listing translations" ON listing_translations;
CREATE POLICY "Admins and editors update listing translations"
  ON listing_translations FOR UPDATE TO authenticated
  USING (is_editor_or_admin()) WITH CHECK (is_editor_or_admin());
