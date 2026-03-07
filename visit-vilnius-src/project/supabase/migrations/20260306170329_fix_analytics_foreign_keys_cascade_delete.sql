/*
  # Fix analytics foreign keys to use CASCADE DELETE

  ## Problem
  analytics_views and analytics_clicks tables have foreign keys to listings
  with ON DELETE NO ACTION, which prevents deleting listings that have analytics data.

  ## Fix
  Drop and recreate the foreign key constraints with ON DELETE CASCADE so that
  when a listing is deleted, its analytics records are automatically removed.
*/

ALTER TABLE analytics_views
  DROP CONSTRAINT IF EXISTS analytics_views_listing_id_fkey,
  ADD CONSTRAINT analytics_views_listing_id_fkey
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;

ALTER TABLE analytics_clicks
  DROP CONSTRAINT IF EXISTS analytics_clicks_listing_id_fkey,
  ADD CONSTRAINT analytics_clicks_listing_id_fkey
    FOREIGN KEY (listing_id) REFERENCES listings(id) ON DELETE CASCADE;
