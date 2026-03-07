/*
  # Add gallery_images column to listings

  Adds support for multiple photos per listing.

  1. Changes
    - `listings` table: add `gallery_images` column (text array, stores multiple image URLs)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'gallery_images'
  ) THEN
    ALTER TABLE listings ADD COLUMN gallery_images text[] DEFAULT '{}';
  END IF;
END $$;
