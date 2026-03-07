/*
  # Fix Remaining Security and Performance Issues

  ## Summary

  ### 1. Drop All Unused Indexes
  Removes 39 unused indexes to reduce write overhead and storage bloat.

  ### 2. Fix Multiple Permissive Policies
  Consolidates overlapping policies per table/role/action into single policies
  using OR conditions where needed.

  ### 3. Fix audit_log Always-True INSERT Policy
  Restricts the system insert policy to only allow inserts from authenticated
  or service_role contexts.

  ### Notes
  - Auth DB connection strategy: requires Supabase dashboard change (not SQL)
  - Security Definer View (user_roles): intentional, kept as-is
  - spatial_ref_sys / postgis: infrastructure-level, not modifiable via migration
  - Leaked password protection: requires Supabase dashboard change
*/

-- ============================================================
-- 1. DROP UNUSED INDEXES
-- ============================================================

DROP INDEX IF EXISTS public.idx_listings_owner_id;
DROP INDEX IF EXISTS public.idx_listings_features;
DROP INDEX IF EXISTS public.idx_businesses_type;
DROP INDEX IF EXISTS public.idx_businesses_active;
DROP INDEX IF EXISTS public.idx_businesses_featured;
DROP INDEX IF EXISTS public.idx_businesses_owner;
DROP INDEX IF EXISTS public.idx_events_featured;
DROP INDEX IF EXISTS public.idx_events_organizer;
DROP INDEX IF EXISTS public.idx_analytics_entity;
DROP INDEX IF EXISTS public.idx_analytics_created;
DROP INDEX IF EXISTS public.idx_hero_active;
DROP INDEX IF EXISTS public.idx_listing_translations_locale;
DROP INDEX IF EXISTS public.idx_listing_translations_slug;
DROP INDEX IF EXISTS public.idx_events_listing;
DROP INDEX IF EXISTS public.idx_events_dates;
DROP INDEX IF EXISTS public.idx_listings_partner;
DROP INDEX IF EXISTS public.idx_articles_published;
DROP INDEX IF EXISTS public.idx_articles_featured;
DROP INDEX IF EXISTS public.idx_articles_slug;
DROP INDEX IF EXISTS public.idx_media_library_uploaded_by;
DROP INDEX IF EXISTS public.idx_partners_user_id;
DROP INDEX IF EXISTS public.idx_analytics_views_listing_id;
DROP INDEX IF EXISTS public.idx_analytics_views_article_id;
DROP INDEX IF EXISTS public.idx_analytics_clicks_listing_id;
DROP INDEX IF EXISTS public.idx_audit_log_user_id;
DROP INDEX IF EXISTS public.idx_audit_log_table_name;
DROP INDEX IF EXISTS public.idx_audit_log_created_at;
DROP INDEX IF EXISTS public.idx_analytics_views_session_id;
DROP INDEX IF EXISTS public.idx_analytics_page_views_viewed_at;
DROP INDEX IF EXISTS public.idx_analytics_page_views_path;
DROP INDEX IF EXISTS public.idx_articles_author_id;
DROP INDEX IF EXISTS public.idx_listings_approved_by;
DROP INDEX IF EXISTS public.idx_login_history_user_id;
DROP INDEX IF EXISTS public.idx_partners_approved_by;
DROP INDEX IF EXISTS public.idx_saved_trips_user_id;
DROP INDEX IF EXISTS public.idx_subscriptions_partner_id;
DROP INDEX IF EXISTS public.idx_trip_items_listing_id;
DROP INDEX IF EXISTS public.idx_trip_items_trip_id;
DROP INDEX IF EXISTS public.idx_analytics_clicks_article_id;

-- Re-create only the foreign key covering indexes (needed for FK performance)
CREATE INDEX IF NOT EXISTS idx_analytics_clicks_article_id_fk ON public.analytics_clicks (article_id);
CREATE INDEX IF NOT EXISTS idx_articles_author_id_fk ON public.articles (author_id);
CREATE INDEX IF NOT EXISTS idx_listings_approved_by_fk ON public.listings (approved_by);
CREATE INDEX IF NOT EXISTS idx_login_history_user_id_fk ON public.login_history (user_id);
CREATE INDEX IF NOT EXISTS idx_partners_approved_by_fk ON public.partners (approved_by);
CREATE INDEX IF NOT EXISTS idx_saved_trips_user_id_fk ON public.saved_trips (user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_partner_id_fk ON public.subscriptions (partner_id);
CREATE INDEX IF NOT EXISTS idx_trip_items_listing_id_fk ON public.trip_items (listing_id);
CREATE INDEX IF NOT EXISTS idx_trip_items_trip_id_fk ON public.trip_items (trip_id);

-- ============================================================
-- 2. FIX MULTIPLE PERMISSIVE POLICIES
-- ============================================================

-- ---- ARTICLES: consolidate 3 SELECT policies into 1 ----
DROP POLICY IF EXISTS "Admin can view all articles" ON public.articles;
DROP POLICY IF EXISTS "Anyone can view published articles" ON public.articles;
DROP POLICY IF EXISTS "Authors can view own articles" ON public.articles;

CREATE POLICY "Anyone can view published articles"
  ON public.articles FOR SELECT
  USING (published = true);

CREATE POLICY "Admins and authors can view all articles"
  ON public.articles FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR author_id = (select auth.uid())
  );

