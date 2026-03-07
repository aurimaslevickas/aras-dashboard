/*
  # Fix Analytics RLS Policies

  Uses the security-definer is_admin() function for all analytics SELECT policies
  instead of directly querying the users table, which avoids potential RLS recursion.
  Also drops duplicate/conflicting policies.
*/

-- Drop all existing SELECT policies on analytics tables
DROP POLICY IF EXISTS "Admin can view analytics" ON analytics_views;
DROP POLICY IF EXISTS "Admins can read views" ON analytics_views;
DROP POLICY IF EXISTS "Admin can view clicks" ON analytics_clicks;
DROP POLICY IF EXISTS "Admins can read clicks" ON analytics_clicks;
DROP POLICY IF EXISTS "Admins can read page views" ON analytics_page_views;

-- Recreate clean SELECT policies using is_admin()
CREATE POLICY "Admins can read analytics views"
  ON analytics_views FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can read analytics clicks"
  ON analytics_clicks FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Admins can read analytics page views"
  ON analytics_page_views FOR SELECT
  TO authenticated
  USING (is_admin());
