/*
  # Add social media settings

  Inserts configurable social media link settings into site_settings table.
  Each social network has two settings:
  - `social_X_enabled` - boolean (stored as 'true'/'false' string) to show/hide the icon
  - `social_X_url` - the actual URL

  Networks: facebook, instagram, tiktok, x (Twitter/X)
*/

INSERT INTO site_settings (key, value_lt) VALUES
  ('social_facebook_enabled', 'false'),
  ('social_facebook_url', ''),
  ('social_instagram_enabled', 'false'),
  ('social_instagram_url', ''),
  ('social_tiktok_enabled', 'false'),
  ('social_tiktok_url', ''),
  ('social_x_enabled', 'false'),
  ('social_x_url', '')
ON CONFLICT (key) DO NOTHING;