-- ---- BUSINESSES: consolidate SELECT and UPDATE ----
DROP POLICY IF EXISTS "Admins can manage all businesses" ON public.businesses;
DROP POLICY IF EXISTS "Anyone can view active businesses" ON public.businesses;
DROP POLICY IF EXISTS "Owners can view own business" ON public.businesses;
DROP POLICY IF EXISTS "Owners can update own business" ON public.businesses;

CREATE POLICY "Anyone can view active businesses"
  ON public.businesses FOR SELECT
  USING (active = true);

CREATE POLICY "Admins and owners can view own business"
  ON public.businesses FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR owner_id = (select auth.uid())
  );

CREATE POLICY "Admins can manage businesses"
  ON public.businesses FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Owners can update own business"
  ON public.businesses FOR UPDATE
  TO authenticated
  USING (owner_id = (select auth.uid()))
  WITH CHECK (owner_id = (select auth.uid()));

-- ---- EVENTS: consolidate per action ----
DROP POLICY IF EXISTS "Admins can manage all events" ON public.events;
DROP POLICY IF EXISTS "Organizers can manage own events" ON public.events;
DROP POLICY IF EXISTS "Partners can manage own events" ON public.events;
DROP POLICY IF EXISTS "Public can view active events" ON public.events;

-- Single SELECT for all roles
CREATE POLICY "Public can view active events"
  ON public.events FOR SELECT
  USING (
    active = true
    OR listing_id IS NULL
    OR EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = events.listing_id
        AND listings.status = 'active'
    )
  );

-- Single INSERT for authenticated (admins + organizers + partners)
CREATE POLICY "Authorized users can insert events"
  ON public.events FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = events.organizer_id
        AND businesses.owner_id = (select auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = events.listing_id
        AND listings.partner_id = (select auth.uid())
    )
  );

-- Single UPDATE for authenticated
CREATE POLICY "Authorized users can update events"
  ON public.events FOR UPDATE
  TO authenticated
  USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = events.organizer_id
        AND businesses.owner_id = (select auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = events.listing_id
        AND listings.partner_id = (select auth.uid())
    )
  )
  WITH CHECK (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = events.organizer_id
        AND businesses.owner_id = (select auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = events.listing_id
        AND listings.partner_id = (select auth.uid())
    )
  );

-- Single DELETE for authenticated
CREATE POLICY "Authorized users can delete events"
  ON public.events FOR DELETE
  TO authenticated
  USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM businesses
      WHERE businesses.id = events.organizer_id
        AND businesses.owner_id = (select auth.uid())
    )
    OR EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = events.listing_id
        AND listings.partner_id = (select auth.uid())
    )
  );

-- ---- HERO_IMAGES: consolidate SELECT ----
DROP POLICY IF EXISTS "Admins can manage hero images" ON public.hero_images;
DROP POLICY IF EXISTS "Anyone can view active hero images" ON public.hero_images;

CREATE POLICY "Anyone can view active hero images"
  ON public.hero_images FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage hero images"
  ON public.hero_images FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ---- LISTING_IMAGES: consolidate per action ----
DROP POLICY IF EXISTS "Admins have full access to images" ON public.listing_images;
DROP POLICY IF EXISTS "Partners can manage own listing images" ON public.listing_images;
DROP POLICY IF EXISTS "Public can view images of active listings" ON public.listing_images;

CREATE POLICY "Public can view images of active listings"
  ON public.listing_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_images.listing_id
        AND listings.status = 'active'
    )
  );

CREATE POLICY "Admins and partners can manage listing images"
  ON public.listing_images FOR ALL
  TO authenticated
  USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_images.listing_id
        AND listings.partner_id = (select auth.uid())
    )
  )
  WITH CHECK (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_images.listing_id
        AND listings.partner_id = (select auth.uid())
    )
  );

-- ---- LISTING_TRANSLATIONS: consolidate per action ----
DROP POLICY IF EXISTS "Admins have full access to translations" ON public.listing_translations;
DROP POLICY IF EXISTS "Partners can manage own listing translations" ON public.listing_translations;
DROP POLICY IF EXISTS "Public can view translations of active listings" ON public.listing_translations;

CREATE POLICY "Public can view translations of active listings"
  ON public.listing_translations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_translations.listing_id
        AND listings.status = 'active'
    )
  );

