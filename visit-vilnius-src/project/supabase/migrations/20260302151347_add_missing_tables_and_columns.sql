/*
  # Add Missing Tables and Columns for VisitVilnius.lt

  1. New Tables
    - `listings` - Main content table
    - `listing_translations` - Multi-language support
    - `listing_images` - Image gallery
    - `subscriptions` - Partner subscriptions
    - `site_settings` - CMS configuration
    - `saved_trips` - User trip plans
    - `trip_items` - Items in trips

  2. Schema Updates
    - Add missing columns to existing tables
    - Create necessary ENUMs
    - Setup RLS policies

  3. Security
    - RLS enabled on all tables
    - Proper access control for each role
*/

-- Create ENUMs if they don't exist
DO $$ BEGIN
  CREATE TYPE listing_category AS ENUM ('sightseeing', 'restaurant', 'accommodation', 'event', 'shopping');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE listing_status AS ENUM ('draft', 'pending', 'active', 'rejected');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE app_locale AS ENUM ('lt', 'en', 'pl');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE user_status AS ENUM ('pending', 'active', 'blocked');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE sub_plan AS ENUM ('basic', 'standard', 'premium');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE sub_status AS ENUM ('active', 'past_due', 'canceled', 'incomplete');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE setting_type AS ENUM ('text', 'boolean', 'image', 'json');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Add missing columns to users table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'status') THEN
    ALTER TABLE users ADD COLUMN status user_status DEFAULT 'pending';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'company_name') THEN
    ALTER TABLE users ADD COLUMN company_name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'phone') THEN
    ALTER TABLE users ADD COLUMN phone TEXT;
  END IF;
END $$;

-- LISTINGS table
CREATE TABLE IF NOT EXISTS listings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  category listing_category NOT NULL,
  status listing_status DEFAULT 'draft',
  is_featured BOOLEAN DEFAULT FALSE,
  pinned_until TIMESTAMPTZ,
  rating NUMERIC DEFAULT 0,
  views_count INTEGER DEFAULT 0,
  latitude NUMERIC,
  longitude NUMERIC,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- LISTING TRANSLATIONS
CREATE TABLE IF NOT EXISTS listing_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  locale app_locale NOT NULL,
  slug TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  address TEXT,
  working_hours JSONB DEFAULT '{}'::jsonb,
  price_range TEXT,
  menu_url TEXT,
  booking_url TEXT,
  website TEXT,
  phone TEXT,
  email TEXT,
  meta_title TEXT,
  meta_description TEXT,
  tags JSONB DEFAULT '[]'::jsonb,
  UNIQUE(listing_id, locale),
  UNIQUE(slug, locale)
);

ALTER TABLE listing_translations ENABLE ROW LEVEL SECURITY;

-- LISTING IMAGES
CREATE TABLE IF NOT EXISTS listing_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE NOT NULL,
  url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_primary BOOLEAN DEFAULT FALSE,
  alt_lt TEXT,
  alt_en TEXT,
  alt_pl TEXT,
  width INTEGER,
  height INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE listing_images ENABLE ROW LEVEL SECURITY;

-- Update EVENTS table to reference listings
DO $$
BEGIN
  -- Drop old foreign key if exists
  IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'events_organizer_id_fkey' AND table_name = 'events') THEN
    ALTER TABLE events DROP CONSTRAINT events_organizer_id_fkey;
  END IF;
  
  -- Add listing_id if not exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'listing_id') THEN
    ALTER TABLE events ADD COLUMN listing_id UUID REFERENCES listings(id) ON DELETE CASCADE;
  END IF;
  
  -- Add event-specific columns
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'start_datetime') THEN
    ALTER TABLE events ADD COLUMN start_datetime TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'end_datetime') THEN
    ALTER TABLE events ADD COLUMN end_datetime TIMESTAMPTZ;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'events' AND column_name = 'tags') THEN
    ALTER TABLE events ADD COLUMN tags JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES users(id) ON DELETE CASCADE NOT NULL,
  plan sub_plan NOT NULL,
  status sub_status NOT NULL,
  stripe_subscription_id TEXT,
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- SITE SETTINGS (CMS)
CREATE TABLE IF NOT EXISTS site_settings (
  key TEXT PRIMARY KEY,
  value_lt TEXT,
  value_en TEXT,
  value_pl TEXT,
  type setting_type DEFAULT 'text',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

-- SAVED TRIPS
CREATE TABLE IF NOT EXISTS saved_trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  title TEXT,
  start_date DATE,
  end_date DATE,
  preferences JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE saved_trips ENABLE ROW LEVEL SECURITY;

-- TRIP ITEMS
CREATE TABLE IF NOT EXISTS trip_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trip_id UUID REFERENCES saved_trips(id) ON DELETE CASCADE NOT NULL,
  listing_id UUID REFERENCES listings(id) ON DELETE CASCADE,
  day_number INTEGER NOT NULL,
  time_slot TEXT,
  notes TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE trip_items ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them
DROP POLICY IF EXISTS "Public can view active users" ON users;
DROP POLICY IF EXISTS "Users can update own profile" ON users;
DROP POLICY IF EXISTS "Admins have full access to users" ON users;

-- RLS POLICIES FOR USERS
CREATE POLICY "Anyone can view active users"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admins have full access to users"
  ON users FOR ALL
  USING (
    role = 'admin' AND auth.uid() = id
  );

-- RLS POLICIES FOR LISTINGS
CREATE POLICY "Public can view active listings"
  ON listings FOR SELECT
  USING (status = 'active');

CREATE POLICY "Partners can view own listings"
  ON listings FOR SELECT
  USING (auth.uid() = partner_id);

CREATE POLICY "Partners can insert own listings"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = partner_id);

