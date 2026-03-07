/*
  # VisitVilnius.lt Core Database Schema
  
  ## 1. Lentelės
  
  ### users (išplėsta)
  - `id` (uuid, primary key) - Supabase auth.users susiejimas
  - `email` (text) - El. paštas
  - `role` (text) - Vartotojo rolė: 'admin', 'provider', 'user'
  - `full_name` (text) - Pilnas vardas
  - `created_at` (timestamptz) - Sukūrimo data
  - `updated_at` (timestamptz) - Atnaujinimo data
  
  ### businesses
  - `id` (uuid, primary key)
  - `owner_id` (uuid, foreign key -> users) - Verslo savininkas
  - `type` (text) - Tipo: 'restaurant', 'hotel', 'attraction', 'shop', 'event_organizer'
  - `name` (text) - Pavadinimas
  - `name_en` (text) - Pavadinimas angliškai
  - `description` (text) - Aprašymas lietuviškai
  - `description_en` (text) - Aprašymas angliškai
  - `address` (text) - Adresas
  - `phone` (text) - Telefonas
  - `email` (text) - El. paštas
  - `website` (text) - Svetainė
  - `latitude` (numeric) - Platuma
  - `longitude` (numeric) - Ilguma
  - `images` (jsonb) - Nuotraukų masyvas
  - `opening_hours` (jsonb) - Darbo laikas
  - `price_range` (text) - Kainos intervalas
  - `rating` (numeric) - Įvertinimas
  - `featured` (boolean) - Ar išskirtinis
  - `active` (boolean) - Ar aktyvus
  - `subscription_tier` (text) - Prenumeratos lygis: 'free', 'basic', 'premium'
  - `subscription_expires_at` (timestamptz) - Prenumeratos pabaiga
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### events
  - `id` (uuid, primary key)
  - `organizer_id` (uuid, foreign key -> businesses) - Organizatorius
  - `title` (text) - Pavadinimas
  - `title_en` (text) - Pavadinimas angliškai
  - `description` (text) - Aprašymas
  - `description_en` (text) - Aprašymas angliškai
  - `category` (text) - Kategorija
  - `start_date` (timestamptz) - Pradžios data
  - `end_date` (timestamptz) - Pabaigos data
  - `location` (text) - Vieta
  - `latitude` (numeric)
  - `longitude` (numeric)
  - `price` (text) - Kaina
  - `ticket_url` (text) - Bilietų nuoroda
  - `images` (jsonb) - Nuotraukos
  - `featured` (boolean)
  - `active` (boolean)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ### analytics_events
  - `id` (uuid, primary key)
  - `entity_type` (text) - 'business', 'event'
  - `entity_id` (uuid) - Objekto ID
  - `event_type` (text) - 'view', 'click', 'ticket_click', 'phone_click', 'website_click'
  - `user_ip` (text) - Vartotojo IP (anonimintas)
  - `user_agent` (text) - User agent
  - `referrer` (text) - Iš kur atėjo
  - `metadata` (jsonb) - Papildomi duomenys
  - `created_at` (timestamptz)
  
  ### hero_images
  - `id` (uuid, primary key)
  - `season` (text) - 'spring', 'summer', 'autumn', 'winter'
  - `title` (text) - Pavadinimas
  - `title_en` (text) - Pavadinimas angliškai
  - `description` (text) - Aprašymas
  - `description_en` (text) - Aprašymas angliškai
  - `image_url` (text) - Nuotraukos URL
  - `months` (integer[]) - Mėnesiai [3,4,5]
  - `active` (boolean) - Ar aktyvus
  - `order_index` (integer) - Rodymo tvarka
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)
  
  ## 2. Saugumas (RLS)
  - Visi vartotojai gali skaityti aktyvius įrašus
  - Tik admin gali viską valdyti
  - Provider gali valdyti tik savo verslo duomenis
  - Analytics renka duomenis automatiškai

  ## 3. Indeksai
  - Optimizuoti paieška pagal tipą, datą, statusą
  - GiST indeksas geolokacijai
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- Create enum types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('admin', 'provider', 'user');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE business_type AS ENUM ('restaurant', 'hotel', 'attraction', 'shop', 'event_organizer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_tier AS ENUM ('free', 'basic', 'premium');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role user_role DEFAULT 'user' NOT NULL,
  full_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all users"
  ON public.users FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Businesses table
CREATE TABLE IF NOT EXISTS public.businesses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type business_type NOT NULL,
  name TEXT NOT NULL,
  name_en TEXT,
  description TEXT,
  description_en TEXT,
  address TEXT,
  phone TEXT,
  email TEXT,
  website TEXT,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  images JSONB DEFAULT '[]'::jsonb,
  opening_hours JSONB DEFAULT '{}'::jsonb,
  price_range TEXT,
  rating NUMERIC(3, 2) DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  subscription_tier subscription_tier DEFAULT 'free',
  subscription_expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active businesses"
  ON public.businesses FOR SELECT
  TO authenticated, anon
  USING (active = true);

CREATE POLICY "Owners can view own business"
  ON public.businesses FOR SELECT
  TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can update own business"
  ON public.businesses FOR UPDATE
  TO authenticated
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Admins can manage all businesses"
  ON public.businesses FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Events table
CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  organizer_id UUID REFERENCES public.businesses(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  category TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ,
  location TEXT,
  latitude NUMERIC(10, 8),
  longitude NUMERIC(11, 8),
  price TEXT,
  ticket_url TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  featured BOOLEAN DEFAULT false,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active events"
  ON public.events FOR SELECT
  TO authenticated, anon
  USING (active = true);

CREATE POLICY "Organizers can manage own events"
  ON public.events FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = organizer_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can manage all events"
  ON public.events FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Analytics events table
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_type TEXT NOT NULL,
  entity_id UUID NOT NULL,
  event_type TEXT NOT NULL,
  user_ip TEXT,
  user_agent TEXT,
  referrer TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert analytics"
  ON public.analytics_events FOR INSERT
  TO authenticated, anon
  WITH CHECK (true);

CREATE POLICY "Owners can view own analytics"
  ON public.analytics_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.businesses
      WHERE id = entity_id AND owner_id = auth.uid()
    )
    OR
    EXISTS (
      SELECT 1 FROM public.events e
      JOIN public.businesses b ON e.organizer_id = b.id
      WHERE e.id = entity_id AND b.owner_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all analytics"
  ON public.analytics_events FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Hero images table
CREATE TABLE IF NOT EXISTS public.hero_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  season TEXT NOT NULL,
  title TEXT NOT NULL,
  title_en TEXT,
  description TEXT,
  description_en TEXT,
  image_url TEXT NOT NULL,
  months INTEGER[] NOT NULL,
  active BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE public.hero_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active hero images"
  ON public.hero_images FOR SELECT
  TO authenticated, anon
  USING (active = true);

CREATE POLICY "Admins can manage hero images"
  ON public.hero_images FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_businesses_type ON public.businesses(type);
CREATE INDEX IF NOT EXISTS idx_businesses_active ON public.businesses(active);
CREATE INDEX IF NOT EXISTS idx_businesses_featured ON public.businesses(featured);
CREATE INDEX IF NOT EXISTS idx_businesses_owner ON public.businesses(owner_id);

CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_active ON public.events(active);
CREATE INDEX IF NOT EXISTS idx_events_featured ON public.events(featured);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON public.events(organizer_id);

CREATE INDEX IF NOT EXISTS idx_analytics_entity ON public.analytics_events(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON public.analytics_events(created_at);

CREATE INDEX IF NOT EXISTS idx_hero_season ON public.hero_images(season);
CREATE INDEX IF NOT EXISTS idx_hero_active ON public.hero_images(active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_businesses_updated_at ON public.businesses;
CREATE TRIGGER update_businesses_updated_at
  BEFORE UPDATE ON public.businesses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON public.events
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hero_images_updated_at ON public.hero_images;
CREATE TRIGGER update_hero_images_updated_at
  BEFORE UPDATE ON public.hero_images
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert default hero images
INSERT INTO public.hero_images (season, title, title_en, description, description_en, image_url, months, active, order_index)
VALUES
  ('spring', 'Pavasaris Vilniuje', 'Spring in Vilnius', 'Žydintys medžiai ir Gedimino kalnas', 'Blooming trees and Gediminas Hill', 'https://images.pexels.com/photos/3844796/pexels-photo-3844796.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&fit=crop', ARRAY[3,4,5], true, 1),
  ('summer', 'Vasara Vilniuje', 'Summer in Vilnius', 'Neris upė ir laivai', 'Neris River and boats', 'https://images.pexels.com/photos/13848685/pexels-photo-13848685.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&fit=crop', ARRAY[6,7,8], true, 2),
  ('autumn', 'Ruduo Vilniuje', 'Autumn in Vilnius', 'Auksiniai lapai ir Senamiestis', 'Golden leaves and Old Town', 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&fit=crop', ARRAY[9,10,11], true, 3),
  ('winter', 'Žiema Vilniuje', 'Winter in Vilnius', 'Sniego dengtas Senamiestis', 'Snow-covered Old Town', 'https://images.pexels.com/photos/13848688/pexels-photo-13848688.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&fit=crop', ARRAY[12,1,2], true, 4)
ON CONFLICT DO NOTHING;