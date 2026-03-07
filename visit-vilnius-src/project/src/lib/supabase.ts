import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function getValidToken(): Promise<string> {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error || !session) throw new Error('Nesate prisijungęs');
  const expiresAt = session.expires_at ?? 0;
  if (expiresAt - Math.floor(Date.now() / 1000) < 60) {
    const { data: refreshed, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError || !refreshed.session) throw new Error('Sesija baigėsi, prisijunkite iš naujo');
    return refreshed.session.access_token;
  }
  return session.access_token;
}

export async function adminFetch(functionName: string, body: object): Promise<any> {
  const token = await getValidToken();
  const res = await fetch(
    `${supabaseUrl}/functions/v1/${functionName}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        'apikey': supabaseAnonKey,
      },
      body: JSON.stringify(body),
    }
  );
  const text = await res.text();
  let json: any = {};
  try { json = JSON.parse(text); } catch { throw new Error(`HTTP ${res.status}: ${text}`); }
  if (!res.ok || json.error) throw new Error(`HTTP ${res.status}: ${json.error || text}`);
  return json;
}

export async function adminGet(functionName: string): Promise<any> {
  const token = await getValidToken();
  const res = await fetch(
    `${supabaseUrl}/functions/v1/${functionName}`,
    {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'apikey': supabaseAnonKey,
      },
    }
  );
  const text = await res.text();
  let json: any = {};
  try { json = JSON.parse(text); } catch { throw new Error(`HTTP ${res.status}: ${text}`); }
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${json.error || text}`);
  return json;
}

export type UserRole = 'admin' | 'provider' | 'user';
export type BusinessType = 'restaurant' | 'hotel' | 'attraction' | 'shop' | 'event_organizer';
export type SubscriptionTier = 'free' | 'basic' | 'premium';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  full_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  type: BusinessType;
  name: string;
  name_en?: string;
  description?: string;
  description_en?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  latitude?: number;
  longitude?: number;
  images: string[];
  opening_hours: Record<string, string>;
  price_range?: string;
  rating: number;
  featured: boolean;
  active: boolean;
  subscription_tier: SubscriptionTier;
  subscription_expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface Event {
  id: string;
  organizer_id?: string;
  title: string;
  title_en?: string;
  description?: string;
  description_en?: string;
  category?: string;
  start_date: string;
  end_date?: string;
  location?: string;
  latitude?: number;
  longitude?: number;
  price?: string;
  ticket_url?: string;
  images: string[];
  featured: boolean;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface AnalyticsEvent {
  id: string;
  entity_type: string;
  entity_id: string;
  event_type: string;
  user_ip?: string;
  user_agent?: string;
  referrer?: string;
  metadata: Record<string, any>;
  created_at: string;
}

export interface HeroImage {
  id: string;
  season: string;
  title: string;
  title_en?: string;
  description?: string;
  description_en?: string;
  image_url: string;
  months: number[];
  active: boolean;
  order_index: number;
  created_at: string;
  updated_at: string;
}
