/*
  # Add badge column to listings

  1. Changes
    - Add `badge` (text, nullable) column to listings table
    - Stores a badge key: 'featured', 'free_entry', 'must_try', 'new', 'popular', or NULL for no badge
    - Migrate existing is_featured=true rows to badge='featured'

  2. Notes
    - is_featured column is kept for backwards compatibility but badge is the new source of truth for display
    - badge is displayed translated per the active language using i18n keys
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'badge'
  ) THEN
    ALTER TABLE listings ADD COLUMN badge text DEFAULT NULL;
  END IF;
END $$;

UPDATE listings SET badge = 'featured' WHERE is_featured = true AND badge IS NULL;
