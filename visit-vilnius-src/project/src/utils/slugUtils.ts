import { SupabaseClient } from '@supabase/supabase-js';

const LT_MAP: Record<string, string> = {
  ą: 'a', č: 'c', ę: 'e', ė: 'e', į: 'i', š: 's', ų: 'u', ū: 'u', ž: 'z',
  Ą: 'a', Č: 'c', Ę: 'e', Ė: 'e', Į: 'i', Š: 's', Ų: 'u', Ū: 'u', Ž: 'z',
};

export const generateSlug = (name: string): string =>
  name
    .split('')
    .map((c) => LT_MAP[c] ?? c)
    .join('')
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');

export async function ensureUniqueSlug(
  supabase: SupabaseClient,
  slugField: string,
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');

  const isAvailable = async (candidate: string): Promise<boolean> => {
    let query = supabase.from('listings').select('id').eq(slugField, candidate);
    if (excludeId) query = query.neq('id', excludeId);
    const { data } = await query.maybeSingle();
    return !data;
  };

  if (await isAvailable(baseSlug)) return baseSlug;

  const withYear = `${baseSlug}-${year}`;
  if (await isAvailable(withYear)) return withYear;

  const withYearMonth = `${baseSlug}-${year}-${month}`;
  if (await isAvailable(withYearMonth)) return withYearMonth;

  for (let i = 2; i <= 99; i++) {
    const candidate = `${baseSlug}-${year}-${month}-${i}`;
    if (await isAvailable(candidate)) return candidate;
  }

  return `${baseSlug}-${Date.now()}`;
}
