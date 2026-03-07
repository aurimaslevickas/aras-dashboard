/*
  # Add multilingual columns to hero site_settings

  1. Changes
    - Adds value_pl, value_de, value_ru, value_fr columns to site_settings if they don't exist
    - Inserts/updates hero_title with translations for all 6 languages
    - Inserts/updates hero_description with translations for all 6 languages

  2. Languages supported
    - LT (Lithuanian), EN (English), PL (Polish), DE (German), RU (Russian), FR (French)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'value_pl'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN value_pl text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'value_de'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN value_de text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'value_ru'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN value_ru text DEFAULT '';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'site_settings' AND column_name = 'value_fr'
  ) THEN
    ALTER TABLE site_settings ADD COLUMN value_fr text DEFAULT '';
  END IF;
END $$;

INSERT INTO site_settings (key, value_lt, value_en, value_pl, value_de, value_ru, value_fr)
VALUES (
  'hero_title',
  'Atrask Vilnių',
  'Discover Vilnius',
  'Odkryj Wilno',
  'Entdecke Vilnius',
  'Откройте Вильнюс',
  'Découvrez Vilnius'
)
ON CONFLICT (key) DO UPDATE SET
  value_lt = EXCLUDED.value_lt,
  value_en = EXCLUDED.value_en,
  value_pl = EXCLUDED.value_pl,
  value_de = EXCLUDED.value_de,
  value_ru = EXCLUDED.value_ru,
  value_fr = EXCLUDED.value_fr;

INSERT INTO site_settings (key, value_lt, value_en, value_pl, value_de, value_ru, value_fr)
VALUES (
  'hero_description',
  'Ištyrinėk sostinės grožį, skonį ir kultūrą',
  'Explore the capital''s beauty, flavors and culture',
  'Poznaj piękno, smaki i kulturę stolicy',
  'Erkunde die Schönheit, Geschmäcke und Kultur der Hauptstadt',
  'Исследуйте красоту, вкусы и культуру столицы',
  'Explorez la beauté, les saveurs et la culture de la capitale'
)
ON CONFLICT (key) DO UPDATE SET
  value_lt = EXCLUDED.value_lt,
  value_en = EXCLUDED.value_en,
  value_pl = EXCLUDED.value_pl,
  value_de = EXCLUDED.value_de,
  value_ru = EXCLUDED.value_ru,
  value_fr = EXCLUDED.value_fr;

INSERT INTO site_settings (key, value_lt, value_en, value_pl, value_de, value_ru, value_fr)
VALUES (
  'hero_welcome_prefix',
  'Sveiki atvykę į',
  'Welcome to',
  'Witamy w',
  'Willkommen in',
  'Добро пожаловать в',
  'Bienvenue à'
)
ON CONFLICT (key) DO NOTHING;
