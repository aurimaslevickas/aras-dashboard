import { useState, useEffect } from 'react';
import { supabase } from './supabase';

interface SiteOgSettings {
  og_title: string;
  og_description: string;
  og_image: string;
}

let cachedSettings: SiteOgSettings | null = null;
let fetchPromise: Promise<SiteOgSettings> | null = null;

async function fetchOgSettings(): Promise<SiteOgSettings> {
  if (cachedSettings) return cachedSettings;
  if (fetchPromise) return fetchPromise;

  fetchPromise = supabase
    .from('site_settings')
    .select('key, value_lt')
    .in('key', ['og_title', 'og_description', 'og_image'])
    .then(({ data }) => {
      const result: SiteOgSettings = { og_title: '', og_description: '', og_image: '' };
      if (data) {
        data.forEach((row) => {
          if (row.key === 'og_title') result.og_title = row.value_lt || '';
          if (row.key === 'og_description') result.og_description = row.value_lt || '';
          if (row.key === 'og_image') result.og_image = row.value_lt || '';
        });
      }
      cachedSettings = result;
      return result;
    });

  return fetchPromise;
}

export function useSiteOgSettings() {
  const [settings, setSettings] = useState<SiteOgSettings>({
    og_title: '',
    og_description: '',
    og_image: '',
  });

  useEffect(() => {
    fetchOgSettings().then(setSettings).catch(() => {});
  }, []);

  return settings;
}
