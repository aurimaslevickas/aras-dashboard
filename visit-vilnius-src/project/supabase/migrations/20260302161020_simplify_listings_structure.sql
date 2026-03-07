/*
  # Simplify Listings Structure
  
  1. Changes
    - Add slug to listings table for clean URLs
    - Add name and other fields directly to listings
    - Keep structure simple and easy to use
    
  2. Security
    - Maintain existing RLS policies
*/

-- Add missing columns to listings table
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'slug') THEN
    ALTER TABLE listings ADD COLUMN slug TEXT UNIQUE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'name') THEN
    ALTER TABLE listings ADD COLUMN name TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'description') THEN
    ALTER TABLE listings ADD COLUMN description TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'location') THEN
    ALTER TABLE listings ADD COLUMN location TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'price_range') THEN
    ALTER TABLE listings ADD COLUMN price_range TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'image_url') THEN
    ALTER TABLE listings ADD COLUMN image_url TEXT;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'contact_info') THEN
    ALTER TABLE listings ADD COLUMN contact_info JSONB DEFAULT '{}'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'opening_hours') THEN
    ALTER TABLE listings ADD COLUMN opening_hours JSONB DEFAULT '{}'::jsonb;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'features') THEN
    ALTER TABLE listings ADD COLUMN features TEXT[] DEFAULT ARRAY[]::TEXT[];
  END IF;
END $$;

-- Create index on slug for fast lookups
CREATE INDEX IF NOT EXISTS idx_listings_slug ON listings(slug);

-- Update category enum to match current usage
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'listing_category') THEN
    CREATE TYPE listing_category AS ENUM ('hotel', 'restaurant', 'attraction', 'shop');
  END IF;
EXCEPTION WHEN duplicate_object THEN null;
END $$;