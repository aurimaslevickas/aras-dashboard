import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SUPPORTED_LOCALES, categorySlugsByLocale, type SupportedLocale } from '../lib/localeRoutes';
import { useSiteOgSettings } from '../lib/useSiteOgSettings';

interface SEOHeadProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'place';
  schema?: object;
  slugsByLocale?: Partial<Record<SupportedLocale, string>>;
}

const BASE_URL = 'https://visitvilnius.lt';

function buildHreflangUrls(pathname: string, slugsByLocale?: Partial<Record<SupportedLocale, string>>): Record<string, string> {
  const parts = pathname.replace(/^\//, '').split('/');
  const result: Record<string, string> = {};

  for (const locale of SUPPORTED_LOCALES) {
    if (parts.length === 0 || parts[0] === '') {
      result[locale] = `${BASE_URL}/${locale}`;
      continue;
    }

    if (parts.length === 1 && SUPPORTED_LOCALES.includes(parts[0] as SupportedLocale)) {
      result[locale] = `${BASE_URL}/${locale}`;
      continue;
    }

    if (parts.length >= 2 && SUPPORTED_LOCALES.includes(parts[0] as SupportedLocale)) {
      const currentSlug = parts[1];
      let categoryKey: keyof typeof categorySlugsByLocale | null = null;
      for (const [key, locales] of Object.entries(categorySlugsByLocale)) {
        if (Object.values(locales).includes(currentSlug)) {
          categoryKey = key as keyof typeof categorySlugsByLocale;
          break;
        }
      }

      if (categoryKey) {
        const newCatSlug = categorySlugsByLocale[categoryKey][locale];
        if (parts.length === 2) {
          result[locale] = `${BASE_URL}/${locale}/${newCatSlug}`;
        } else {
          const itemSlug = slugsByLocale?.[locale] || parts[2];
          result[locale] = `${BASE_URL}/${locale}/${newCatSlug}/${itemSlug}`;
        }
      } else {
        result[locale] = `${BASE_URL}/${locale}/${parts.slice(1).join('/')}`;
      }
    } else {
      result[locale] = `${BASE_URL}${pathname}`;
    }
  }

  return result;
}

const SEOHead = ({
  title,
  description,
  image,
  url,
  type = 'website',
  schema,
  slugsByLocale,
}: SEOHeadProps) => {
  const location = useLocation();
  const siteSettings = useSiteOgSettings();

  const resolvedImage = image || siteSettings.og_image || undefined;
  const resolvedTitle = title || siteSettings.og_title;
  const resolvedDescription = description || siteSettings.og_description;

  useEffect(() => {
    document.title = resolvedTitle;

    const updateMetaTag = (property: string, content: string, isName = false) => {
      const attribute = isName ? 'name' : 'property';
      let meta = document.querySelector(`meta[${attribute}="${property}"]`);
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, property);
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', content);
    };

    updateMetaTag('description', resolvedDescription, true);
    updateMetaTag('og:title', resolvedTitle);
    updateMetaTag('og:description', resolvedDescription);
    if (resolvedImage) {
      updateMetaTag('og:image', resolvedImage);
      updateMetaTag('twitter:image', resolvedImage, true);
    }
    updateMetaTag('og:type', type);
    if (url) updateMetaTag('og:url', url);
    updateMetaTag('twitter:card', resolvedImage ? 'summary_large_image' : 'summary', true);
    updateMetaTag('twitter:title', resolvedTitle, true);
    updateMetaTag('twitter:description', resolvedDescription, true);
    updateMetaTag('robots', 'index, follow', true);
    updateMetaTag('googlebot', 'index, follow', true);

    const hreflangUrls = buildHreflangUrls(location.pathname, slugsByLocale);
    const existingHreflang = document.querySelectorAll('link[rel="alternate"][hreflang]');
    existingHreflang.forEach(el => el.remove());

    for (const [lang, href] of Object.entries(hreflangUrls)) {
      const link = document.createElement('link');
      link.setAttribute('rel', 'alternate');
      link.setAttribute('hreflang', lang);
      link.setAttribute('href', href);
      document.head.appendChild(link);
    }

    const xDefaultLink = document.createElement('link');
    xDefaultLink.setAttribute('rel', 'alternate');
    xDefaultLink.setAttribute('hreflang', 'x-default');
    xDefaultLink.setAttribute('href', hreflangUrls['en'] || `${BASE_URL}/en`);
    document.head.appendChild(xDefaultLink);

    if (schema) {
      let scriptTag = document.querySelector('script[type="application/ld+json"]');
      if (!scriptTag) {
        scriptTag = document.createElement('script');
        scriptTag.setAttribute('type', 'application/ld+json');
        document.head.appendChild(scriptTag);
      }
      scriptTag.textContent = JSON.stringify(schema);
    }

    return () => {
      const scriptTag = document.querySelector('script[type="application/ld+json"]');
      if (scriptTag) scriptTag.remove();
      document.querySelectorAll('link[rel="alternate"][hreflang]').forEach(el => el.remove());
    };
  }, [resolvedTitle, resolvedDescription, resolvedImage, url, type, schema, location.pathname, slugsByLocale]);

  return null;
};

export default SEOHead;
