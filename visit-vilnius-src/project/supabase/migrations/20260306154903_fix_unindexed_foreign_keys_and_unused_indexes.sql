/*
  # Fix unindexed foreign keys and remove unused indexes

  1. Add missing indexes for foreign keys that lack covering indexes
     - analytics_clicks.listing_id
     - analytics_views.article_id
     - analytics_views.listing_id
     - audit_log.user_id
     - businesses.owner_id
     - events.listing_id
     - listings.owner_id
     - listings.partner_id
     - media_library.uploaded_by
     - partners.user_id

  2. Drop unused indexes to reduce write overhead
     - idx_analytics_clicks_article_id_fk
     - idx_articles_author_id_fk
     - idx_listings_approved_by_fk
     - idx_login_history_user_id_fk
     - idx_partners_approved_by_fk
     - idx_saved_trips_user_id_fk
     - idx_subscriptions_partner_id_fk
     - idx_trip_items_listing_id_fk
     - idx_trip_items_trip_id_fk
*/

-- Add missing covering indexes for foreign keys

CREATE INDEX IF NOT EXISTS idx_analytics_clicks_listing_id
  ON public.analytics_clicks (listing_id);

CREATE INDEX IF NOT EXISTS idx_analytics_views_article_id
  ON public.analytics_views (article_id);

CREATE INDEX IF NOT EXISTS idx_analytics_views_listing_id
  ON public.analytics_views (listing_id);

CREATE INDEX IF NOT EXISTS idx_audit_log_user_id
  ON public.audit_log (user_id);

CREATE INDEX IF NOT EXISTS idx_businesses_owner_id
  ON public.businesses (owner_id);

CREATE INDEX IF NOT EXISTS idx_events_listing_id
  ON public.events (listing_id);

CREATE INDEX IF NOT EXISTS idx_listings_owner_id
  ON public.listings (owner_id);

CREATE INDEX IF NOT EXISTS idx_listings_partner_id
  ON public.listings (partner_id);

CREATE INDEX IF NOT EXISTS idx_media_library_uploaded_by
  ON public.media_library (uploaded_by);

CREATE INDEX IF NOT EXISTS idx_partners_user_id
  ON public.partners (user_id);

-- Drop unused indexes

DROP INDEX IF EXISTS public.idx_analytics_clicks_article_id_fk;
DROP INDEX IF EXISTS public.idx_articles_author_id_fk;
DROP INDEX IF EXISTS public.idx_listings_approved_by_fk;
DROP INDEX IF EXISTS public.idx_login_history_user_id_fk;
DROP INDEX IF EXISTS public.idx_partners_approved_by_fk;
DROP INDEX IF EXISTS public.idx_saved_trips_user_id_fk;
DROP INDEX IF EXISTS public.idx_subscriptions_partner_id_fk;
DROP INDEX IF EXISTS public.idx_trip_items_listing_id_fk;
DROP INDEX IF EXISTS public.idx_trip_items_trip_id_fk;
