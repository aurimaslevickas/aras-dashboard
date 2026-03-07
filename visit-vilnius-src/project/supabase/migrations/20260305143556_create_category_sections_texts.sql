/*
  # Create category_sections table for multilingual section texts

  1. New Table: `category_sections`
    - `key` (text, primary key) — section identifier
    - title and description columns for 6 languages (lt, en, pl, de, ru, fr)
    - `updated_at` (timestamp)

  2. Initial data for all main homepage sections: see, bar, eat, stay, shop, events

  3. Security
    - RLS enabled
    - Public SELECT (section texts are public)
    - Admin-only INSERT/UPDATE/DELETE via is_admin() function (no-arg version)
*/

CREATE TABLE IF NOT EXISTS category_sections (
  key text PRIMARY KEY,
  title_lt text DEFAULT '',
  title_en text DEFAULT '',
  title_pl text DEFAULT '',
  title_de text DEFAULT '',
  title_ru text DEFAULT '',
  title_fr text DEFAULT '',
  description_lt text DEFAULT '',
  description_en text DEFAULT '',
  description_pl text DEFAULT '',
  description_de text DEFAULT '',
  description_ru text DEFAULT '',
  description_fr text DEFAULT '',
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE category_sections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read category sections"
  ON category_sections FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admins can insert category sections"
  ON category_sections FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can update category sections"
  ON category_sections FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete category sections"
  ON category_sections FOR DELETE
  TO authenticated
  USING (public.is_admin());

INSERT INTO category_sections (key, title_lt, title_en, title_pl, title_de, title_ru, title_fr, description_lt, description_en, description_pl, description_de, description_ru, description_fr)
VALUES
  (
    'see',
    'Ką pamatyti Vilniuje',
    'What to See in Vilnius',
    'Co zobaczyć w Wilnie',
    'Was in Vilnius zu sehen ist',
    'Что посмотреть в Вильнюсе',
    'Que voir à Vilnius',
    'Atraskite lankytinas vietas, paslėptus brangakmenius ir kultūros objektus sostinėje',
    'Discover must-visit attractions and hidden gems in Lithuania''s historic capital',
    'Odkryj obowiązkowe atrakcje i ukryte skarby historycznej stolicy Litwy',
    'Entdecken Sie Sehenswürdigkeiten und versteckte Schätze der historischen Hauptstadt',
    'Откройте для себя обязательные достопримечательности и скрытые жемчужины исторической столицы',
    'Découvrez les incontournables et les trésors cachés de la capitale historique'
  ),
  (
    'bar',
    'Barai ir vyninės',
    'Bars & Wine Bars',
    'Bary i winiarnie',
    'Bars & Weinbars',
    'Бары и винные бары',
    'Bars & Bars à vin',
    'Geriausios vietos atsipalaiduoti su kokteilio ar vyno taure Vilniuje',
    'The best spots to unwind with a cocktail or glass of wine in Vilnius',
    'Najlepsze miejsca, aby zrelaksować się z koktajlem lub kieliszkiem wina w Wilnie',
    'Die besten Orte zum Entspannen mit einem Cocktail oder Wein in Vilnius',
    'Лучшие места для отдыха с коктейлем или бокалом вина в Вильнюсе',
    'Les meilleurs endroits pour se détendre avec un cocktail ou un verre de vin à Vilnius'
  ),
  (
    'eat',
    'Kur valgyti Vilniuje',
    'Where to Eat in Vilnius',
    'Gdzie jeść w Wilnie',
    'Wo man in Vilnius essen kann',
    'Где поесть в Вильнюсе',
    'Où manger à Vilnius',
    'Geriausių restoranų, kavinių ir gurmanų vietų pasirinkimas',
    'A selection of the best restaurants, cafés and gourmet spots',
    'Wybór najlepszych restauracji, kawiarni i miejsc dla smakoszy',
    'Eine Auswahl der besten Restaurants, Cafés und Gourmet-Orte',
    'Подборка лучших ресторанов, кафе и гастрономических заведений',
    'Une sélection des meilleurs restaurants, cafés et spots gastronomiques'
  ),
  (
    'stay',
    'Kur nakvoti Vilniuje',
    'Where to Stay in Vilnius',
    'Gdzie nocować w Wilnie',
    'Wo man in Vilnius übernachten kann',
    'Где остановиться в Вильнюсе',
    'Où séjourner à Vilnius',
    'Viešbučiai, butaliai ir kitos nakvynės galimybės sostinėje',
    'Hotels, apartments and other accommodation options in the capital',
    'Hotele, apartamenty i inne opcje zakwaterowania w stolicy',
    'Hotels, Apartments und andere Unterkunftsmöglichkeiten in der Hauptstadt',
    'Отели, апартаменты и другие варианты размещения в столице',
    'Hôtels, appartements et autres hébergements dans la capitale'
  ),
  (
    'shop',
    'Apsipirkimas Vilniuje',
    'Shopping in Vilnius',
    'Zakupy w Wilnie',
    'Einkaufen in Vilnius',
    'Шоппинг в Вильнюсе',
    'Shopping à Vilnius',
    'Parduotuvės, turgūs ir dizainerių parduotuvės',
    'Shops, markets and designer boutiques',
    'Sklepy, targi i butiki designerskie',
    'Geschäfte, Märkte und Designer-Boutiquen',
    'Магазины, рынки и дизайнерские бутики',
    'Boutiques, marchés et enseignes de créateurs'
  ),
  (
    'events',
    'Renginiai Vilniuje',
    'Events in Vilnius',
    'Wydarzenia w Wilnie',
    'Veranstaltungen in Vilnius',
    'События в Вильнюсе',
    'Événements à Vilnius',
    'Koncertai, festivaliai, mugės ir kiti renginiai',
    'Concerts, festivals, fairs and other events',
    'Koncerty, festiwale, targi i inne wydarzenia',
    'Konzerte, Festivals, Messen und andere Veranstaltungen',
    'Концерты, фестивали, ярмарки и другие мероприятия',
    'Concerts, festivals, foires et autres événements'
  )
ON CONFLICT (key) DO UPDATE SET
  title_lt = EXCLUDED.title_lt,
  title_en = EXCLUDED.title_en,
  title_pl = EXCLUDED.title_pl,
  title_de = EXCLUDED.title_de,
  title_ru = EXCLUDED.title_ru,
  title_fr = EXCLUDED.title_fr,
  description_lt = EXCLUDED.description_lt,
  description_en = EXCLUDED.description_en,
  description_pl = EXCLUDED.description_pl,
  description_de = EXCLUDED.description_de,
  description_ru = EXCLUDED.description_ru,
  description_fr = EXCLUDED.description_fr,
  updated_at = now();
