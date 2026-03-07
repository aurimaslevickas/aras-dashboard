/*
  # Add attribution columns to image tables

  Adds photographer/credit fields to:
  - hero_season_images: photographer_name, photographer_url
  - listing_images: photographer_name, photographer_url
  - listings: image_attribution (for main image_url)
  - articles: image_attribution (for featured_image)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hero_season_images' AND column_name = 'photographer_name'
  ) THEN
    ALTER TABLE hero_season_images ADD COLUMN photographer_name text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'hero_season_images' AND column_name = 'photographer_url'
  ) THEN
    ALTER TABLE hero_season_images ADD COLUMN photographer_url text DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listing_images' AND column_name = 'photographer_name'
  ) THEN
    ALTER TABLE listing_images ADD COLUMN photographer_name text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listing_images' AND column_name = 'photographer_url'
  ) THEN
    ALTER TABLE listing_images ADD COLUMN photographer_url text DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'image_attribution'
  ) THEN
    ALTER TABLE listings ADD COLUMN image_attribution text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'image_attribution_url'
  ) THEN
    ALTER TABLE listings ADD COLUMN image_attribution_url text DEFAULT '';
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'image_attribution'
  ) THEN
    ALTER TABLE articles ADD COLUMN image_attribution text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'articles' AND column_name = 'image_attribution_url'
  ) THEN
    ALTER TABLE articles ADD COLUMN image_attribution_url text DEFAULT '';
  END IF;
END $$;
