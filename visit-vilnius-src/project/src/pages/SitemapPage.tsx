import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

const SitemapPage = () => {
  const [sitemap, setSitemap] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    generateSitemap();
  }, []);

  const generateSitemap = async () => {
    try {
      const baseUrl = window.location.origin;
      const currentDate = new Date().toISOString().split('T')[0];

      const { data: listings } = await supabase
        .from('listings')
        .select('slug, slug_lt, slug_en, slug_pl, slug_de, slug_ru, category, updated_at')
        .eq('status', 'active');

      const { data: articles } = await supabase
        .from('articles')
        .select('slug, slug_lt, slug_en, slug_pl, slug_de, slug_ru, updated_at')
        .eq('status', 'published');

      const { data: events } = await supabase
        .from('events')
        .select('id, updated_at')
        .eq('status', 'active');

      const staticPages = [
        { url: '/', priority: '1.0', changefreq: 'daily' },
        { url: '/see', priority: '0.9', changefreq: 'daily' },
        { url: '/eat', priority: '0.9', changefreq: 'daily' },
        { url: '/stay', priority: '0.9', changefreq: 'daily' },
        { url: '/bar', priority: '0.9', changefreq: 'daily' },
        { url: '/shop', priority: '0.9', changefreq: 'daily' },
        { url: '/events', priority: '0.9', changefreq: 'daily' },
        { url: '/plan', priority: '0.8', changefreq: 'weekly' },
      ];

      const languages = ['lt', 'en', 'de', 'ru', 'pl'];

      const categoryMap: Record<string, string> = {
        'attraction': '/see/',
        'restaurant': '/eat/',
        'hotel': '/stay/',
        'bar': '/bar/',
        'shop': '/shop/',
      };

      let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
      xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

      staticPages.forEach(page => {
        xml += '  <url>\n';
        xml += `    <loc>${baseUrl}${page.url}</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
        xml += `    <priority>${page.priority}</priority>\n`;

        languages.forEach(lang => {
          xml += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${baseUrl}${page.url}?lang=${lang}" />\n`;
        });

        xml += '  </url>\n';
      });

      if (listings) {
        listings.forEach(listing => {
          const categoryPath = categoryMap[listing.category] || '/';
          const lastmod = listing.updated_at
            ? new Date(listing.updated_at).toISOString().split('T')[0]
            : currentDate;

          const slugByLang: Record<string, string> = {
            'lt': listing.slug_lt || listing.slug,
            'en': listing.slug_en || listing.slug,
            'pl': listing.slug_pl || listing.slug,
            'de': listing.slug_de || listing.slug,
            'ru': listing.slug_ru || listing.slug,
          };

          const defaultSlug = listing.slug_en || listing.slug_lt || listing.slug;

          xml += '  <url>\n';
          xml += `    <loc>${baseUrl}${categoryPath}${defaultSlug}</loc>\n`;
          xml += `    <lastmod>${lastmod}</lastmod>\n`;
          xml += `    <changefreq>weekly</changefreq>\n`;
          xml += `    <priority>0.8</priority>\n`;

          languages.forEach(lang => {
            const langSlug = slugByLang[lang];
            if (langSlug) {
              xml += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${baseUrl}${categoryPath}${langSlug}" />\n`;
            }
          });

          xml += '  </url>\n';
        });
      }

      if (articles) {
        articles.forEach(article => {
          const lastmod = article.updated_at
            ? new Date(article.updated_at).toISOString().split('T')[0]
            : currentDate;

          const slugByLang: Record<string, string> = {
            'lt': article.slug_lt || article.slug,
            'en': article.slug_en || article.slug,
            'pl': article.slug_pl || article.slug,
            'de': article.slug_de || article.slug,
            'ru': article.slug_ru || article.slug,
          };

          const defaultSlug = article.slug_en || article.slug_lt || article.slug;

          xml += '  <url>\n';
          xml += `    <loc>${baseUrl}/articles/${defaultSlug}</loc>\n`;
          xml += `    <lastmod>${lastmod}</lastmod>\n`;
          xml += `    <changefreq>monthly</changefreq>\n`;
          xml += `    <priority>0.7</priority>\n`;

          languages.forEach(lang => {
            const langSlug = slugByLang[lang];
            if (langSlug) {
              xml += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${baseUrl}/articles/${langSlug}" />\n`;
            }
          });

          xml += '  </url>\n';
        });
      }

      if (events) {
        events.forEach(event => {
          const lastmod = event.updated_at
            ? new Date(event.updated_at).toISOString().split('T')[0]
            : currentDate;

          xml += '  <url>\n';
          xml += `    <loc>${baseUrl}/events/${event.id}</loc>\n`;
          xml += `    <lastmod>${lastmod}</lastmod>\n`;
          xml += `    <changefreq>weekly</changefreq>\n`;
          xml += `    <priority>0.7</priority>\n`;
          xml += '  </url>\n';
        });
      }

      xml += '</urlset>';

      setSitemap(xml);
      setLoading(false);

      document.querySelector('meta[name="Content-Type"]')?.setAttribute('content', 'application/xml');
    } catch (error) {
      console.error('Error generating sitemap:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sitemap) {
      const blob = new Blob([sitemap], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);

      window.location.href = `data:application/xml;charset=utf-8,${encodeURIComponent(sitemap)}`;
    }
  }, [sitemap]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Generuojamas sitemap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <pre className="p-4 text-xs overflow-auto">
        {sitemap}
      </pre>
    </div>
  );
};

export default SitemapPage;
