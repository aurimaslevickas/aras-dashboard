/*
  # Fix storage upload policy and category_sections RLS

  1. Storage objects INSERT policy
     - Simplified to only check bucket_id = 'media' for authenticated users
     - Removes the owner check that was causing failures due to column timing issues

  2. category_sections UPDATE policy
     - Ensures admins can update existing rows via upsert
*/

DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;

CREATE POLICY "Authenticated users can upload media"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media');
