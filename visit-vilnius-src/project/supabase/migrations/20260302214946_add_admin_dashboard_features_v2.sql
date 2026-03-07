/*
  # Add Admin Dashboard Features

  1. New Tables
    - `media_library`
      - `id` (uuid, primary key)
      - `filename` (text) - Original filename
      - `url` (text) - Storage URL
      - `type` (text) - image/video/document
      - `size` (bigint) - File size in bytes
      - `uploaded_by` (uuid) - References auth.users
      - `created_at` (timestamptz)
      
    - `partners`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - References auth.users
      - `business_name` (text) - Company name
      - `business_type` (text) - restaurant/hotel/attraction/shop/event_organizer
      - `contact_name` (text)
      - `contact_email` (text)
      - `contact_phone` (text)
      - `address` (text)
      - `description` (text)
      - `status` (text) - pending/approved/rejected
      - `approved_by` (uuid) - References auth.users
      - `approved_at` (timestamptz)
      - `rejection_reason` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
      
    - `analytics_views`
      - `id` (uuid, primary key)
      - `listing_id` (uuid) - References listings
      - `article_id` (uuid) - References articles
      - `page_url` (text)
      - `user_language` (text) - lt/en/pl/de/ru
      - `referrer` (text)
      - `viewed_at` (timestamptz)
      
    - `analytics_clicks`
      - `id` (uuid, primary key)
      - `listing_id` (uuid) - References listings
      - `click_type` (text) - website/phone/booking/directions
      - `clicked_at` (timestamptz)
      
    - `audit_log`
      - `id` (uuid, primary key)
      - `user_id` (uuid) - References auth.users
      - `action` (text) - create/update/delete/approve/reject
      - `table_name` (text)
      - `record_id` (uuid)
      - `old_data` (jsonb)
      - `new_data` (jsonb)
      - `created_at` (timestamptz)

  2. Changes to existing tables
    - `listings`
      - Add `approved_by` (uuid) - References auth.users
      - Add `approved_at` (timestamptz)
      - Add `views_count` (integer, default 0)
      - Add `clicks_count` (integer, default 0)
      
    - `articles`
      - Add `views_count` (integer, default 0)
      
    - `users`
      - Add `last_login_at` (timestamptz)
      - Add `login_count` (integer, default 0)

  3. Security
    - Enable RLS on all new tables
    - Add policies for admin access
    - Add policies for partner access to their own data

  4. Important Notes
    - Partners (providers) can only manage their own listings
    - Admins can see everything and approve partners
    - Analytics data is aggregated for privacy
*/

-- Create media_library table
CREATE TABLE IF NOT EXISTS media_library (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  filename text NOT NULL,
  url text NOT NULL,
  type text CHECK (type IN ('image', 'video', 'document')),
  size bigint DEFAULT 0,
  uploaded_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now()
);

-- Create partners table
CREATE TABLE IF NOT EXISTS partners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  business_name text NOT NULL,
  business_type text CHECK (business_type IN ('restaurant', 'hotel', 'attraction', 'shop', 'event_organizer', 'other')),
  contact_name text NOT NULL,
  contact_email text NOT NULL,
  contact_phone text,
  address text,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  approved_by uuid REFERENCES auth.users(id),
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create analytics_views table
CREATE TABLE IF NOT EXISTS analytics_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id),
  article_id uuid REFERENCES articles(id),
  page_url text,
  user_language text CHECK (user_language IN ('lt', 'en', 'pl', 'de', 'ru')),
  referrer text,
  viewed_at timestamptz DEFAULT now()
);

-- Create analytics_clicks table
CREATE TABLE IF NOT EXISTS analytics_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id),
  click_type text CHECK (click_type IN ('website', 'phone', 'booking', 'directions')),
  clicked_at timestamptz DEFAULT now()
);

-- Create audit_log table
CREATE TABLE IF NOT EXISTS audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  action text CHECK (action IN ('create', 'update', 'delete', 'approve', 'reject')),
  table_name text NOT NULL,
  record_id uuid,
  old_data jsonb,
  new_data jsonb,
  created_at timestamptz DEFAULT now()
);

-- Add new columns to listings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'approved_by'
  ) THEN
    ALTER TABLE listings ADD COLUMN approved_by uuid REFERENCES auth.users(id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'approved_at'
  ) THEN
    ALTER TABLE listings ADD COLUMN approved_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'views_count'
  ) THEN
    ALTER TABLE listings ADD COLUMN views_count integer DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'clicks_count'
  ) THEN
    ALTER TABLE listings ADD COLUMN clicks_count integer DEFAULT 0;
  END IF;
END $$;

-- Add new columns to articles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'views_count'
  ) THEN
    ALTER TABLE articles ADD COLUMN views_count integer DEFAULT 0;
  END IF;
END $$;

-- Add new columns to users
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'last_login_at'
  ) THEN
    ALTER TABLE users ADD COLUMN last_login_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'users' AND column_name = 'login_count'
  ) THEN
    ALTER TABLE users ADD COLUMN login_count integer DEFAULT 0;
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE media_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;

-- Media library policies
CREATE POLICY "Authenticated users can view media"
  ON media_library FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admin can insert media"
  ON media_library FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Admin can delete media"
  ON media_library FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Partners policies
CREATE POLICY "Partners can view own data"
  ON partners FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM users
    WHERE users.id = auth.uid()
    AND users.role = 'admin'
  ));

CREATE POLICY "Anyone authenticated can create partner request"
  ON partners FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Partners can update own data"
  ON partners FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid() AND status = 'pending')
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admin can update partners"
  ON partners FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Analytics policies (only admins can access)
CREATE POLICY "Admin can view analytics"
  ON analytics_views FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Anyone can insert analytics views"
  ON analytics_views FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admin can view clicks"
  ON analytics_clicks FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "Anyone can insert clicks"
  ON analytics_clicks FOR INSERT
  WITH CHECK (true);

-- Audit log policies (read-only for admins)
CREATE POLICY "Admin can view audit log"
  ON audit_log FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

CREATE POLICY "System can insert audit log"
  ON audit_log FOR INSERT
  WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_media_library_uploaded_by ON media_library(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_partners_user_id ON partners(user_id);
CREATE INDEX IF NOT EXISTS idx_partners_status ON partners(status);
CREATE INDEX IF NOT EXISTS idx_analytics_views_listing_id ON analytics_views(listing_id);
CREATE INDEX IF NOT EXISTS idx_analytics_views_article_id ON analytics_views(article_id);
CREATE INDEX IF NOT EXISTS idx_analytics_views_viewed_at ON analytics_views(viewed_at);
CREATE INDEX IF NOT EXISTS idx_analytics_clicks_listing_id ON analytics_clicks(listing_id);
CREATE INDEX IF NOT EXISTS idx_analytics_clicks_clicked_at ON analytics_clicks(clicked_at);
CREATE INDEX IF NOT EXISTS idx_audit_log_user_id ON audit_log(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_log_table_name ON audit_log(table_name);
CREATE INDEX IF NOT EXISTS idx_audit_log_created_at ON audit_log(created_at);
