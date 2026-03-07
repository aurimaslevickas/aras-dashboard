/*
  # Add promoted_until column to listings

  ## Summary
  Adds a `promoted_until` timestamptz column to the listings table.
  When set to a future date, the listing is "promoted" to the homepage and appears at the top of its category page.
  When null or in the past, promotion is expired and listing behaves normally.

  ## Changes
  - `listings.promoted_until` (timestamptz, nullable) - expiry datetime for homepage promotion
  - Index added for efficient querying of active promotions
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'promoted_until'
  ) THEN
    ALTER TABLE listings ADD COLUMN promoted_until timestamptz DEFAULT NULL;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_listings_promoted_until ON listings (promoted_until) WHERE promoted_until IS NOT NULL;
