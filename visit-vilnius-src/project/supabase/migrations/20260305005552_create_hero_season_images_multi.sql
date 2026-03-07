/*
  # Create hero_season_images table (multi-image per season)

  Allows up to 4 images per season for the homepage hero slideshow.

  1. New Tables
    - `hero_season_images`
      - `id` (uuid, primary key)
      - `season` (text) — spring, summer, autumn, winter
      - `image_url` (text) — image URL
      - `sort_order` (int) — order within season
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS
    - Public SELECT (needed for frontend)
    - Authenticated admin can manage

  3. Seed
    - Copy existing single images from hero_images table
*/

CREATE TABLE IF NOT EXISTS hero_season_images (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season text NOT NULL CHECK (season IN ('spring', 'summer', 'autumn', 'winter')),
  image_url text NOT NULL,
  sort_order int NOT NULL DEFAULT 1,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE hero_season_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view hero season images"
  ON hero_season_images FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Admins can insert hero season images"
  ON hero_season_images FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "Admins can delete hero season images"
  ON hero_season_images FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = auth.uid()
      AND auth.users.raw_app_meta_data->>'role' = 'admin'
    )
  );

INSERT INTO hero_season_images (season, image_url, sort_order)
SELECT season, image_url, 1
FROM hero_images
WHERE active = true;
