/*
  # Drop Unused Indexes

  ## Summary
  Removes 16 unused indexes that have never been used by the query planner.
  Unused indexes consume storage and slow down write operations (INSERT/UPDATE/DELETE)
  without providing any query performance benefit.

  ## Dropped Indexes
  - analytics_clicks: idx_analytics_clicks_article_id, idx_analytics_clicks_listing_id
  - articles: idx_articles_author_id
  - listings: idx_listings_approved_by, idx_listings_owner_id, idx_listings_partner_id
  - login_history: idx_login_history_user_id
  - partners: idx_partners_approved_by, idx_partners_user_id
  - saved_trips: idx_saved_trips_user_id
  - subscriptions: idx_subscriptions_partner_id
  - trip_items: idx_trip_items_trip_id
  - audit_log: idx_audit_log_user_id
  - businesses: idx_businesses_owner_id
  - events: idx_events_listing_id
  - media_library: idx_media_library_uploaded_by
*/

DROP INDEX IF EXISTS public.idx_analytics_clicks_article_id;
DROP INDEX IF EXISTS public.idx_analytics_clicks_listing_id;
DROP INDEX IF EXISTS public.idx_articles_author_id;
DROP INDEX IF EXISTS public.idx_listings_approved_by;
DROP INDEX IF EXISTS public.idx_listings_owner_id;
DROP INDEX IF EXISTS public.idx_listings_partner_id;
DROP INDEX IF EXISTS public.idx_login_history_user_id;
DROP INDEX IF EXISTS public.idx_partners_approved_by;
DROP INDEX IF EXISTS public.idx_partners_user_id;
DROP INDEX IF EXISTS public.idx_saved_trips_user_id;
DROP INDEX IF EXISTS public.idx_subscriptions_partner_id;
DROP INDEX IF EXISTS public.idx_trip_items_trip_id;
DROP INDEX IF EXISTS public.idx_audit_log_user_id;
DROP INDEX IF EXISTS public.idx_businesses_owner_id;
DROP INDEX IF EXISTS public.idx_events_listing_id;
DROP INDEX IF EXISTS public.idx_media_library_uploaded_by;
