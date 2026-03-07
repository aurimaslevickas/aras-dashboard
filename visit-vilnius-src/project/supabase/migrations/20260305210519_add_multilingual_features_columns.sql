/*
  # Add multilingual features columns to listings

  Adds features_en, features_pl, features_de, features_ru, features_fr columns
  to the listings table so that feature tags can be stored in multiple languages.
  The existing `features` column is treated as the Lithuanian (lt) version.
*/

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'features_en') THEN
    ALTER TABLE listings ADD COLUMN features_en text[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'features_pl') THEN
    ALTER TABLE listings ADD COLUMN features_pl text[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'features_de') THEN
    ALTER TABLE listings ADD COLUMN features_de text[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'features_ru') THEN
    ALTER TABLE listings ADD COLUMN features_ru text[] DEFAULT '{}';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'features_fr') THEN
    ALTER TABLE listings ADD COLUMN features_fr text[] DEFAULT '{}';
  END IF;
END $$;
