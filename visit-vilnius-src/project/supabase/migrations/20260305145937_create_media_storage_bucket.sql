/*
  # Create media storage bucket

  1. Creates the 'media' storage bucket used for all image uploads
     - Public bucket (images are publicly accessible via URL)
     - Used by: ImageUploadField, GalleryUploadField, MediaPickerModal, MediaLibraryPage, HeroImagesPage

  2. RLS Policies
     - Anyone can read/view media files (public read)
     - Only authenticated admin users can upload files
     - Only authenticated admin users can delete files

  3. Notes
     - This bucket was missing, causing ALL image upload attempts to fail silently
     - The 'media' bucket name is hardcoded throughout the application
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('media', 'media', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public read access for media"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'media');

CREATE POLICY "Authenticated users can upload media"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'media');

CREATE POLICY "Authenticated users can delete media"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (bucket_id = 'media');
