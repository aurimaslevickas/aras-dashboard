/*
  # Add organizer field and auto-deactivation for events

  1. Changes
    - Add `organizer` text column to listings table (for event organizer name, e.g. "Baleto teatras")
    - Add multilingual organizer columns: organizer_en, organizer_pl, organizer_de, organizer_ru, organizer_fr
    - Create auto-deactivation function that sets status='inactive' when event_end_date has passed

  2. Notes
    - organizer field is optional (nullable)
    - Auto-deactivation only affects 'active' events (won't touch pending/draft)
    - pg_cron not available, function can be called manually or via edge function cron
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'organizer'
  ) THEN
    ALTER TABLE listings ADD COLUMN organizer TEXT;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'organizer_en'
  ) THEN
    ALTER TABLE listings ADD COLUMN organizer_en TEXT;
    ALTER TABLE listings ADD COLUMN organizer_pl TEXT;
    ALTER TABLE listings ADD COLUMN organizer_de TEXT;
    ALTER TABLE listings ADD COLUMN organizer_ru TEXT;
    ALTER TABLE listings ADD COLUMN organizer_fr TEXT;
  END IF;
END $$;

CREATE OR REPLACE FUNCTION auto_deactivate_past_events()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  updated_count integer;
BEGIN
  UPDATE listings
  SET status = 'inactive', updated_at = now()
  WHERE category = 'event'
    AND status = 'active'
    AND event_end_date IS NOT NULL
    AND event_end_date < now();

  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$;
