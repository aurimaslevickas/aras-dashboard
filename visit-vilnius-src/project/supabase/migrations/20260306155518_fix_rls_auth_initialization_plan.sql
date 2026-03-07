/*
  # Fix RLS Auth Initialization Plan warnings

  Replace bare auth.uid() calls with (select auth.uid()) in all affected
  policies so Postgres can initialize the value once per query instead of
  re-evaluating it for every row.

  Tables fixed:
  - articles
  - businesses
  - listing_images
  - listing_translations
  - listings
  - subscriptions
  - audit_log
*/

-- =====================
-- articles
-- =====================
DROP POLICY IF EXISTS "Select articles" ON public.articles;

CREATE POLICY "Select articles"
  ON public.articles FOR SELECT
  TO authenticated
  USING (
    published = true
    OR (select auth.uid()) = author_id
    OR (SELECT is_admin())
  );

-- =====================
-- businesses
-- =====================
DROP POLICY IF EXISTS "Select businesses" ON public.businesses;
DROP POLICY IF EXISTS "Update businesses" ON public.businesses;

CREATE POLICY "Select businesses"
  ON public.businesses FOR SELECT
  TO authenticated
  USING (
    active = true
    OR owner_id = (select auth.uid())
    OR (SELECT is_admin())
  );

CREATE POLICY "Update businesses"
  ON public.businesses FOR UPDATE
  TO authenticated
  USING (owner_id = (select auth.uid()) OR (SELECT is_admin()))
  WITH CHECK (owner_id = (select auth.uid()) OR (SELECT is_admin()));

-- =====================
-- listing_images
-- =====================
DROP POLICY IF EXISTS "Select listing images" ON public.listing_images;
DROP POLICY IF EXISTS "Admins and partners insert listing images" ON public.listing_images;
DROP POLICY IF EXISTS "Admins and partners delete listing images" ON public.listing_images;

CREATE POLICY "Select listing images"
  ON public.listing_images FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
        AND (
          l.status = 'active'
          OR l.owner_id = (select auth.uid())
          OR (SELECT is_admin())
        )
    )
  );

CREATE POLICY "Admins and partners insert listing images"
  ON public.listing_images FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT is_admin())
    OR EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id AND l.owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins and partners delete listing images"
  ON public.listing_images FOR DELETE
  TO authenticated
  USING (
    (SELECT is_admin())
    OR EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id AND l.owner_id = (select auth.uid())
    )
  );

-- =====================
-- listing_translations
-- =====================
DROP POLICY IF EXISTS "Select listing translations" ON public.listing_translations;
DROP POLICY IF EXISTS "Admins and partners insert listing translations" ON public.listing_translations;
DROP POLICY IF EXISTS "Admins and partners update listing translations" ON public.listing_translations;
DROP POLICY IF EXISTS "Admins and partners delete listing translations" ON public.listing_translations;

CREATE POLICY "Select listing translations"
  ON public.listing_translations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
        AND (
          l.status = 'active'
          OR l.owner_id = (select auth.uid())
          OR (SELECT is_admin())
        )
    )
  );

CREATE POLICY "Admins and partners insert listing translations"
  ON public.listing_translations FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT is_admin())
    OR EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id AND l.owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins and partners update listing translations"
  ON public.listing_translations FOR UPDATE
  TO authenticated
  USING (
    (SELECT is_admin())
    OR EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id AND l.owner_id = (select auth.uid())
    )
  )
  WITH CHECK (
    (SELECT is_admin())
    OR EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id AND l.owner_id = (select auth.uid())
    )
  );

CREATE POLICY "Admins and partners delete listing translations"
  ON public.listing_translations FOR DELETE
  TO authenticated
  USING (
    (SELECT is_admin())
    OR EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id AND l.owner_id = (select auth.uid())
    )
  );

-- =====================
-- listings
-- =====================
DROP POLICY IF EXISTS "Select listings" ON public.listings;

CREATE POLICY "Select listings"
  ON public.listings FOR SELECT
  TO authenticated
  USING (
    status = 'active'
    OR owner_id = (select auth.uid())
    OR (SELECT is_admin())
  );

-- =====================
-- subscriptions
-- =====================
DROP POLICY IF EXISTS "Select subscriptions" ON public.subscriptions;

CREATE POLICY "Select subscriptions"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (
    (SELECT is_admin())
    OR EXISTS (
      SELECT 1 FROM public.partners p
      WHERE p.id = partner_id AND p.user_id = (select auth.uid())
    )
  );

-- =====================
-- audit_log
-- =====================
DROP POLICY IF EXISTS "Authenticated users can insert audit log" ON public.audit_log;

CREATE POLICY "Authenticated users can insert audit log"
  ON public.audit_log FOR INSERT
  TO authenticated
  WITH CHECK (user_id = (select auth.uid()));
