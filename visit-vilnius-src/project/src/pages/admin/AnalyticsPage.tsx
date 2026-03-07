import React, { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Eye,
  MousePointerClick,
  Users,
  Calendar,
  Monitor,
  Smartphone,
  Tablet,
  Phone,
  Globe,
  BookOpen,
  MapPin,
  BarChart2,
  RefreshCw,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';

interface TopItem {
  id: string;
  name: string;
  category: string;
  views: number;
  clicks: number;
}

interface TopArticle {
  id: string;
  title: string;
  category: string;
  views: number;
}

interface DayData {
  date: string;
  views: number;
  clicks: number;
}

interface ClickBreakdown {
  type: string;
  count: number;
}

interface AnalyticsData {
  totalViews: number;
  totalClicks: number;
  totalArticleViews: number;
  uniqueSessions: number;
  viewsByLanguage: Record<string, number>;
  viewsByDevice: Record<string, number>;
  topListings: TopItem[];
  topArticles: TopArticle[];
  viewsTrend: DayData[];
  clickBreakdown: ClickBreakdown[];
  viewsByCategory: Record<string, number>;
}

const CATEGORY_LABELS: Record<string, string> = {
  hotel: 'Viešbučiai',
  restaurant: 'Restoranai',
  bar: 'Barai',
  attraction: 'Lankytinos vietos',
  shop: 'Parduotuvės',
  event: 'Renginiai',
};

const CLICK_TYPE_LABELS: Record<string, string> = {
  website: 'Svetainė',
  phone: 'Skambinti',
  booking: 'Rezervacija',
  directions: 'Maršrutas',
};

const LANGUAGE_LABELS: Record<string, string> = {
  lt: 'Lietuvių',
  en: 'Anglų',
  pl: 'Lenkų',
  de: 'Vokiečių',
  ru: 'Rusų',
  fr: 'Prancūzų',
};

const CATEGORY_COLORS: Record<string, string> = {
  hotel: 'bg-blue-500',
  restaurant: 'bg-orange-500',
  bar: 'bg-amber-500',
  attraction: 'bg-emerald-500',
  shop: 'bg-rose-500',
  event: 'bg-sky-500',
};

const AnalyticsPage = () => {
  const [data, setData] = useState<AnalyticsData>({
    totalViews: 0,
    totalClicks: 0,
    totalArticleViews: 0,
    uniqueSessions: 0,
    viewsByLanguage: {},
    viewsByDevice: {},
    topListings: [],
    topArticles: [],
    viewsTrend: [],
    clickBreakdown: [],
    viewsByCategory: {},
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');
  const [activeTab, setActiveTab] = useState<'overview' | 'listings' | 'articles' | 'clicks'>('overview');

  const getDateRangeStart = (range: string): string => {
    const now = new Date();
    if (range === '7d') {
      now.setDate(now.getDate() - 7);
    } else if (range === '30d') {
      now.setDate(now.getDate() - 30);
    } else if (range === '90d') {
      now.setDate(now.getDate() - 90);
    } else if (range === '1y') {
      now.setDate(now.getDate() - 365);
    } else if (range === 'week') {
      const day = now.getDay();
      const diff = now.getDate() - day + (day === 0 ? -6 : 1);
      now.setDate(diff);
      now.setHours(0, 0, 0, 0);
    } else if (range === 'month') {
      now.setDate(1);
      now.setHours(0, 0, 0, 0);
    } else if (range === 'ytd') {
      now.setMonth(0, 1);
      now.setHours(0, 0, 0, 0);
    }
    return now.toISOString();
  };

  const getDaysForRange = (range: string): number => {
    if (range === '7d' || range === 'week') return 7;
    if (range === '30d' || range === 'month') return 30;
    if (range === '90d') return 90;
    if (range === '1y' || range === 'ytd') return 365;
    return 30;
  };

  const loadAnalytics = useCallback(async () => {
    try {
      setLoading(true);

      const startISO = getDateRangeStart(dateRange);
      const daysAgo = getDaysForRange(dateRange);

      const [viewsResult, clicksResult, listingsResult, articlesResult] = await Promise.all([
        supabase
          .from('analytics_views')
          .select('id, listing_id, article_id, user_language, device_type, session_id, page_type, viewed_at')
          .gte('viewed_at', startISO),
        supabase
          .from('analytics_clicks')
          .select('id, listing_id, click_type, element_label, clicked_at')
          .gte('clicked_at', startISO),
        supabase
          .from('listings')
          .select('id, name, category'),
        supabase
          .from('articles')
          .select('id, title, category'),
      ]);

      if (viewsResult.error) console.error('[analytics] views error:', viewsResult.error);
      if (clicksResult.error) console.error('[analytics] clicks error:', clicksResult.error);
      if (listingsResult.error) console.error('[analytics] listings error:', listingsResult.error);

      const views = viewsResult.data || [];
      const clicks = clicksResult.data || [];
      const listings = listingsResult.data || [];
      const articles = articlesResult.data || [];

      const listingMap = Object.fromEntries(listings.map((l: any) => [l.id, l]));
      const articleMap = Object.fromEntries(articles.map((a: any) => [a.id, a]));

      const listingViews = views.filter((v: any) => v.listing_id);
      const articleViews = views.filter((v: any) => v.article_id);

      const uniqueSessions = new Set(views.map((v: any) => v.session_id).filter(Boolean)).size;

      const viewsByLanguage: Record<string, number> = {};
      views.forEach((v: any) => {
        if (v.user_language) {
          viewsByLanguage[v.user_language] = (viewsByLanguage[v.user_language] || 0) + 1;
        }
      });

      const viewsByDevice: Record<string, number> = {};
      views.forEach((v: any) => {
        const d = v.device_type || 'desktop';
        viewsByDevice[d] = (viewsByDevice[d] || 0) + 1;
      });

      const listingViewCounts: Record<string, number> = {};
      listingViews.forEach((v: any) => {
        listingViewCounts[v.listing_id] = (listingViewCounts[v.listing_id] || 0) + 1;
      });

      const listingClickCounts: Record<string, number> = {};
      clicks.forEach((c: any) => {
        if (c.listing_id) {
          listingClickCounts[c.listing_id] = (listingClickCounts[c.listing_id] || 0) + 1;
        }
      });

      const topListings: TopItem[] = Object.entries(listingViewCounts)
        .map(([id, views]) => ({
          id,
          name: listingMap[id]?.name || 'Nežinoma',
          category: listingMap[id]?.category || '',
          views,
          clicks: listingClickCounts[id] || 0,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      const articleViewCounts: Record<string, number> = {};
      articleViews.forEach((v: any) => {
        articleViewCounts[v.article_id] = (articleViewCounts[v.article_id] || 0) + 1;
      });

      const topArticles: TopArticle[] = Object.entries(articleViewCounts)
        .map(([id, views]) => ({
          id,
          title: articleMap[id]?.title || 'Nežinoma',
          category: articleMap[id]?.category || '',
          views,
        }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 10);

      const trendMap: Record<string, { views: number; clicks: number }> = {};
      const today = new Date();
      for (let i = daysAgo - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        trendMap[key] = { views: 0, clicks: 0 };
      }
      views.forEach((v: any) => {
        const key = v.viewed_at?.split('T')[0];
        if (key && trendMap[key]) trendMap[key].views++;
      });
      clicks.forEach((c: any) => {
        const key = c.clicked_at?.split('T')[0];
        if (key && trendMap[key]) trendMap[key].clicks++;
      });

      const viewsTrend: DayData[] = Object.entries(trendMap).map(([date, v]) => ({
        date,
        views: v.views,
        clicks: v.clicks,
      }));

      const clickTypes: Record<string, number> = {};
      clicks.forEach((c: any) => {
        const t = c.click_type || 'other';
        clickTypes[t] = (clickTypes[t] || 0) + 1;
      });
      const clickBreakdown: ClickBreakdown[] = Object.entries(clickTypes)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

      const viewsByCategory: Record<string, number> = {};
      listingViews.forEach((v: any) => {
        const cat = listingMap[v.listing_id]?.category;
        if (cat) viewsByCategory[cat] = (viewsByCategory[cat] || 0) + 1;
      });

      setData({
        totalViews: listingViews.length,
        totalClicks: clicks.length,
        totalArticleViews: articleViews.length,
        uniqueSessions,
        viewsByLanguage,
        viewsByDevice,
        topListings,
        topArticles,
        viewsTrend,
        clickBreakdown,
        viewsByCategory,
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [dateRange]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const maxTrend = Math.max(...data.viewsTrend.map(d => d.views), 1);

  const statCards = [
    {
      title: 'Listing peržiūros',
      value: data.totalViews.toLocaleString(),
      icon: Eye,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
    },
    {
      title: 'Straipsnių skaitymai',
      value: data.totalArticleViews.toLocaleString(),
      icon: BookOpen,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
    },
    {
      title: 'Paspaudimai',
      value: data.totalClicks.toLocaleString(),
      icon: MousePointerClick,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-100',
    },
    {
      title: 'Unikalūs seansai',
      value: data.uniqueSessions.toLocaleString(),
      icon: Users,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
      border: 'border-sky-100',
    },
  ];

  const tabs = [
    { key: 'overview', label: 'Apžvalga' },
    { key: 'listings', label: 'Listingai' },
    { key: 'articles', label: 'Straipsniai' },
    { key: 'clicks', label: 'Paspaudimai' },
  ] as const;

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Kraunama statistika...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Analitika</h1>
            <p className="text-gray-500 text-sm mt-0.5">Lankytojų ir turinio statistika</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={loadAnalytics}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Atnaujinti"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 flex-wrap">
              {([
                { value: 'week', label: 'Ši savaitė' },
                { value: 'month', label: 'Šis mėnuo' },
                { value: 'ytd', label: 'Nuo metų pradžios' },
                { value: '7d', label: '7 d.' },
                { value: '30d', label: '30 d.' },
                { value: '90d', label: '90 d.' },
                { value: '1y', label: '1 metai' },
              ]).map(range => (
                <button
                  key={range.value}
                  onClick={() => setDateRange(range.value)}
                  className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    dateRange === range.value
                      ? 'bg-blue-600 text-white'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {range.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.title} className={`bg-white rounded-xl border ${card.border} p-5 shadow-sm`}>
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded-lg ${card.bg}`}>
                    <Icon className={`w-5 h-5 ${card.color}`} />
                  </div>
                </div>
                <p className="text-sm text-gray-500 mb-1">{card.title}</p>
                <p className="text-3xl font-bold text-gray-900">{card.value}</p>
              </div>
            );
          })}
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex gap-6">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-6">
                <BarChart2 className="w-5 h-5 text-gray-400" />
                <h2 className="text-base font-semibold text-gray-900">Peržiūros per laikotarpį</h2>
              </div>
              {data.viewsTrend.every(d => d.views === 0 && d.clicks === 0) ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Eye className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">Dar nėra duomenų šiam laikotarpiui</p>
                  <p className="text-xs mt-1">Duomenys pradės kauptis kai lankytojai apsilankys</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {data.viewsTrend.filter((_, i) => {
                    if (dateRange === '7d') return true;
                    if (dateRange === '30d') return true;
                    if (dateRange === '90d') return i % 3 === 0;
                    return i % 7 === 0;
                  }).map((day) => (
                    <div key={day.date} className="flex items-center gap-3 group">
                      <span className="text-xs text-gray-400 w-20 shrink-0 text-right">
                        {new Date(day.date + 'T12:00:00').toLocaleDateString('lt-LT', {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                      <div className="flex-1 flex items-center gap-1">
                        <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                            style={{ width: `${Math.max((day.views / maxTrend) * 100, day.views > 0 ? 4 : 0)}%` }}
                          >
                            {day.views > 0 && (
                              <span className="text-[10px] text-white font-semibold leading-none">{day.views}</span>
                            )}
                          </div>
                        </div>
                        {day.clicks > 0 && (
                          <span className="text-xs text-orange-500 font-medium w-10 shrink-0">
                            {day.clicks} sp.
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Globe className="w-4 h-4 text-gray-400" />
                  <h2 className="text-base font-semibold text-gray-900">Kalba</h2>
                </div>
                {Object.keys(data.viewsByLanguage).length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">Nėra duomenų</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(data.viewsByLanguage)
                      .sort(([, a], [, b]) => b - a)
                      .map(([lang, count]) => {
                        const total = data.totalViews + data.totalArticleViews;
                        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                        return (
                          <div key={lang}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-700">{LANGUAGE_LABELS[lang] || lang.toUpperCase()}</span>
                              <span className="text-sm font-semibold text-gray-900">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Monitor className="w-4 h-4 text-gray-400" />
                  <h2 className="text-base font-semibold text-gray-900">Įrenginys</h2>
                </div>
                {Object.keys(data.viewsByDevice).length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">Nėra duomenų</p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(data.viewsByDevice)
                      .sort(([, a], [, b]) => b - a)
                      .map(([device, count]) => {
                        const total = data.totalViews + data.totalArticleViews;
                        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                        const DeviceIcon = device === 'mobile' ? Smartphone : device === 'tablet' ? Tablet : Monitor;
                        return (
                          <div key={device} className="flex items-center gap-3">
                            <DeviceIcon className="w-5 h-5 text-gray-400 shrink-0" />
                            <div className="flex-1">
                              <div className="flex justify-between mb-1">
                                <span className="text-sm text-gray-700 capitalize">{device === 'mobile' ? 'Telefonas' : device === 'tablet' ? 'Planšetė' : 'Kompiuteris'}</span>
                                <span className="text-sm font-semibold text-gray-900">{pct}%</span>
                              </div>
                              <div className="w-full bg-gray-100 rounded-full h-1.5">
                                <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <h2 className="text-base font-semibold text-gray-900">Kategorijos</h2>
                </div>
                {Object.keys(data.viewsByCategory).length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">Nėra duomenų</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(data.viewsByCategory)
                      .sort(([, a], [, b]) => b - a)
                      .map(([cat, count]) => {
                        const pct = data.totalViews > 0 ? Math.round((count / data.totalViews) * 100) : 0;
                        return (
                          <div key={cat}>
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-700">{CATEGORY_LABELS[cat] || cat}</span>
                              <span className="text-sm font-semibold text-gray-900">{count}</span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div className={`${CATEGORY_COLORS[cat] || 'bg-gray-400'} h-1.5 rounded-full`} style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Populiariausi listingai</h2>
              <p className="text-sm text-gray-500 mt-0.5">Rikiuota pagal peržiūrų skaičių</p>
            </div>
            {data.topListings.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <Eye className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">Dar nėra peržiūrų duomenų</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {data.topListings.map((listing, index) => (
                  <div key={listing.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                    <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${
                      index === 0 ? 'bg-amber-100 text-amber-700' :
                      index === 1 ? 'bg-gray-200 text-gray-600' :
                      index === 2 ? 'bg-orange-100 text-orange-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{listing.name}</p>
                      <span className={`inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full text-white ${CATEGORY_COLORS[listing.category] || 'bg-gray-400'}`}>
                        {CATEGORY_LABELS[listing.category] || listing.category}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 shrink-0">
                      <div className="text-center">
                        <p className="text-lg font-bold text-gray-900">{listing.views}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1"><Eye className="w-3 h-3" /> Peržiūros</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-orange-600">{listing.clicks}</p>
                        <p className="text-xs text-gray-400 flex items-center gap-1"><MousePointerClick className="w-3 h-3" /> Paspaudimai</p>
                      </div>
                      {listing.views > 0 && (
                        <div className="text-center">
                          <p className="text-lg font-bold text-emerald-600">
                            {((listing.clicks / listing.views) * 100).toFixed(1)}%
                          </p>
                          <p className="text-xs text-gray-400 flex items-center gap-1"><TrendingUp className="w-3 h-3" /> CTR</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'articles' && (
          <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
            <div className="p-6 border-b border-gray-100">
              <h2 className="text-base font-semibold text-gray-900">Populiariausi straipsniai</h2>
              <p className="text-sm text-gray-500 mt-0.5">Rikiuota pagal skaitymų skaičių</p>
            </div>
            {data.topArticles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <BookOpen className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">Dar nėra straipsnių skaitymų duomenų</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {data.topArticles.map((article, index) => (
                  <div key={article.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                    <span className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${
                      index === 0 ? 'bg-amber-100 text-amber-700' :
                      index === 1 ? 'bg-gray-200 text-gray-600' :
                      index === 2 ? 'bg-orange-100 text-orange-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 truncate">{article.title}</p>
                      <span className="inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">
                        {CATEGORY_LABELS[article.category] || article.category}
                      </span>
                    </div>
                    <div className="text-center shrink-0">
                      <p className="text-lg font-bold text-gray-900">{article.views}</p>
                      <p className="text-xs text-gray-400 flex items-center gap-1"><BookOpen className="w-3 h-3" /> Skaitymai</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'clicks' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
              <div className="flex items-center gap-2 mb-5">
                <MousePointerClick className="w-4 h-4 text-gray-400" />
                <h2 className="text-base font-semibold text-gray-900">Paspaudimų tipai</h2>
              </div>
              {data.clickBreakdown.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <MousePointerClick className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">Dar nėra paspaudimų duomenų</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {data.clickBreakdown.map(({ type, count }) => {
                    const total = data.totalClicks;
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    const ClickIcon = type === 'phone' ? Phone : type === 'website' ? Globe : type === 'booking' ? Calendar : MapPin;
                    return (
                      <div key={type} className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                        <div className="flex items-center gap-2 mb-3">
                          <ClickIcon className="w-5 h-5 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">{CLICK_TYPE_LABELS[type] || type}</span>
                        </div>
                        <p className="text-3xl font-bold text-gray-900 mb-1">{count}</p>
                        <p className="text-sm text-gray-400">{pct}% visų paspaudimų</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm">
              <div className="p-6 border-b border-gray-100">
                <h2 className="text-base font-semibold text-gray-900">Listingai su daugiausia paspaudimų</h2>
              </div>
              {data.topListings.filter(l => l.clicks > 0).length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                  <MousePointerClick className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">Nėra paspaudimų duomenų</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {data.topListings
                    .filter(l => l.clicks > 0)
                    .sort((a, b) => b.clicks - a.clicks)
                    .slice(0, 10)
                    .map((listing, index) => (
                      <div key={listing.id} className="flex items-center gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                        <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-xs font-bold text-gray-500 shrink-0">
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 truncate">{listing.name}</p>
                          <span className={`inline-block mt-0.5 text-xs px-2 py-0.5 rounded-full text-white ${CATEGORY_COLORS[listing.category] || 'bg-gray-400'}`}>
                            {CATEGORY_LABELS[listing.category] || listing.category}
                          </span>
                        </div>
                        <p className="text-lg font-bold text-orange-600 shrink-0">{listing.clicks} paspaud.</p>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AnalyticsPage;
