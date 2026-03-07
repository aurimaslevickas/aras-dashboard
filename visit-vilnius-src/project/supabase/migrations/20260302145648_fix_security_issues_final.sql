/*
  # Fix Security Issues

  1. Security Fixes
    - Fix analytics_events RLS policy to be more restrictive
    - Make update_updated_at_column function search path immutable

  2. Notes
    - spatial_ref_sys is a PostGIS system table managed by the extension - cannot be modified
    - analytics_events policy changed to only allow inserts with valid data
    - Extension in public schema warning is expected for PostGIS and not critical
*/

-- Fix analytics_events policy to be more restrictive
DROP POLICY IF EXISTS "Anyone can insert analytics" ON public.analytics_events;

-- Only allow authenticated users to insert their own analytics
CREATE POLICY "Authenticated users can insert analytics"
  ON public.analytics_events
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL 
    AND event_type IS NOT NULL
    AND entity_type IS NOT NULL
  );

-- Allow anonymous users to insert analytics but only with valid event types
CREATE POLICY "Anonymous users can insert analytics"
  ON public.analytics_events
  FOR INSERT
  TO anon
  WITH CHECK (
    event_type IS NOT NULL 
    AND event_type IN ('page_view', 'attraction_view', 'hotel_view', 'restaurant_view', 'event_view', 'search', 'click')
    AND entity_type IS NOT NULL
    AND entity_type IN ('attraction', 'hotel', 'restaurant', 'event', 'page')
  );

-- Recreate update_updated_at_column function with immutable search path
DROP FUNCTION IF EXISTS public.update_updated_at_column() CASCADE;

CREATE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate triggers for existing tables
DO $$
BEGIN
  -- Users table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
    DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
    CREATE TRIGGER update_users_updated_at
      BEFORE UPDATE ON public.users
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  -- Businesses table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'businesses') THEN
    DROP TRIGGER IF EXISTS update_businesses_updated_at ON public.businesses;
    CREATE TRIGGER update_businesses_updated_at
      BEFORE UPDATE ON public.businesses
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  -- Events table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'events') THEN
    DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
    CREATE TRIGGER update_events_updated_at
      BEFORE UPDATE ON public.events
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;

  -- Hero images table
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'hero_images') THEN
    DROP TRIGGER IF EXISTS update_hero_images_updated_at ON public.hero_images;
    CREATE TRIGGER update_hero_images_updated_at
      BEFORE UPDATE ON public.hero_images
      FOR EACH ROW
      EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;
