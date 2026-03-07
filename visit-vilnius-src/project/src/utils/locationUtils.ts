const STREET_SUFFIXES: Record<string, Record<string, string>> = {
  'g.': { en: 'St.', pl: 'ul.', de: 'Str.', ru: 'ул.', fr: 'rue' },
  'pr.': { en: 'Ave.', pl: 'al.', de: 'Allee', ru: 'просп.', fr: 'av.' },
  'al.': { en: 'Ave.', pl: 'al.', de: 'Allee', ru: 'аллея', fr: 'allée' },
  'a.': { en: 'Sq.', pl: 'pl.', de: 'Platz', ru: 'пл.', fr: 'pl.' },
  'pl.': { en: 'Sq.', pl: 'pl.', de: 'Platz', ru: 'пл.', fr: 'pl.' },
  'skv.': { en: 'Sq.', pl: 'skwer', de: 'Platz', ru: 'сквер', fr: 'square' },
};

export function localizeAddress(address: string, locale: string): string {
  if (!address || locale === 'lt') return address;

  let result = address;
  for (const [lt, translations] of Object.entries(STREET_SUFFIXES)) {
    const translated = translations[locale];
    if (translated) {
      result = result.replace(new RegExp(`\\b${lt.replace('.', '\\.')}\\b`, 'gi'), translated);
    }
  }
  return result;
}

const FREE_TRANSLATIONS: Record<string, string> = {
  lt: 'Nemokama',
  en: 'Free',
  pl: 'Bezpłatny',
  de: 'Kostenlos',
  ru: 'Бесплатно',
  fr: 'Gratuit',
};

export function localizePriceRange(price: string, locale: string): string {
  if (!price) return price;
  const lower = price.trim().toLowerCase();
  if (lower === 'nemokama' || lower === 'free' || lower === 'nemokamas' || lower === 'bezpłatny' || lower === 'kostenlos' || lower === 'бесплатно' || lower === 'gratuit') {
    return FREE_TRANSLATIONS[locale] || FREE_TRANSLATIONS['lt'];
  }
  return price;
}
