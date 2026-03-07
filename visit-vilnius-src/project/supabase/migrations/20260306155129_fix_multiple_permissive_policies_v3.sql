/*
  # Fix multiple permissive policies (v3)

  Consolidates overlapping permissive policies into single policies per role/action.
  Uses is_admin() with no arguments (correct signature).
*/

-- =====================
-- articles: SELECT
-- =====================
DROP POLICY IF EXISTS "Admins and authors can view all articles" ON public.articles;
DROP POLICY IF EXISTS "Anyone can view published articles" ON public.articles;
DROP POLICY IF EXISTS "Select articles" ON public.articles;
DROP POLICY IF EXISTS "Select articles anon" ON public.articles;

CREATE POLICY "Select articles"
  ON public.articles FOR SELECT
  TO authenticated
  USING (
    published = true
    OR auth.uid() = author_id
    OR (SELECT is_admin())
  );

CREATE POLICY "Select articles anon"
  ON public.articles FOR SELECT
  TO anon
  USING (published = true);

-- =====================
-- businesses: SELECT + UPDATE
-- =====================
DROP POLICY IF EXISTS "Admins and owners can view own business" ON public.businesses;
DROP POLICY IF EXISTS "Admins can manage businesses" ON public.businesses;
DROP POLICY IF EXISTS "Anyone can view active businesses" ON public.businesses;
DROP POLICY IF EXISTS "Owners can update own business" ON public.businesses;
DROP POLICY IF EXISTS "Select businesses" ON public.businesses;
DROP POLICY IF EXISTS "Select businesses anon" ON public.businesses;
DROP POLICY IF EXISTS "Update businesses" ON public.businesses;
DROP POLICY IF EXISTS "Admins insert businesses" ON public.businesses;
DROP POLICY IF EXISTS "Admins delete businesses" ON public.businesses;

CREATE POLICY "Select businesses"
  ON public.businesses FOR SELECT
  TO authenticated
  USING (
    active = true
    OR owner_id = auth.uid()
    OR (SELECT is_admin())
  );

CREATE POLICY "Select businesses anon"
  ON public.businesses FOR SELECT
  TO anon
  USING (active = true);

CREATE POLICY "Update businesses"
  ON public.businesses FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid() OR (SELECT is_admin()))
  WITH CHECK (owner_id = auth.uid() OR (SELECT is_admin()));

CREATE POLICY "Admins insert businesses"
  ON public.businesses FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT is_admin()));

CREATE POLICY "Admins delete businesses"
  ON public.businesses FOR DELETE
  TO authenticated
  USING ((SELECT is_admin()));

-- =====================
-- hero_images: SELECT
-- =====================
DROP POLICY IF EXISTS "Admins can manage hero images" ON public.hero_images;
DROP POLICY IF EXISTS "Anyone can view active hero images" ON public.hero_images;
DROP POLICY IF EXISTS "Select hero images" ON public.hero_images;
DROP POLICY IF EXISTS "Select hero images anon" ON public.hero_images;
DROP POLICY IF EXISTS "Admins insert hero images" ON public.hero_images;
DROP POLICY IF EXISTS "Admins update hero images" ON public.hero_images;
DROP POLICY IF EXISTS "Admins delete hero images" ON public.hero_images;

CREATE POLICY "Select hero images"
  ON public.hero_images FOR SELECT
  TO authenticated
  USING (active = true OR (SELECT is_admin()));

CREATE POLICY "Select hero images anon"
  ON public.hero_images FOR SELECT
  TO anon
  USING (active = true);

CREATE POLICY "Admins insert hero images"
  ON public.hero_images FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT is_admin()));

CREATE POLICY "Admins update hero images"
  ON public.hero_images FOR UPDATE
  TO authenticated
  USING ((SELECT is_admin()))
  WITH CHECK ((SELECT is_admin()));

CREATE POLICY "Admins delete hero images"
  ON public.hero_images FOR DELETE
  TO authenticated
  USING ((SELECT is_admin()));

