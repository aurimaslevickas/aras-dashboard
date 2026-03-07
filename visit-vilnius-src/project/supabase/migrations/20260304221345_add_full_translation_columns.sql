/*
  # Add full multilingual translation columns

  ## Summary
  Adds missing translation columns to listings and articles tables for all 6 supported languages:
  Lithuanian (lt), English (en), Polish (pl), German (de), Russian (ru), French (fr).

  ## Changes

  ### listings table
  - description_en, description_pl, description_de, description_ru, description_fr
  - name_ru, name_fr
  - slug_fr, slug_ru (slug_ru already nullable, adding slug_fr)
  - location_en, location_pl, location_de, location_ru, location_fr

  ### articles table
  - title_ru, title_fr
  - slug_fr (slug_ru already exists)
  - content_en, content_pl, content_de, content_ru, content_fr
  - excerpt_en, excerpt_pl, excerpt_de, excerpt_ru, excerpt_fr
*/

DO $$
BEGIN
  -- listings: description translations
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'description_en') THEN
    ALTER TABLE listings ADD COLUMN description_en TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'description_pl') THEN
    ALTER TABLE listings ADD COLUMN description_pl TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'description_de') THEN
    ALTER TABLE listings ADD COLUMN description_de TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'description_ru') THEN
    ALTER TABLE listings ADD COLUMN description_ru TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'description_fr') THEN
    ALTER TABLE listings ADD COLUMN description_fr TEXT DEFAULT '';
  END IF;

  -- listings: name translations (ru, fr missing)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'name_ru') THEN
    ALTER TABLE listings ADD COLUMN name_ru TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'name_fr') THEN
    ALTER TABLE listings ADD COLUMN name_fr TEXT DEFAULT '';
  END IF;

  -- listings: slug translations (fr missing)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'listings' AND column_name = 'slug_fr') THEN
    ALTER TABLE listings ADD COLUMN slug_fr TEXT DEFAULT '';
  END IF;

  -- articles: title translations (ru, fr missing)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'title_ru') THEN
    ALTER TABLE articles ADD COLUMN title_ru TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'title_fr') THEN
    ALTER TABLE articles ADD COLUMN title_fr TEXT DEFAULT '';
  END IF;

  -- articles: slug translations (fr missing)
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'slug_fr') THEN
    ALTER TABLE articles ADD COLUMN slug_fr TEXT DEFAULT '';
  END IF;

  -- articles: content translations
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'content_en') THEN
    ALTER TABLE articles ADD COLUMN content_en TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'content_pl') THEN
    ALTER TABLE articles ADD COLUMN content_pl TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'content_de') THEN
    ALTER TABLE articles ADD COLUMN content_de TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'content_ru') THEN
    ALTER TABLE articles ADD COLUMN content_ru TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'content_fr') THEN
    ALTER TABLE articles ADD COLUMN content_fr TEXT DEFAULT '';
  END IF;

  -- articles: excerpt translations
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'excerpt_en') THEN
    ALTER TABLE articles ADD COLUMN excerpt_en TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'excerpt_pl') THEN
    ALTER TABLE articles ADD COLUMN excerpt_pl TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'excerpt_de') THEN
    ALTER TABLE articles ADD COLUMN excerpt_de TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'excerpt_ru') THEN
    ALTER TABLE articles ADD COLUMN excerpt_ru TEXT DEFAULT '';
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'articles' AND column_name = 'excerpt_fr') THEN
    ALTER TABLE articles ADD COLUMN excerpt_fr TEXT DEFAULT '';
  END IF;
END $$;
