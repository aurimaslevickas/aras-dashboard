/*
  # Upgrade Analytics Schema

  ## Summary
  Enhances existing analytics tables and adds proper tracking infrastructure.

  ## Changes

  ### analytics_views
  - Add `session_id` - groups pageviews per visit session
  - Add `device_type` - mobile / desktop / tablet
  - Add `country` - visitor country code
  - Add `page_type` - 'listing' | 'article' | 'home' | 'other'
  - Relaxes user_language constraint to allow more values

  ### analytics_clicks
  - Add `session_id`
  - Add `element_label` - what was clicked (e.g. "Rezervuoti", "Skambinti")
  - Expand click_type to include more types

  ### New: analytics_page_views
  - General page view tracker (not tied to listing/article)
  - Captures path, page_type, session_id, device_type, language, referrer

  ## Security
  - RLS enabled on all tables
  - Anonymous users can INSERT (tracking)
  - Only admins can SELECT
*/

-- Drop existing user_language constraint to allow all language codes
ALTER TABLE analytics_views DROP CONSTRAINT IF EXISTS analytics_views_user_language_check;

-- Add new columns to analytics_views
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_views' AND column_name = 'session_id') THEN
    ALTER TABLE analytics_views ADD COLUMN session_id text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_views' AND column_name = 'device_type') THEN
    ALTER TABLE analytics_views ADD COLUMN device_type text DEFAULT 'desktop';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_views' AND column_name = 'page_type') THEN
    ALTER TABLE analytics_views ADD COLUMN page_type text DEFAULT 'listing';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_views' AND column_name = 'country') THEN
    ALTER TABLE analytics_views ADD COLUMN country text;
  END IF;
END $$;

-- Drop existing click_type constraint to allow more types
ALTER TABLE analytics_clicks DROP CONSTRAINT IF EXISTS analytics_clicks_click_type_check;

-- Add new columns to analytics_clicks
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_clicks' AND column_name = 'session_id') THEN
    ALTER TABLE analytics_clicks ADD COLUMN session_id text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_clicks' AND column_name = 'element_label') THEN
    ALTER TABLE analytics_clicks ADD COLUMN element_label text;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_clicks' AND column_name = 'article_id') THEN
    ALTER TABLE analytics_clicks ADD COLUMN article_id uuid REFERENCES articles(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'analytics_clicks' AND column_name = 'page_url') THEN
    ALTER TABLE analytics_clicks ADD COLUMN page_url text;
  END IF;
END $$;

-- Create general page views table for home/other pages
CREATE TABLE IF NOT EXISTS analytics_page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text,
  page_path text NOT NULL,
  page_type text DEFAULT 'other',
  user_language text,
  device_type text DEFAULT 'desktop',
  referrer text,
  viewed_at timestamptz DEFAULT now()
);

ALTER TABLE analytics_page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert page views"
  ON analytics_page_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read page views"
  ON analytics_page_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Allow anon users to insert analytics_views
DROP POLICY IF EXISTS "Anyone can insert views" ON analytics_views;
CREATE POLICY "Anyone can insert views"
  ON analytics_views FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow admins to read analytics_views
DROP POLICY IF EXISTS "Admins can read views" ON analytics_views;
CREATE POLICY "Admins can read views"
  ON analytics_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Allow anon users to insert analytics_clicks
DROP POLICY IF EXISTS "Anyone can insert clicks" ON analytics_clicks;
CREATE POLICY "Anyone can insert clicks"
  ON analytics_clicks FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Allow admins to read analytics_clicks
DROP POLICY IF EXISTS "Admins can read clicks" ON analytics_clicks;
CREATE POLICY "Admins can read clicks"
  ON analytics_clicks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_analytics_views_viewed_at ON analytics_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_analytics_views_listing_id ON analytics_views(listing_id);
CREATE INDEX IF NOT EXISTS idx_analytics_views_article_id ON analytics_views(article_id);
CREATE INDEX IF NOT EXISTS idx_analytics_views_session_id ON analytics_views(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_clicks_clicked_at ON analytics_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_analytics_clicks_listing_id ON analytics_clicks(listing_id);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_viewed_at ON analytics_page_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_analytics_page_views_path ON analytics_page_views(page_path);
