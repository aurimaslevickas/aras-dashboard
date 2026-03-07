/*
  # Universal Public Listing Submission

  ## Summary
  Extends the platform to allow anyone (anonymous users) to submit any type of listing
  for review - not just events. This enables bars, restaurants, hotels, shops, and
  attractions to submit themselves without admin involvement.

  ## Changes

  ### 1. RLS Policy Updates (listings table)
  - Drops old event-only public insert policy
  - Creates new policy allowing anon insert for ALL categories (event, restaurant, bar, hotel, shop, attraction)
  - Enforces status = 'pending' so all submissions require admin approval

  ### 2. Storage Policy for Anonymous Uploads
  - Allows anonymous users to upload images to the 'media' bucket under 'submissions/' prefix
  - Anonymous uploads are kept separate from admin-managed media
  - Read access remains public (already exists)

  ### 3. Media Library Insert for Anon
  - Allows anon users to insert media_library records for their uploaded files
  - Required so the upload process can track the file metadata

  ## Security Notes
  - All submitted listings are status='pending' - nothing goes live without admin approval
  - Storage uploads are restricted to 'submissions/' folder prefix
  - Listings submitted without auth.uid() will have null owner_id (fine for pending review)
*/

-- Drop old event-only policy
DROP POLICY IF EXISTS "Anyone can submit events for review" ON listings;

-- New universal policy: anyone can submit any category for review
CREATE POLICY "Anyone can submit listings for review"
  ON listings
  FOR INSERT
  TO anon
  WITH CHECK (
    category IN ('event', 'restaurant', 'bar', 'hotel', 'shop', 'attraction')
    AND status = 'pending'
  );

-- Allow anonymous users to upload to submissions/ folder in media bucket
DO $$
BEGIN
  -- Drop existing anon upload policy if exists
  BEGIN
    DROP POLICY IF EXISTS "Anon can upload to submissions folder" ON storage.objects;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

CREATE POLICY "Anon can upload to submissions folder"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (
    bucket_id = 'media'
    AND (storage.foldername(name))[1] = 'submissions'
  );

-- Allow anonymous users to read their uploaded files (public bucket already allows this, but be explicit)
DO $$
BEGIN
  BEGIN
    DROP POLICY IF EXISTS "Anon can read submissions" ON storage.objects;
  EXCEPTION WHEN OTHERS THEN NULL;
  END;
END $$;

CREATE POLICY "Anon can read submissions"
  ON storage.objects
  FOR SELECT
  TO anon
  USING (
    bucket_id = 'media'
    AND (storage.foldername(name))[1] = 'submissions'
  );

-- Allow anon to insert into media_library for tracking their uploads
DROP POLICY IF EXISTS "Anon can insert media library entries" ON media_library;

CREATE POLICY "Anon can insert media library entries"
  ON media_library
  FOR INSERT
  TO anon
  WITH CHECK (true);
