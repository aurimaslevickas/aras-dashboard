export type SupportedLocale = 'lt' | 'en' | 'ru' | 'pl' | 'de' | 'fr';

export const SUPPORTED_LOCALES: SupportedLocale[] = ['lt', 'en', 'ru', 'pl', 'de', 'fr'];

export type CategoryKey = 'see' | 'events' | 'eat' | 'bar' | 'stay' | 'shop';

export const categorySlugsByLocale: Record<CategoryKey, Record<SupportedLocale, string>> = {
  see: {
    lt: 'matyti',
    en: 'see',
    ru: 'dostoprimechatelnosti',
    pl: 'atrakcje',
    de: 'sehenswuerdigkeiten',
    fr: 'decouvrir',
  },
  events: {
    lt: 'renginiai',
    en: 'events',
    ru: 'meropriyatiya',
    pl: 'wydarzenia',
    de: 'veranstaltungen',
    fr: 'evenements',
  },
  eat: {
    lt: 'maitinimas',
    en: 'eat',
    ru: 'eda',
    pl: 'jedzenie',
    de: 'essen',
    fr: 'restaurants',
  },
  bar: {
    lt: 'barai',
    en: 'drinks',
    ru: 'bary',
    pl: 'bary',
    de: 'bars',
    fr: 'bars',
  },
  stay: {
    lt: 'apgyvendinimas',
    en: 'stay',
    ru: 'prozhivanie',
    pl: 'noclegi',
    de: 'unterkunft',
    fr: 'hebergement',
  },
  shop: {
    lt: 'parduotuves',
    en: 'shop',
    ru: 'magaziny',
    pl: 'sklepy',
    de: 'geschaefte',
    fr: 'boutiques',
  },
};

const slugToCategoryKey: Record<string, CategoryKey> = {};
for (const [key, locales] of Object.entries(categorySlugsByLocale)) {
  for (const slug of Object.values(locales)) {
    slugToCategoryKey[slug] = key as CategoryKey;
  }
}

export function getCategoryKeyFromSlug(slug: string): CategoryKey | null {
  return slugToCategoryKey[slug] ?? null;
}

export function normalizeLocale(lang: string): SupportedLocale {
  const base = lang.split('-')[0].toLowerCase() as SupportedLocale;
  return SUPPORTED_LOCALES.includes(base) ? base : 'en';
}

export function getCategoryUrl(locale: string, categoryKey: CategoryKey): string {
  const normalized = normalizeLocale(locale);
  const slug = categorySlugsByLocale[categoryKey][normalized];
  return `/${normalized}/${slug}`;
}

export function getLocalizedUrl(currentPath: string, newLocale: SupportedLocale): string {
  const parts = currentPath.replace(/^\//, '').split('/');
  const firstPart = parts[0];

  if (parts.length === 1 && (firstPart === '' || SUPPORTED_LOCALES.includes(firstPart as SupportedLocale))) {
    return `/${newLocale}`;
  }

  if (parts.length >= 2 && SUPPORTED_LOCALES.includes(firstPart as SupportedLocale)) {
    const currentSlug = parts[1];
    const categoryKey = getCategoryKeyFromSlug(currentSlug);
    if (categoryKey) {
      const newSlug = categorySlugsByLocale[categoryKey][newLocale];
      const rest = parts.slice(2);
      return `/${newLocale}/${newSlug}${rest.length ? '/' + rest.join('/') : ''}`;
    }
    return `/${newLocale}/${parts.slice(1).join('/')}`;
  }

  const legacyCategoryMap: Record<string, CategoryKey> = {
    see: 'see',
    events: 'events',
    eat: 'eat',
    bar: 'bar',
    stay: 'stay',
    shop: 'shop',
  };

  if (parts.length >= 1 && legacyCategoryMap[firstPart]) {
    const categoryKey = legacyCategoryMap[firstPart];
    const newSlug = categorySlugsByLocale[categoryKey][newLocale];
    const rest = parts.slice(1);
    return `/${newLocale}/${newSlug}${rest.length ? '/' + rest.join('/') : ''}`;
  }

  return currentPath;
}
