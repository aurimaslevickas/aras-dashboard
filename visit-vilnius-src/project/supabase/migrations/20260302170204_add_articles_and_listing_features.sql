/*
  # Add Articles Table and Extend Listings Features

  1. New Tables
    - `articles`
      - `id` (uuid, primary key)
      - `title` (text, required) - Article title
      - `slug` (text, unique, required) - URL-friendly slug
      - `content` (text) - Rich text content
      - `excerpt` (text) - Short description for previews
      - `featured_image` (text) - URL to featured image
      - `category` (text) - Category (event, eat, bar, shop, stay, see)
      - `tags` (text array) - Article tags for filtering
      - `meta_description` (text) - SEO meta description
      - `meta_keywords` (text) - SEO keywords
      - `published` (boolean, default false) - Publication status
      - `featured` (boolean, default false) - Show on category page
      - `author_id` (uuid, references auth.users)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes to `listings` table
    - Add `michelin_stars` (integer) - Number of Michelin stars (0-3)
    - Add `michelin_nominated` (boolean) - Michelin nomination status
    - Add `event_end_date` (date) - When event ends
    - Add `owner_id` (uuid) - References auth.users for partner access
    - Update category constraint to include 'bar'

  3. Security
    - Enable RLS on `articles` table
    - Add policies for authenticated users to read published articles
    - Add policies for admin users (via users.role) to manage articles
    - Update listings policies for partner/organizer access to events

  4. Important Notes
    - Articles can be assigned to categories and featured on specific pages
    - Events with past `event_end_date` will be filtered out automatically
    - Partners can manage their own event listings
    - Features array allows flexible categorization (e.g., cafe within restaurant)
*/

-- Create articles table
CREATE TABLE IF NOT EXISTS articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  content text,
  excerpt text,
  featured_image text,
  category text CHECK (category IN ('event', 'eat', 'bar', 'shop', 'stay', 'see')),
  tags text[] DEFAULT '{}',
  meta_description text,
  meta_keywords text,
  published boolean DEFAULT false,
  featured boolean DEFAULT false,
  author_id uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add new columns to listings table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'michelin_stars'
  ) THEN
    ALTER TABLE listings ADD COLUMN michelin_stars integer DEFAULT 0 CHECK (michelin_stars >= 0 AND michelin_stars <= 3);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'michelin_nominated'
  ) THEN
    ALTER TABLE listings ADD COLUMN michelin_nominated boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'event_end_date'
  ) THEN
    ALTER TABLE listings ADD COLUMN event_end_date date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE listings ADD COLUMN owner_id uuid REFERENCES auth.users(id);
  END IF;
END $$;

-- Update category constraint to include 'bar'
ALTER TABLE listings DROP CONSTRAINT IF EXISTS valid_categories;
ALTER TABLE listings ADD CONSTRAINT valid_categories 
  CHECK (category IN ('hotel', 'restaurant', 'bar', 'attraction', 'shop', 'event'));

-- Enable RLS on articles
ALTER TABLE articles ENABLE ROW LEVEL SECURITY;

-- Articles policies: Anyone can view published articles
CREATE POLICY "Anyone can view published articles"
  ON articles FOR SELECT
  USING (published = true);

-- Articles policies: Authors can view own articles
CREATE POLICY "Authors can view own articles"
  ON articles FOR SELECT
  TO authenticated
  USING (author_id = auth.uid());

-- Articles policies: Admin can view all articles
CREATE POLICY "Admin can view all articles"
  ON articles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Articles policies: Admin can insert articles
CREATE POLICY "Admin can insert articles"
  ON articles FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Articles policies: Admin can update articles
CREATE POLICY "Admin can update articles"
  ON articles FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Articles policies: Admin can delete articles
CREATE POLICY "Admin can delete articles"
  ON articles FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Listings policies: Owners can view own listings
CREATE POLICY "Owners can view own listings"
  ON listings FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

-- Listings policies: Owners can update own listings
CREATE POLICY "Owners can update own listings"
  ON listings FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_published ON articles(published);
CREATE INDEX IF NOT EXISTS idx_articles_featured ON articles(featured);
CREATE INDEX IF NOT EXISTS idx_articles_slug ON articles(slug);
CREATE INDEX IF NOT EXISTS idx_listings_event_end_date ON listings(event_end_date);
CREATE INDEX IF NOT EXISTS idx_listings_owner_id ON listings(owner_id);
CREATE INDEX IF NOT EXISTS idx_listings_features ON listings USING gin(features);