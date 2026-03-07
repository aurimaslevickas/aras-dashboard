/*
  # Fix storage objects INSERT policy for media bucket

  The current INSERT policy only checks bucket_id but newer Supabase versions
  also validate the owner column against auth.uid(). Dropping and recreating
  the policy with the correct WITH CHECK that includes owner validation.
*/

DROP POLICY IF EXISTS "Authenticated users can upload media" ON storage.objects;

CREATE POLICY "Authenticated users can upload media"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'media'
    AND (owner = auth.uid() OR owner IS NULL)
  );