CREATE POLICY "Partners can update own listings"
  ON listings FOR UPDATE
  USING (auth.uid() = partner_id);

CREATE POLICY "Admins have full access to listings"
  ON listings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS POLICIES FOR LISTING TRANSLATIONS
CREATE POLICY "Public can view translations of active listings"
  ON listing_translations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listings 
      WHERE id = listing_translations.listing_id 
      AND status = 'active'
    )
  );

CREATE POLICY "Partners can manage own listing translations"
  ON listing_translations FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM listings 
      WHERE id = listing_translations.listing_id 
      AND partner_id = auth.uid()
    )
  );

CREATE POLICY "Admins have full access to translations"
  ON listing_translations FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS POLICIES FOR LISTING IMAGES
CREATE POLICY "Public can view images of active listings"
  ON listing_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM listings 
      WHERE id = listing_images.listing_id 
      AND status = 'active'
    )
  );

CREATE POLICY "Partners can manage own listing images"
  ON listing_images FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM listings 
      WHERE id = listing_images.listing_id 
      AND partner_id = auth.uid()
    )
  );

CREATE POLICY "Admins have full access to images"
  ON listing_images FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS POLICIES FOR EVENTS
DROP POLICY IF EXISTS "Public can view events" ON events;
DROP POLICY IF EXISTS "Authenticated users can insert events" ON events;

CREATE POLICY "Public can view events"
  ON events FOR SELECT
  USING (
    listing_id IS NULL OR EXISTS (
      SELECT 1 FROM listings 
      WHERE id = events.listing_id 
      AND status = 'active'
    )
  );

CREATE POLICY "Partners can manage own events"
  ON events FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM listings 
      WHERE id = events.listing_id 
      AND partner_id = auth.uid()
    )
  );

CREATE POLICY "Admins have full access to events"
  ON events FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS POLICIES FOR SUBSCRIPTIONS
CREATE POLICY "Partners can view own subscriptions"
  ON subscriptions FOR SELECT
  USING (auth.uid() = partner_id);

CREATE POLICY "Admins have full access to subscriptions"
  ON subscriptions FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS POLICIES FOR SITE SETTINGS
CREATE POLICY "Anyone can view site settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage site settings"
  ON site_settings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS POLICIES FOR SAVED TRIPS
CREATE POLICY "Users can manage own trips"
  ON saved_trips FOR ALL
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all trips"
  ON saved_trips FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- RLS POLICIES FOR TRIP ITEMS
CREATE POLICY "Users can manage own trip items"
  ON trip_items FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM saved_trips 
      WHERE id = trip_items.trip_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all trip items"
  ON trip_items FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_partner ON listings(partner_id);
CREATE INDEX IF NOT EXISTS idx_listing_translations_listing ON listing_translations(listing_id);
CREATE INDEX IF NOT EXISTS idx_listing_translations_locale ON listing_translations(locale);
CREATE INDEX IF NOT EXISTS idx_listing_translations_slug ON listing_translations(slug);
CREATE INDEX IF NOT EXISTS idx_listing_images_listing ON listing_images(listing_id);
CREATE INDEX IF NOT EXISTS idx_events_listing ON events(listing_id);
CREATE INDEX IF NOT EXISTS idx_events_dates ON events(start_datetime, end_datetime);

-- Insert default site settings
INSERT INTO site_settings (key, value_lt, value_en, value_pl, type) VALUES
  ('hero_title', 'Atrask Vilnių', 'Discover Vilnius', 'Odkryj Wilno', 'text'),
  ('hero_subtitle', 'Tavo kelionės pradžia čia', 'Your journey starts here', 'Twoja podróż zaczyna się tutaj', 'text'),
  ('hero_description', 'Ištyrinėk sostinės grožį, skonis ir kultūrą', 'Explore the capital''s beauty, flavors and culture', 'Poznaj piękno, smaki i kulturę stolicy', 'text'),
  ('site_email', 'info@visitvilnius.lt', 'info@visitvilnius.lt', 'info@visitvilnius.lt', 'text'),
  ('site_phone', '+370 123 45678', '+370 123 45678', '+370 123 45678', 'text'),
  ('footer_address', 'Vilnius, Lietuva', 'Vilnius, Lithuania', 'Wilno, Litwa', 'text'),
  ('show_announcement_bar', 'false', 'false', 'false', 'boolean'),
  ('announcement_text', '', '', '', 'text')
ON CONFLICT (key) DO NOTHING;
