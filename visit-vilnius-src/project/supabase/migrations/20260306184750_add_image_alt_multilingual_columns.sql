/*
  # Add multilingual image alt text columns to listings

  ## Summary
  Adds image_alt_lt, image_alt_en, image_alt_pl, image_alt_de, image_alt_ru, image_alt_fr
  columns to the listings table to store SEO-friendly alt text for the main image
  in all 6 supported languages.

  ## New Columns
  - `image_alt_lt` (text) - Lithuanian alt text for main image
  - `image_alt_en` (text) - English alt text
  - `image_alt_pl` (text) - Polish alt text
  - `image_alt_de` (text) - German alt text
  - `image_alt_ru` (text) - Russian alt text
  - `image_alt_fr` (text) - French alt text

  ## Notes
  - All columns are nullable with empty string defaults
  - No RLS changes needed - existing policies cover the listings table
  - Used by frontend to render proper alt attributes on images for SEO
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'image_alt_lt') THEN
    ALTER TABLE listings ADD COLUMN image_alt_lt TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'image_alt_en') THEN
    ALTER TABLE listings ADD COLUMN image_alt_en TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'image_alt_pl') THEN
    ALTER TABLE listings ADD COLUMN image_alt_pl TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'image_alt_de') THEN
    ALTER TABLE listings ADD COLUMN image_alt_de TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'image_alt_ru') THEN
    ALTER TABLE listings ADD COLUMN image_alt_ru TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'image_alt_fr') THEN
    ALTER TABLE listings ADD COLUMN image_alt_fr TEXT DEFAULT '';
  END IF;
END $$;