-- =====================
-- listing_images: SELECT
-- =====================
DROP POLICY IF EXISTS "Admins and partners can manage listing images" ON public.listing_images;
DROP POLICY IF EXISTS "Public can view images of active listings" ON public.listing_images;
DROP POLICY IF EXISTS "Select listing images" ON public.listing_images;
DROP POLICY IF EXISTS "Select listing images anon" ON public.listing_images;
DROP POLICY IF EXISTS "Admins and partners insert listing images" ON public.listing_images;
DROP POLICY IF EXISTS "Admins and partners delete listing images" ON public.listing_images;

CREATE POLICY "Select listing images"
  ON public.listing_images FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id
        AND (l.status = 'active' OR l.owner_id = auth.uid() OR (SELECT is_admin()))
    )
  );

CREATE POLICY "Select listing images anon"
  ON public.listing_images FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id AND l.status = 'active'
    )
  );

CREATE POLICY "Admins and partners insert listing images"
  ON public.listing_images FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT is_admin())
    OR EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id AND l.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins and partners delete listing images"
  ON public.listing_images FOR DELETE
  TO authenticated
  USING (
    (SELECT is_admin())
    OR EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id AND l.owner_id = auth.uid()
    )
  );

-- =====================
-- listing_translations: SELECT
-- =====================
DROP POLICY IF EXISTS "Admins and partners can manage listing translations" ON public.listing_translations;
DROP POLICY IF EXISTS "Public can view translations of active listings" ON public.listing_translations;
DROP POLICY IF EXISTS "Select listing translations" ON public.listing_translations;
DROP POLICY IF EXISTS "Select listing translations anon" ON public.listing_translations;
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
        AND (l.status = 'active' OR l.owner_id = auth.uid() OR (SELECT is_admin()))
    )
  );

CREATE POLICY "Select listing translations anon"
  ON public.listing_translations FOR SELECT
  TO anon
  USING (
    EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id AND l.status = 'active'
    )
  );

CREATE POLICY "Admins and partners insert listing translations"
  ON public.listing_translations FOR INSERT
  TO authenticated
  WITH CHECK (
    (SELECT is_admin())
    OR EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id AND l.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins and partners update listing translations"
  ON public.listing_translations FOR UPDATE
  TO authenticated
  USING (
    (SELECT is_admin())
    OR EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id AND l.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    (SELECT is_admin())
    OR EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id AND l.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins and partners delete listing translations"
  ON public.listing_translations FOR DELETE
  TO authenticated
  USING (
    (SELECT is_admin())
    OR EXISTS (
      SELECT 1 FROM public.listings l
      WHERE l.id = listing_id AND l.owner_id = auth.uid()
    )
  );

-- =====================
-- listings: SELECT
-- =====================
DROP POLICY IF EXISTS "Admins and owners can view own listings" ON public.listings;
DROP POLICY IF EXISTS "Public can view active listings" ON public.listings;
DROP POLICY IF EXISTS "Select listings" ON public.listings;
DROP POLICY IF EXISTS "Select listings anon" ON public.listings;

CREATE POLICY "Select listings"
  ON public.listings FOR SELECT
  TO authenticated
  USING (
    status = 'active'
    OR owner_id = auth.uid()
    OR (SELECT is_admin())
  );

CREATE POLICY "Select listings anon"
  ON public.listings FOR SELECT
  TO anon
  USING (status = 'active');

-- =====================
-- subscriptions: SELECT
-- =====================
DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Partners and admins can view subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Select subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins insert subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins update subscriptions" ON public.subscriptions;
DROP POLICY IF EXISTS "Admins delete subscriptions" ON public.subscriptions;

CREATE POLICY "Select subscriptions"
  ON public.subscriptions FOR SELECT
  TO authenticated
  USING (
    (SELECT is_admin())
    OR EXISTS (
      SELECT 1 FROM public.partners p
      WHERE p.id = partner_id AND p.user_id = auth.uid()
    )
  );

CREATE POLICY "Admins insert subscriptions"
  ON public.subscriptions FOR INSERT
  TO authenticated
  WITH CHECK ((SELECT is_admin()));

CREATE POLICY "Admins update subscriptions"
  ON public.subscriptions FOR UPDATE
  TO authenticated
  USING ((SELECT is_admin()))
  WITH CHECK ((SELECT is_admin()));

CREATE POLICY "Admins delete subscriptions"
  ON public.subscriptions FOR DELETE
  TO authenticated
  USING ((SELECT is_admin()));
