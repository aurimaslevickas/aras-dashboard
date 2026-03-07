/*
  # Add event_start_date column to listings

  Adds event_start_date column to listings table for storing event start datetime.
  Previously only event_end_date existed.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'event_start_date'
  ) THEN
    ALTER TABLE listings ADD COLUMN event_start_date timestamptz;
  END IF;
END $$;
