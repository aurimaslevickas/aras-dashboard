/*
  # Insert API key settings rows

  Creates initial rows for ga4_measurement_id and openai_api_key in site_settings
  so that admins can update them via upsert without needing INSERT privileges.
*/

INSERT INTO site_settings (key, value_lt, value_en, value_pl, type, updated_at)
VALUES
  ('ga4_measurement_id', '', '', '', 'text', now()),
  ('openai_api_key', '', '', '', 'text', now())
ON CONFLICT (key) DO NOTHING;
