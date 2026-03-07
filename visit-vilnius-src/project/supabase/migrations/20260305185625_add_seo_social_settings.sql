/*
  # Add SEO / Social Sharing settings

  Adds three new rows to `site_settings` for Open Graph / social sharing meta tags:

  1. `og_title`       – Default page title shown when shared on Facebook/Viber/etc.
  2. `og_description` – Default description shown in social share cards.
  3. `og_image`       – Default image URL shown in social share cards (should be at least 1200×630 px).

  These values are used as fallbacks in SEOHead when a specific page does not supply its own image/title/description.
*/

INSERT INTO site_settings (key, value_lt, updated_at)
VALUES
  ('og_title',       '',  now()),
  ('og_description', '',  now()),
  ('og_image',       '',  now())
ON CONFLICT (key) DO NOTHING;
