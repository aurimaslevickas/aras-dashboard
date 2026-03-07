/*
  # Fix unindexed foreign keys (round 2)

  Add covering indexes for foreign keys that were previously backed by
  unused indexes that got dropped. These are newly identified missing indexes.

  New indexes:
  - analytics_clicks.article_id
  - articles.author_id
  - listings.approved_by
  - login_history.user_id
  - partners.approved_by
  - saved_trips.user_id
  - subscriptions.partner_id
  - trip_items.listing_id
  - trip_items.trip_id

  Note: The "unused index" warnings for the indexes added in the previous
  migration are expected — they were just created and have had no query
  traffic yet. They should not be dropped as they cover legitimate FK
  relationships and will be used as data grows.
*/

CREATE INDEX IF NOT EXISTS idx_analytics_clicks_article_id
  ON public.analytics_clicks (article_id);

CREATE INDEX IF NOT EXISTS idx_articles_author_id
  ON public.articles (author_id);

CREATE INDEX IF NOT EXISTS idx_listings_approved_by
  ON public.listings (approved_by);

CREATE INDEX IF NOT EXISTS idx_login_history_user_id
  ON public.login_history (user_id);

CREATE INDEX IF NOT EXISTS idx_partners_approved_by
  ON public.partners (approved_by);

CREATE INDEX IF NOT EXISTS idx_saved_trips_user_id
  ON public.saved_trips (user_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_partner_id
  ON public.subscriptions (partner_id);

CREATE INDEX IF NOT EXISTS idx_trip_items_listing_id
  ON public.trip_items (listing_id);

CREATE INDEX IF NOT EXISTS idx_trip_items_trip_id
  ON public.trip_items (trip_id);
