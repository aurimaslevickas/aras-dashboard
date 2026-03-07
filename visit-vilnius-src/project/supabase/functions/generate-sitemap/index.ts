import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Listing {
  slug: string;
  slug_lt?: string;
  slug_en?: string;
  slug_pl?: string;
  slug_de?: string;
  slug_ru?: string;
  updated_at: string;
  category: string;
}

interface Article {
  slug: string;
  slug_lt?: string;
  slug_en?: string;
  slug_pl?: string;
  slug_de?: string;
  slug_ru?: string;
  updated_at: string;
}

interface Event {
  id: string;
  updated_at: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Missing Supabase configuration');
    }

    const baseUrl = new URL(req.url).origin.replace(/functions\/v1\/.*$/, '').replace(/\/$/, '');

    const languages = ['lt', 'en', 'de', 'ru', 'pl'];

    const listingsResponse = await fetch(`${supabaseUrl}/rest/v1/listings?status=eq.active&select=slug,slug_lt,slug_en,slug_pl,slug_de,slug_ru,updated_at,category`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    const listings: Listing[] = await listingsResponse.json();

    const articlesResponse = await fetch(`${supabaseUrl}/rest/v1/articles?status=eq.published&select=slug,slug_lt,slug_en,slug_pl,slug_de,slug_ru,updated_at`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    const articles: Article[] = await articlesResponse.json();

    const eventsResponse = await fetch(`${supabaseUrl}/rest/v1/events?status=eq.active&select=id,updated_at`, {
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
      },
    });

    const events: Event[] = await eventsResponse.json();

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

    const categoryMap: Record<string, string> = {
      'attraction': '/see/',
      'restaurant': '/eat/',
      'hotel': '/stay/',
      'bar': '/bar/',
      'shop': '/shop/',
    };

    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';

    staticPages.forEach(page => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}${page.url}</loc>\n`;
      sitemap += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
      sitemap += `    <changefreq>${page.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${page.priority}</priority>\n`;

      languages.forEach(lang => {
        sitemap += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${baseUrl}${page.url}?lang=${lang}" />\n`;
      });

      sitemap += '  </url>\n';
    });

    listings.forEach(listing => {
      const categoryPath = categoryMap[listing.category] || '/';
      const lastmod = listing.updated_at ? new Date(listing.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

      const slugByLang: Record<string, string> = {
        'lt': listing.slug_lt || listing.slug,
        'en': listing.slug_en || listing.slug,
        'pl': listing.slug_pl || listing.slug,
        'de': listing.slug_de || listing.slug,
        'ru': listing.slug_ru || listing.slug,
      };

      const defaultSlug = listing.slug_en || listing.slug_lt || listing.slug;

      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}${categoryPath}${defaultSlug}</loc>\n`;
      sitemap += `    <lastmod>${lastmod}</lastmod>\n`;
      sitemap += `    <changefreq>weekly</changefreq>\n`;
      sitemap += `    <priority>0.8</priority>\n`;

      languages.forEach(lang => {
        const langSlug = slugByLang[lang];
        if (langSlug) {
          sitemap += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${baseUrl}${categoryPath}${langSlug}" />\n`;
        }
      });

      sitemap += '  </url>\n';
    });

    articles.forEach(article => {
      const lastmod = article.updated_at ? new Date(article.updated_at).toISOString().split('T')[0] : new Date().toISOString().split('T')[0];

      const slugByLang: Record<string, string> = {
        'lt': article.slug_lt || article.slug,
        'en': article.slug_en || article.slug,
        'pl': article.slug_pl || article.slug,
        'de': article.slug_de || article.slug,
        'ru': article.slug_ru || article.slug,
      };

      const defaultSlug = article.slug_en || article.slug_lt || article.slug;

      sitemap += '  <url>\n';
      sitemap += `    <loc>${baseUrl}/articles/${defaultSlug}</loc>\n`;
      sitemap += `    <lastmod>${lastmod}</lastmod>\n`;
      sitemap += `    <changefreq>monthly</changefreq>\n`;
      sitemap += `    <priority>0.7</priority>\n`;

      languages.forEach(lang => {
        const langSlug = slugByLang[lang];
        if (langSlug) {
          sitemap += `    <xhtml:link rel="alternate" hreflang="${lang}" href="${baseUrl}/articles/${langSlug}" />\n`;
        }
      });

      sitemap += '  </url>\n';
    });

    sitemap += '</urlset>';

    return new Response(sitemap, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (error) {
    console.error('Error generating sitemap:', error);

    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});
