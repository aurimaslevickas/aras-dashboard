/*
  # Add Multilingual Slug Support

  1. Changes to Tables
    - `listings`
      - Add `slug_lt` (text) - Lithuanian slug
      - Add `slug_en` (text) - English slug
      - Add `slug_pl` (text) - Polish slug
      - Add `slug_de` (text) - German slug
      - Add `slug_ru` (text) - Russian slug
      - Keep existing `slug` as default/fallback

    - `articles`
      - Add `slug_lt` (text) - Lithuanian slug
      - Add `slug_en` (text) - English slug
      - Add `slug_pl` (text) - Polish slug
      - Add `slug_de` (text) - German slug
      - Add `slug_ru` (text) - Russian slug
      - Keep existing `slug` as default/fallback

  2. Indexes
    - Add indexes for all language-specific slugs for fast lookups
    - Unique constraint only applies when slug is NOT NULL and not empty

  3. Important Notes
    - Each language will have its own unique URL structure
    - Example:
      - Lithuanian: /eat/kavine-senoji-vieta
      - English: /eat/old-town-cafe
      - German: /eat/altstadtkaffee
      - Russian: /eat/kafe-staryj-gorod
      - Polish: /eat/kawiarnia-stare-miasto
    - Fallback to `slug` if language-specific slug is null
*/

-- Add multilingual slug columns to listings
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'slug_lt'
  ) THEN
    ALTER TABLE listings ADD COLUMN slug_lt text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'slug_en'
  ) THEN
    ALTER TABLE listings ADD COLUMN slug_en text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'slug_pl'
  ) THEN
    ALTER TABLE listings ADD COLUMN slug_pl text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'slug_de'
  ) THEN
    ALTER TABLE listings ADD COLUMN slug_de text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'slug_ru'
  ) THEN
    ALTER TABLE listings ADD COLUMN slug_ru text;
  END IF;
END $$;

-- Add multilingual slug columns to articles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'slug_lt'
  ) THEN
    ALTER TABLE articles ADD COLUMN slug_lt text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'slug_en'
  ) THEN
    ALTER TABLE articles ADD COLUMN slug_en text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'slug_pl'
  ) THEN
    ALTER TABLE articles ADD COLUMN slug_pl text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'slug_de'
  ) THEN
    ALTER TABLE articles ADD COLUMN slug_de text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'slug_ru'
  ) THEN
    ALTER TABLE articles ADD COLUMN slug_ru text;
  END IF;
END $$;

-- Drop existing indexes if they exist
DROP INDEX IF EXISTS idx_listings_slug_lt;
DROP INDEX IF EXISTS idx_listings_slug_en;
DROP INDEX IF EXISTS idx_listings_slug_pl;
DROP INDEX IF EXISTS idx_listings_slug_de;
DROP INDEX IF EXISTS idx_listings_slug_ru;
DROP INDEX IF EXISTS idx_articles_slug_lt;
DROP INDEX IF EXISTS idx_articles_slug_en;
DROP INDEX IF EXISTS idx_articles_slug_pl;
DROP INDEX IF EXISTS idx_articles_slug_de;
DROP INDEX IF EXISTS idx_articles_slug_ru;

-- Create unique indexes for listings language-specific slugs (only for non-null and non-empty values)
CREATE UNIQUE INDEX idx_listings_slug_lt ON listings(slug_lt) WHERE slug_lt IS NOT NULL AND slug_lt != '';
CREATE UNIQUE INDEX idx_listings_slug_en ON listings(slug_en) WHERE slug_en IS NOT NULL AND slug_en != '';
CREATE UNIQUE INDEX idx_listings_slug_pl ON listings(slug_pl) WHERE slug_pl IS NOT NULL AND slug_pl != '';
CREATE UNIQUE INDEX idx_listings_slug_de ON listings(slug_de) WHERE slug_de IS NOT NULL AND slug_de != '';
CREATE UNIQUE INDEX idx_listings_slug_ru ON listings(slug_ru) WHERE slug_ru IS NOT NULL AND slug_ru != '';

-- Create unique indexes for articles language-specific slugs (only for non-null and non-empty values)
CREATE UNIQUE INDEX idx_articles_slug_lt ON articles(slug_lt) WHERE slug_lt IS NOT NULL AND slug_lt != '';
CREATE UNIQUE INDEX idx_articles_slug_en ON articles(slug_en) WHERE slug_en IS NOT NULL AND slug_en != '';
CREATE UNIQUE INDEX idx_articles_slug_pl ON articles(slug_pl) WHERE slug_pl IS NOT NULL AND slug_pl != '';
CREATE UNIQUE INDEX idx_articles_slug_de ON articles(slug_de) WHERE slug_de IS NOT NULL AND slug_de != '';
CREATE UNIQUE INDEX idx_articles_slug_ru ON articles(slug_ru) WHERE slug_ru IS NOT NULL AND slug_ru != '';