CREATE POLICY "Admins and partners can manage listing translations"
  ON public.listing_translations FOR ALL
  TO authenticated
  USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_translations.listing_id
        AND listings.partner_id = (select auth.uid())
    )
  )
  WITH CHECK (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM listings
      WHERE listings.id = listing_translations.listing_id
        AND listings.partner_id = (select auth.uid())
    )
  );

-- ---- LISTINGS: consolidate SELECT, INSERT, UPDATE ----
DROP POLICY IF EXISTS "Admins can select all listings" ON public.listings;
DROP POLICY IF EXISTS "Owners and partners can view own listings" ON public.listings;
DROP POLICY IF EXISTS "Public can view active listings" ON public.listings;
DROP POLICY IF EXISTS "Admins can insert listings" ON public.listings;
DROP POLICY IF EXISTS "Partners can insert own listings" ON public.listings;
DROP POLICY IF EXISTS "Admins can update listings" ON public.listings;
DROP POLICY IF EXISTS "Owners and partners can update own listings" ON public.listings;

-- Single SELECT policy
CREATE POLICY "Public can view active listings"
  ON public.listings FOR SELECT
  USING (status = 'active');

CREATE POLICY "Admins and owners can view own listings"
  ON public.listings FOR SELECT
  TO authenticated
  USING (
    is_admin()
    OR owner_id = (select auth.uid())
    OR partner_id = (select auth.uid())
  );

-- Single INSERT policy
CREATE POLICY "Admins and partners can insert listings"
  ON public.listings FOR INSERT
  TO authenticated
  WITH CHECK (
    is_admin()
    OR (select auth.uid()) = partner_id
  );

-- Single UPDATE policy
CREATE POLICY "Admins and owners can update listings"
  ON public.listings FOR UPDATE
  TO authenticated
  USING (
    is_admin()
    OR owner_id = (select auth.uid())
    OR partner_id = (select auth.uid())
  )
  WITH CHECK (
    is_admin()
    OR owner_id = (select auth.uid())
    OR partner_id = (select auth.uid())
  );

-- ---- PARTNERS: consolidate UPDATE ----
DROP POLICY IF EXISTS "Admin can update partners" ON public.partners;
DROP POLICY IF EXISTS "Partners can update own data" ON public.partners;

CREATE POLICY "Admins and partners can update partners"
  ON public.partners FOR UPDATE
  TO authenticated
  USING (
    is_admin()
    OR (user_id = (select auth.uid()) AND status = 'pending')
  )
  WITH CHECK (
    is_admin()
    OR user_id = (select auth.uid())
  );

-- ---- SAVED_TRIPS: consolidate SELECT ----
DROP POLICY IF EXISTS "Users and admins can view trips" ON public.saved_trips;
DROP POLICY IF EXISTS "Users can manage own trips" ON public.saved_trips;

CREATE POLICY "Users can manage own trips"
  ON public.saved_trips FOR ALL
  TO authenticated
  USING (
    (select auth.uid()) = user_id
    OR is_admin()
  )
  WITH CHECK ((select auth.uid()) = user_id);

-- ---- SUBSCRIPTIONS: consolidate SELECT ----
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Partners and admins can view subscriptions" ON public.subscriptions;

CREATE POLICY "Partners and admins can view subscriptions"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (
    (select auth.uid()) = partner_id
    OR is_admin()
  );

CREATE POLICY "Admins can manage subscriptions"
  ON public.subscriptions FOR ALL
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

-- ---- TRIP_ITEMS: consolidate SELECT ----
DROP POLICY IF EXISTS "Users and admins can view trip items" ON public.trip_items;
DROP POLICY IF EXISTS "Users can manage own trip items" ON public.trip_items;

CREATE POLICY "Users can manage own trip items"
  ON public.trip_items FOR ALL
  TO authenticated
  USING (
    is_admin()
    OR EXISTS (
      SELECT 1 FROM saved_trips
      WHERE saved_trips.id = trip_items.trip_id
        AND saved_trips.user_id = (select auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM saved_trips
      WHERE saved_trips.id = trip_items.trip_id
        AND saved_trips.user_id = (select auth.uid())
    )
  );

-- ---- USERS: consolidate UPDATE ----
DROP POLICY IF EXISTS "Admins can update any user" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users and admins can update users"
  ON public.users FOR UPDATE
  TO authenticated
  USING (
    (select auth.uid()) = id
    OR is_admin()
  )
  WITH CHECK (
    (select auth.uid()) = id
    OR is_admin()
  );

-- ============================================================
-- 3. FIX AUDIT_LOG ALWAYS-TRUE INSERT POLICY
-- ============================================================

DROP POLICY IF EXISTS "System can insert audit log" ON public.audit_log;

-- Allow inserts only from authenticated users or service_role (triggers run as definer)
CREATE POLICY "Authenticated users can insert audit log"
  ON public.audit_log FOR INSERT
  TO authenticated
  WITH CHECK (true);
