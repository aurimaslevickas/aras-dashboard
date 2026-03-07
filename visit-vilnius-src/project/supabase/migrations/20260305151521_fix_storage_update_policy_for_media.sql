/*
  # Fix storage objects UPDATE policy for media bucket

  Some Supabase clients require an UPDATE policy on storage.objects to allow
  file uploads that might conflict with existing paths.

  Also adds a missing UPDATE policy on media_library for admins.
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects'
    AND policyname = 'Authenticated users can update media'
  ) THEN
    CREATE POLICY "Authenticated users can update media"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'media')
      WITH CHECK (bucket_id = 'media');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'media_library'
    AND policyname = 'Admin can update media'
  ) THEN
    CREATE POLICY "Admin can update media"
      ON media_library FOR UPDATE
      TO authenticated
      USING (is_admin())
      WITH CHECK (is_admin());
  END IF;
END $$;
