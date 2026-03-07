import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Eye,
  Calendar,
  AlertCircle,
  CheckCircle,
  Building,
  BookOpen,
  ArrowRight,
  Send,
  Hotel,
  UtensilsCrossed,
  Wine,
  ShoppingBag,
  MapPin,
  DollarSign,
  TrendingUp,
  MousePointerClick,
  Users,
  Monitor,
  Smartphone,
  Tablet,
  Phone,
  Globe,
  BarChart2,
  RefreshCw,
  Search,
  ExternalLink,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';

interface Stats {
  todayViews: number;
  activeEvents: number;
  activePartners: number;
  pendingApprovals: number;
  pendingEvents: number;
  pendingListings: number;
  totalListings: number;
  totalArticles: number;
  byCategory: Record<string, number>;
}

interface Notification {
  id: string;
  type: 'warning' | 'info' | 'success';
  message: string;
  count?: number;
  action?: string;
  link?: string;
}

interface RevenueStats {
  thisMonth: number;
  thisYear: number;
  upcomingRenewals: number;
}

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

const CATEGORY_CONFIG = [
  { key: 'hotel', label: 'Nakvynė', icon: Hotel, color: 'bg-blue-50', iconColor: 'text-blue-600', link: '/admin/hotels' },
  { key: 'restaurant', label: 'Restoranai', icon: UtensilsCrossed, color: 'bg-orange-50', iconColor: 'text-orange-600', link: '/admin/restaurants' },
  { key: 'bar', label: 'Barai', icon: Wine, color: 'bg-rose-50', iconColor: 'text-rose-600', link: '/admin/bars' },
  { key: 'shop', label: 'Parduotuvės', icon: ShoppingBag, color: 'bg-amber-50', iconColor: 'text-amber-600', link: '/admin/shops' },
  { key: 'attraction', label: 'Lankytinos vietos', icon: MapPin, color: 'bg-green-50', iconColor: 'text-green-600', link: '/admin/attractions' },
];

const CATEGORY_LABELS: Record<string, string> = {
  hotel: 'Viešbučiai',
  restaurant: 'Restoranai',
  bar: 'Barai',
  attraction: 'Lankytinos vietos',
  shop: 'Parduotuvės',
  event: 'Renginiai',
};

const CATEGORY_COLORS: Record<string, string> = {
  hotel: 'bg-blue-500',
  restaurant: 'bg-orange-500',
  bar: 'bg-amber-500',
  attraction: 'bg-emerald-500',
  shop: 'bg-rose-500',
  event: 'bg-sky-500',
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

const DATE_RANGES = [
  { value: 'week', label: 'Ši savaitė' },
  { value: 'month', label: 'Šis mėnuo' },
  { value: 'ytd', label: 'Nuo m. pr.' },
  { value: '7d', label: '7 d.' },
  { value: '30d', label: '30 d.' },
  { value: '90d', label: '90 d.' },
  { value: '1y', label: '1 m.' },
];

const getDateRangeStart = (range: string): string => {
  const now = new Date();
  if (range === '7d') now.setDate(now.getDate() - 7);
  else if (range === '30d') now.setDate(now.getDate() - 30);
  else if (range === '90d') now.setDate(now.getDate() - 90);
  else if (range === '1y') now.setDate(now.getDate() - 365);
  else if (range === 'week') {
    const day = now.getDay();
    now.setDate(now.getDate() - day + (day === 0 ? -6 : 1));
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
  return 365;
};

const OverviewPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [activeTab, setActiveTab] = useState<'dashboard' | 'listings' | 'articles' | 'overview' | 'clicks'>('dashboard');
  const [dateRange, setDateRange] = useState('30d');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [listingSearch, setListingSearch] = useState('');

  const [stats, setStats] = useState<Stats>({
    todayViews: 0,
    activeEvents: 0,
    activePartners: 0,
    pendingApprovals: 0,
    pendingEvents: 0,
    pendingListings: 0,
    totalListings: 0,
    totalArticles: 0,
    byCategory: {},
  });
  const [revenueStats, setRevenueStats] = useState<RevenueStats>({ thisMonth: 0, thisYear: 0, upcomingRenewals: 0 });
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dashLoading, setDashLoading] = useState(true);

  const [analytics, setAnalytics] = useState<AnalyticsData>({
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

  useEffect(() => {
    loadDashboardData();
  }, []);

  useEffect(() => {
    if (activeTab !== 'dashboard') {
      loadAnalytics();
    }
  }, [activeTab, dateRange]);

  const loadDashboardData = async () => {
    try {
      setDashLoading(true);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const thisMonth = new Date().toISOString().slice(0, 7);
      const thisYear = new Date().getFullYear().toString();
      const in30days = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const todayStr = new Date().toISOString().split('T')[0];

      const queries = [
        supabase.from('analytics_views').select('id', { count: 'exact' }).gte('viewed_at', today.toISOString()),
        supabase.from('listings').select('id', { count: 'exact' }).eq('category', 'event').eq('status', 'active'),
        supabase.from('partners').select('id', { count: 'exact' }).eq('status', 'approved'),
        supabase.from('partners').select('id, business_name, business_type, created_at', { count: 'exact' }).eq('status', 'pending'),
        supabase.from('listings').select('id', { count: 'exact' }).eq('category', 'event').eq('status', 'pending'),
        supabase.from('listings').select('id', { count: 'exact' }).neq('category', 'event').eq('status', 'pending'),
        supabase.from('listings').select('id', { count: 'exact' }).eq('status', 'active'),
        supabase.from('articles').select('id', { count: 'exact' }).eq('published', true),
        supabase.from('listings').select('id, name, event_end_date').eq('category', 'event').eq('status', 'active').not('event_end_date', 'is', null).lte('event_end_date', new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('listings').select('id, category').eq('status', 'active').neq('category', 'event'),
      ];

      const revenueQueries = isAdmin ? [
        supabase.from('revenue_payments').select('amount, payment_date').gte('payment_date', `${thisMonth}-01`).lte('payment_date', `${thisMonth}-31`),
        supabase.from('revenue_payments').select('amount, payment_date').gte('payment_date', `${thisYear}-01-01`).lte('payment_date', `${thisYear}-12-31`),
        supabase.from('revenue_payments').select('id', { count: 'exact' }).gte('valid_until', todayStr).lte('valid_until', in30days),
      ] : [];

      const results = await Promise.all([...queries, ...revenueQueries]);

      const [
        viewsResult, eventsResult, partnersResult, pendingPartnersResult,
        pendingEventsResult, pendingListingsResult, listingsResult, articlesResult,
        endingEventsResult, categoryListingsResult,
      ] = results;

      const byCategory: Record<string, number> = {};
      (categoryListingsResult.data || []).forEach((l: any) => {
        byCategory[l.category] = (byCategory[l.category] || 0) + 1;
      });

      setStats({
        todayViews: viewsResult.count || 0,
        activeEvents: eventsResult.count || 0,
        activePartners: partnersResult.count || 0,
        pendingApprovals: pendingPartnersResult.count || 0,
        pendingEvents: pendingEventsResult.count || 0,
        pendingListings: pendingListingsResult.count || 0,
        totalListings: listingsResult.count || 0,
        totalArticles: articlesResult.count || 0,
        byCategory,
      });

      if (isAdmin && results.length > 10) {
        const [monthPayments, yearPayments, renewalsResult] = results.slice(10);
        const monthTotal = (monthPayments.data || []).reduce((s: number, p: any) => s + Number(p.amount), 0);
        const yearTotal = (yearPayments.data || []).reduce((s: number, p: any) => s + Number(p.amount), 0);
        setRevenueStats({ thisMonth: monthTotal, thisYear: yearTotal, upcomingRenewals: renewalsResult.count || 0 });
      }

      const newNotifications: Notification[] = [];
      if (pendingListingsResult.count! > 0) newNotifications.push({ id: 'pending-listings', type: 'warning', message: 'Nauji skelbimai laukia patvirtinimo', count: pendingListingsResult.count!, action: 'Peržiūrėti', link: '/admin/listings?status=pending' });
      if (pendingEventsResult.count! > 0) newNotifications.push({ id: 'pending-events', type: 'warning', message: 'Renginiai laukia patvirtinimo', count: pendingEventsResult.count!, action: 'Peržiūrėti', link: '/admin/events?status=pending' });
      setNotifications(newNotifications);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setDashLoading(false);
    }
  };

  const loadAnalytics = useCallback(async () => {
    try {
      setAnalyticsLoading(true);
      const startISO = getDateRangeStart(dateRange);
      const daysAgo = getDaysForRange(dateRange);

      const [viewsResult, clicksResult, listingsResult, articlesResult] = await Promise.all([
        supabase.from('analytics_views').select('id, listing_id, article_id, user_language, device_type, session_id, page_type, viewed_at').gte('viewed_at', startISO),
        supabase.from('analytics_clicks').select('id, listing_id, click_type, element_label, clicked_at').gte('clicked_at', startISO),
        supabase.from('listings').select('id, name, category'),
        supabase.from('articles').select('id, title, category'),
      ]);

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
      views.forEach((v: any) => { if (v.user_language) viewsByLanguage[v.user_language] = (viewsByLanguage[v.user_language] || 0) + 1; });

      const viewsByDevice: Record<string, number> = {};
      views.forEach((v: any) => { const d = v.device_type || 'desktop'; viewsByDevice[d] = (viewsByDevice[d] || 0) + 1; });

      const listingViewCounts: Record<string, number> = {};
      listingViews.forEach((v: any) => { listingViewCounts[v.listing_id] = (listingViewCounts[v.listing_id] || 0) + 1; });

      const listingClickCounts: Record<string, number> = {};
      clicks.forEach((c: any) => { if (c.listing_id) listingClickCounts[c.listing_id] = (listingClickCounts[c.listing_id] || 0) + 1; });

      const topListings: TopItem[] = Object.entries(listingViewCounts)
        .map(([id, views]) => ({ id, name: listingMap[id]?.name || 'Nežinoma', category: listingMap[id]?.category || '', views, clicks: listingClickCounts[id] || 0 }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 20);

      const articleViewCounts: Record<string, number> = {};
      articleViews.forEach((v: any) => { articleViewCounts[v.article_id] = (articleViewCounts[v.article_id] || 0) + 1; });

      const topArticles: TopArticle[] = Object.entries(articleViewCounts)
        .map(([id, views]) => ({ id, title: articleMap[id]?.title || 'Nežinoma', category: articleMap[id]?.category || '', views }))
        .sort((a, b) => b.views - a.views)
        .slice(0, 20);

      const trendMap: Record<string, { views: number; clicks: number }> = {};
      const todayDate = new Date();
      for (let i = daysAgo - 1; i >= 0; i--) {
        const d = new Date(todayDate);
        d.setDate(d.getDate() - i);
        trendMap[d.toISOString().split('T')[0]] = { views: 0, clicks: 0 };
      }
      views.forEach((v: any) => { const k = v.viewed_at?.split('T')[0]; if (k && trendMap[k]) trendMap[k].views++; });
      clicks.forEach((c: any) => { const k = c.clicked_at?.split('T')[0]; if (k && trendMap[k]) trendMap[k].clicks++; });
      const viewsTrend: DayData[] = Object.entries(trendMap).map(([date, v]) => ({ date, views: v.views, clicks: v.clicks }));

      const clickTypes: Record<string, number> = {};
      clicks.forEach((c: any) => { const t = c.click_type || 'other'; clickTypes[t] = (clickTypes[t] || 0) + 1; });
      const clickBreakdown: ClickBreakdown[] = Object.entries(clickTypes).map(([type, count]) => ({ type, count })).sort((a, b) => b.count - a.count);

      const viewsByCategory: Record<string, number> = {};
      listingViews.forEach((v: any) => { const cat = listingMap[v.listing_id]?.category; if (cat) viewsByCategory[cat] = (viewsByCategory[cat] || 0) + 1; });

      setAnalytics({ totalViews: listingViews.length, totalClicks: clicks.length, totalArticleViews: articleViews.length, uniqueSessions, viewsByLanguage, viewsByDevice, topListings, topArticles, viewsTrend, clickBreakdown, viewsByCategory });
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setAnalyticsLoading(false);
    }
  }, [dateRange]);

  const fmt = (n: number) => n.toLocaleString('lt-LT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const getNotificationBg = (type: string) => {
    if (type === 'warning') return 'bg-orange-50 border-orange-200';
    if (type === 'success') return 'bg-green-50 border-green-200';
    return 'bg-blue-50 border-blue-200';
  };

  const maxTrend = Math.max(...analytics.viewsTrend.map(d => d.views), 1);

  const filteredListings = analytics.topListings.filter(l =>
    !listingSearch || l.name.toLowerCase().includes(listingSearch.toLowerCase()) || (CATEGORY_LABELS[l.category] || '').toLowerCase().includes(listingSearch.toLowerCase())
  );

  const tabs = [
    { key: 'dashboard', label: 'Apžvalga' },
    { key: 'overview', label: 'Peržiūros' },
    { key: 'listings', label: 'Listingai' },
    { key: 'articles', label: 'Straipsniai' },
    { key: 'clicks', label: 'Paspaudimai' },
  ] as const;

  if (dashLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Apžvalga</h1>
            <p className="text-gray-500 text-sm mt-0.5">Sveiki sugrįžę į admin sistemą</p>
          </div>
          {activeTab !== 'dashboard' && (
            <div className="flex items-center gap-2">
              <button
                onClick={loadAnalytics}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                title="Atnaujinti"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-0.5 bg-white border border-gray-200 rounded-lg p-1 flex-wrap">
                {DATE_RANGES.map(range => (
                  <button
                    key={range.value}
                    onClick={() => setDateRange(range.value)}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${dateRange === range.value ? 'bg-blue-600 text-white' : 'text-gray-600 hover:text-gray-900'}`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="border-b border-gray-200">
          <nav className="flex gap-5">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2.5 text-sm font-medium border-b-2 transition-colors ${activeTab === tab.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {activeTab === 'dashboard' && (
          <div className="space-y-5">
            {notifications.length > 0 && (
              <div className="space-y-2">
                {notifications.map((n) => (
                  <div key={n.id} className={`flex items-center justify-between px-4 py-3 rounded-lg border ${getNotificationBg(n.type)}`}>
                    <div className="flex items-center space-x-3">
                      <AlertCircle className={`w-4 h-4 flex-shrink-0 ${n.type === 'warning' ? 'text-orange-500' : n.type === 'success' ? 'text-green-500' : 'text-blue-500'}`} />
                      <p className="text-sm font-medium text-gray-900">
                        {n.message}
                        {n.count && <span className="ml-2 px-1.5 py-0.5 bg-white rounded-full text-xs font-semibold">{n.count}</span>}
                      </p>
                    </div>
                    {n.link && (
                      <button onClick={() => navigate(n.link!)} className="flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-gray-50 rounded-lg text-xs font-medium transition-colors">
                        {n.action} <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { title: 'Šiandien peržiūrų', value: stats.todayViews.toLocaleString(), icon: Eye, bg: 'bg-blue-50', color: 'text-blue-600' },
                { title: 'Aktyvūs renginiai', value: stats.activeEvents, icon: Calendar, bg: 'bg-green-50', color: 'text-green-600', link: '/admin/events' },
                { title: 'Laukia skelbimai', value: (stats.pendingEvents || 0) + (stats.pendingListings || 0), icon: Send, bg: 'bg-amber-50', color: 'text-amber-600', link: '/admin/listings?status=pending', highlight: (stats.pendingEvents || 0) + (stats.pendingListings || 0) > 0 },
              ].map((card, i) => {
                const Icon = card.icon;
                return (
                  <div
                    key={i}
                    onClick={(card as any).link ? () => navigate((card as any).link) : undefined}
                    className={`bg-white rounded-xl shadow-sm p-4 ${(card as any).link ? 'cursor-pointer hover:shadow-md' : ''} transition-shadow ${(card as any).highlight ? 'ring-2 ring-amber-400' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className={`p-2 rounded-lg ${card.bg}`}>
                        <Icon className={`w-4 h-4 ${card.color}`} />
                      </div>
                      {(card as any).highlight && (card as any).value > 0 && <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />}
                    </div>
                    <p className="text-gray-500 text-xs mb-0.5">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <div className="bg-white rounded-xl shadow-sm p-5">
                <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <Building className="w-4 h-4 text-gray-400" />
                  Listing'ai pagal kategoriją
                </h2>
                <div className="space-y-2">
                  {CATEGORY_CONFIG.map(cat => {
                    const Icon = cat.icon;
                    const count = stats.byCategory[cat.key] || 0;
                    const max = Math.max(...CATEGORY_CONFIG.map(c => stats.byCategory[c.key] || 0), 1);
                    const pct = (count / max) * 100;
                    return (
                      <button key={cat.key} onClick={() => navigate(cat.link)} className="w-full flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors text-left group">
                        <div className={`p-1.5 rounded-md ${cat.color} flex-shrink-0`}>
                          <Icon className={`w-3.5 h-3.5 ${cat.iconColor}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-xs font-medium text-gray-700">{cat.label}</span>
                            <span className="text-xs font-bold text-gray-900">{count}</span>
                          </div>
                          <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full ${cat.iconColor.replace('text-', 'bg-')}`} style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-gray-400 flex-shrink-0 transition-colors" />
                      </button>
                    );
                  })}
                  {[
                    { label: 'Renginiai', value: stats.activeEvents, link: '/admin/events', color: 'bg-teal-50', iconColor: 'text-teal-600', Icon: Calendar, barColor: 'bg-teal-500' },
                    { label: 'Straipsniai', value: stats.totalArticles, link: '/admin/articles', color: 'bg-sky-50', iconColor: 'text-sky-600', Icon: BookOpen, barColor: 'bg-sky-500' },
                  ].map(item => (
                    <button key={item.label} onClick={() => navigate(item.link)} className="w-full flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-gray-50 transition-colors text-left group">
                      <div className={`p-1.5 rounded-md ${item.color} flex-shrink-0`}>
                        <item.Icon className={`w-3.5 h-3.5 ${item.iconColor}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="text-xs font-medium text-gray-700">{item.label}</span>
                          <span className="text-xs font-bold text-gray-900">{item.value}</span>
                        </div>
                        <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${item.barColor}`} style={{ width: '100%' }} />
                        </div>
                      </div>
                      <ArrowRight className="w-3 h-3 text-gray-300 group-hover:text-gray-400 flex-shrink-0" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                {isAdmin && (
                  <div className="bg-white rounded-xl shadow-sm p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-gray-400" />
                        Pajamos
                      </h2>
                      <button onClick={() => navigate('/admin/revenue')} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                        Plačiau <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div className="bg-blue-50 rounded-lg p-3">
                        <p className="text-xs text-blue-600 font-medium mb-1">Šis mėnuo</p>
                        <p className="text-lg font-bold text-blue-800">{fmt(revenueStats.thisMonth)} €</p>
                      </div>
                      <div className="bg-green-50 rounded-lg p-3">
                        <p className="text-xs text-green-600 font-medium mb-1">Šie metai</p>
                        <p className="text-lg font-bold text-green-800">{fmt(revenueStats.thisYear)} €</p>
                      </div>
                    </div>
                    {revenueStats.upcomingRenewals > 0 && (
                      <button onClick={() => navigate('/admin/revenue')} className="w-full flex items-center justify-between p-2.5 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span className="text-xs font-medium text-amber-800">Artimiausi atnaujinimai</span>
                        </div>
                        <span className="px-1.5 py-0.5 bg-amber-200 text-amber-800 rounded-full text-xs font-bold">{revenueStats.upcomingRenewals}</span>
                      </button>
                    )}
                  </div>
                )}

                <div className="bg-white rounded-xl shadow-sm p-5">
                  <h2 className="text-sm font-semibold text-gray-700 mb-3">Greitos nuorodos</h2>
                  <button onClick={() => navigate('/admin/listings')} className="w-full flex flex-col items-start p-3 rounded-lg bg-blue-50 hover:bg-blue-100 transition-colors text-left">
                    <Building className="w-4 h-4 text-blue-600 mb-1.5" />
                    <p className="font-semibold text-gray-900 text-xs">Visi listing'ai</p>
                    <p className="text-xs text-gray-500">{stats.totalListings} aktyvūs</p>
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5">
              <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Eye className="w-4 h-4 text-gray-400" />
                Peržiūros šiandien
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Iš viso peržiūrų', value: stats.todayViews, icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
                  { label: 'Aktyvūs listing\'ai', value: stats.totalListings, icon: Building, color: 'text-gray-600', bg: 'bg-gray-50' },
                  { label: 'Straipsniai', value: stats.totalArticles, icon: BookOpen, color: 'text-sky-600', bg: 'bg-sky-50' },
                  { label: 'Aktyvūs renginiai', value: stats.activeEvents, icon: Calendar, color: 'text-green-600', bg: 'bg-green-50' },
                ].map((item, i) => {
                  const Icon = item.icon;
                  return (
                    <div key={i} className={`${item.bg} rounded-lg p-3 flex items-center gap-3`}>
                      <Icon className={`w-4 h-4 ${item.color} flex-shrink-0`} />
                      <div>
                        <p className="text-xs text-gray-500">{item.label}</p>
                        <p className="text-lg font-bold text-gray-900">{item.value}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'overview' && (
          <div className="space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { title: 'Listing peržiūros', value: analytics.totalViews.toLocaleString(), icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
                { title: 'Straipsnių skaitymai', value: analytics.totalArticleViews.toLocaleString(), icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { title: 'Paspaudimai', value: analytics.totalClicks.toLocaleString(), icon: MousePointerClick, color: 'text-orange-600', bg: 'bg-orange-50' },
                { title: 'Unikalūs seansai', value: analytics.uniqueSessions.toLocaleString(), icon: Users, color: 'text-sky-600', bg: 'bg-sky-50' },
              ].map((card) => {
                const Icon = card.icon;
                return (
                  <div key={card.title} className="bg-white rounded-xl shadow-sm p-4">
                    <div className={`inline-flex p-2 rounded-lg ${card.bg} mb-2`}>
                      <Icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                    <p className="text-xs text-gray-500 mb-0.5">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                );
              })}
            </div>

            {analyticsLoading ? (
              <div className="flex items-center justify-center h-40"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
            ) : (
              <>
                <div className="bg-white rounded-xl shadow-sm p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart2 className="w-4 h-4 text-gray-400" />
                    <h2 className="text-sm font-semibold text-gray-900">Peržiūros pagal laikotarpį</h2>
                  </div>
                  {analytics.viewsTrend.every(d => d.views === 0 && d.clicks === 0) ? (
                    <p className="text-gray-400 text-sm text-center py-8">Nėra duomenų šiam laikotarpiui</p>
                  ) : (() => {
                    const grouped: { label: string; views: number; clicks: number }[] = [];
                    const trend = analytics.viewsTrend;
                    if (dateRange === '7d' || dateRange === 'week') {
                      trend.forEach(d => {
                        grouped.push({
                          label: new Date(d.date + 'T12:00:00').toLocaleDateString('lt-LT', { weekday: 'short', day: 'numeric' }),
                          views: d.views,
                          clicks: d.clicks,
                        });
                      });
                    } else if (dateRange === '30d' || dateRange === 'month') {
                      for (let i = 0; i < trend.length; i += 7) {
                        const chunk = trend.slice(i, i + 7);
                        const start = new Date(chunk[0].date + 'T12:00:00');
                        const end = new Date(chunk[chunk.length - 1].date + 'T12:00:00');
                        grouped.push({
                          label: `${start.toLocaleDateString('lt-LT', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('lt-LT', { day: 'numeric' })}`,
                          views: chunk.reduce((s, d) => s + d.views, 0),
                          clicks: chunk.reduce((s, d) => s + d.clicks, 0),
                        });
                      }
                    } else {
                      for (let i = 0; i < trend.length; i += 30) {
                        const chunk = trend.slice(i, i + 30);
                        const start = new Date(chunk[0].date + 'T12:00:00');
                        grouped.push({
                          label: start.toLocaleDateString('lt-LT', { month: 'long' }),
                          views: chunk.reduce((s, d) => s + d.views, 0),
                          clicks: chunk.reduce((s, d) => s + d.clicks, 0),
                        });
                      }
                    }
                    const maxVal = Math.max(...grouped.map(g => g.views), 1);
                    return (
                      <div className="space-y-2">
                        {grouped.map((g, i) => (
                          <div key={i} className="flex items-center gap-3">
                            <span className="text-xs text-gray-400 w-28 shrink-0 text-right">{g.label}</span>
                            <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden">
                              <div
                                className="h-full bg-blue-500 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                                style={{ width: `${Math.max((g.views / maxVal) * 100, g.views > 0 ? 5 : 0)}%` }}
                              >
                                {g.views > 0 && <span className="text-[10px] text-white font-semibold">{g.views}</span>}
                              </div>
                            </div>
                            {g.clicks > 0 && <span className="text-xs text-orange-500 font-medium w-12 shrink-0 text-right">{g.clicks} sp.</span>}
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {[
                    {
                      title: 'Kalba', icon: Globe,
                      content: Object.entries(analytics.viewsByLanguage).sort(([, a], [, b]) => b - a).map(([lang, count]) => {
                        const total = analytics.totalViews + analytics.totalArticleViews;
                        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                        return { label: LANGUAGE_LABELS[lang] || lang.toUpperCase(), value: `${count} (${pct}%)`, pct, color: 'bg-blue-500' };
                      })
                    },
                    {
                      title: 'Įrenginys', icon: Monitor,
                      content: Object.entries(analytics.viewsByDevice).sort(([, a], [, b]) => b - a).map(([device, count]) => {
                        const total = analytics.totalViews + analytics.totalArticleViews;
                        const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                        return { label: device === 'mobile' ? 'Telefonas' : device === 'tablet' ? 'Planšetė' : 'Kompiuteris', value: `${pct}%`, pct, color: 'bg-sky-500' };
                      })
                    },
                    {
                      title: 'Kategorijos', icon: MapPin,
                      content: Object.entries(analytics.viewsByCategory).sort(([, a], [, b]) => b - a).map(([cat, count]) => {
                        const pct = analytics.totalViews > 0 ? Math.round((count / analytics.totalViews) * 100) : 0;
                        return { label: CATEGORY_LABELS[cat] || cat, value: count, pct, color: CATEGORY_COLORS[cat]?.replace('bg-', 'bg-') || 'bg-gray-400' };
                      })
                    },
                  ].map(section => {
                    const Icon = section.icon;
                    return (
                      <div key={section.title} className="bg-white rounded-xl shadow-sm p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className="w-4 h-4 text-gray-400" />
                          <h2 className="text-sm font-semibold text-gray-900">{section.title}</h2>
                        </div>
                        {section.content.length === 0 ? (
                          <p className="text-gray-400 text-xs text-center py-4">Nėra duomenų</p>
                        ) : (
                          <div className="space-y-2">
                            {section.content.map(item => (
                              <div key={item.label}>
                                <div className="flex justify-between mb-0.5">
                                  <span className="text-xs text-gray-700">{item.label}</span>
                                  <span className="text-xs font-semibold text-gray-900">{item.value}</span>
                                </div>
                                <div className="w-full bg-gray-100 rounded-full h-1">
                                  <div className={`${item.color} h-1 rounded-full`} style={{ width: `${item.pct}%` }} />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'listings' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { title: 'Listing peržiūros', value: analytics.totalViews.toLocaleString(), icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50' },
                { title: 'Paspaudimai', value: analytics.totalClicks.toLocaleString(), icon: MousePointerClick, color: 'text-orange-600', bg: 'bg-orange-50' },
                { title: 'Unikalūs seansai', value: analytics.uniqueSessions.toLocaleString(), icon: Users, color: 'text-sky-600', bg: 'bg-sky-50' },
                { title: 'Vid. CTR', value: analytics.totalViews > 0 ? `${((analytics.totalClicks / analytics.totalViews) * 100).toFixed(1)}%` : '0%', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
              ].map(card => {
                const Icon = card.icon;
                return (
                  <div key={card.title} className="bg-white rounded-xl shadow-sm p-4">
                    <div className={`inline-flex p-2 rounded-lg ${card.bg} mb-2`}>
                      <Icon className={`w-4 h-4 ${card.color}`} />
                    </div>
                    <p className="text-xs text-gray-500 mb-0.5">{card.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{card.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div>
                    <h2 className="text-sm font-semibold text-gray-900">Populiariausi listingai</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Rikiuota pagal peržiūrų skaičių</p>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Ieškoti..."
                      value={listingSearch}
                      onChange={e => setListingSearch(e.target.value)}
                      className="pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 w-48"
                    />
                  </div>
                </div>
              </div>
              {analyticsLoading ? (
                <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
              ) : filteredListings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Eye className="w-8 h-8 mb-2 opacity-30" />
                  <p className="text-sm">{listingSearch ? 'Nieko nerasta' : 'Nėra peržiūrų duomenų'}</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filteredListings.map((listing, index) => (
                    <div key={listing.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                      <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 ${
                        index === 0 ? 'bg-amber-100 text-amber-700' :
                        index === 1 ? 'bg-gray-200 text-gray-600' :
                        index === 2 ? 'bg-orange-100 text-orange-600' :
                        'bg-gray-100 text-gray-500'
                      }`}>
                        {index + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-gray-900 text-sm truncate">{listing.name}</p>
                          <span className={`text-xs px-1.5 py-0.5 rounded-full text-white shrink-0 ${CATEGORY_COLORS[listing.category] || 'bg-gray-400'}`}>
                            {CATEGORY_LABELS[listing.category] || listing.category}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-bold text-gray-900">{listing.views}</p>
                          <p className="text-xs text-gray-400">peržiūros</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-orange-600">{listing.clicks}</p>
                          <p className="text-xs text-gray-400">paspaud.</p>
                        </div>
                        {listing.views > 0 && (
                          <div className="text-right">
                            <p className="text-sm font-bold text-emerald-600">{((listing.clicks / listing.views) * 100).toFixed(1)}%</p>
                            <p className="text-xs text-gray-400">CTR</p>
                          </div>
                        )}
                        <button
                          onClick={() => navigate(`/admin/listings/${listing.id}/analytics`)}
                          className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Detalesnė analitika"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'articles' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="p-4 border-b border-gray-100">
              <h2 className="text-sm font-semibold text-gray-900">Populiariausi straipsniai</h2>
              <p className="text-xs text-gray-400 mt-0.5">Rikiuota pagal skaitymų skaičių</p>
            </div>
            {analyticsLoading ? (
              <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
            ) : analytics.topArticles.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <BookOpen className="w-8 h-8 mb-2 opacity-30" />
                <p className="text-sm">Nėra straipsnių skaitymų duomenų</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {analytics.topArticles.map((article, index) => (
                  <div key={article.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                    <span className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold shrink-0 ${
                      index === 0 ? 'bg-amber-100 text-amber-700' :
                      index === 1 ? 'bg-gray-200 text-gray-600' :
                      index === 2 ? 'bg-orange-100 text-orange-600' :
                      'bg-gray-100 text-gray-500'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium text-gray-900 text-sm truncate">{article.title}</p>
                        <span className="text-xs px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 shrink-0">
                          {CATEGORY_LABELS[article.category] || article.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-gray-900">{article.views}</p>
                      <p className="text-xs text-gray-400">skaitymai</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'clicks' && (
          <div className="space-y-4">
            {analyticsLoading ? (
              <div className="flex items-center justify-center py-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" /></div>
            ) : (
              <>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  {analytics.clickBreakdown.length === 0 ? (
                    <div className="col-span-4 bg-white rounded-xl shadow-sm p-8 text-center text-gray-400 text-sm">Nėra paspaudimų duomenų</div>
                  ) : analytics.clickBreakdown.map(({ type, count }) => {
                    const total = analytics.totalClicks;
                    const pct = total > 0 ? Math.round((count / total) * 100) : 0;
                    const ClickIcon = type === 'phone' ? Phone : type === 'website' ? Globe : type === 'booking' ? Calendar : MapPin;
                    return (
                      <div key={type} className="bg-white rounded-xl shadow-sm p-4 border border-gray-100">
                        <div className="flex items-center gap-2 mb-2">
                          <ClickIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-xs font-medium text-gray-600">{CLICK_TYPE_LABELS[type] || type}</span>
                        </div>
                        <p className="text-2xl font-bold text-gray-900 mb-0.5">{count}</p>
                        <p className="text-xs text-gray-400">{pct}% visų paspaudimų</p>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                  <div className="p-4 border-b border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-900">Listingai su daugiausia paspaudimų</h2>
                  </div>
                  {analytics.topListings.filter(l => l.clicks > 0).length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                      <MousePointerClick className="w-8 h-8 mb-2 opacity-30" />
                      <p className="text-sm">Nėra paspaudimų duomenų</p>
                    </div>
                  ) : (
                    <div className="divide-y divide-gray-50">
                      {analytics.topListings.filter(l => l.clicks > 0).sort((a, b) => b.clicks - a.clicks).slice(0, 10).map((listing, index) => (
                        <div key={listing.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors">
                          <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-100 text-xs font-bold text-gray-500 shrink-0">{index + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-medium text-gray-900 text-sm truncate">{listing.name}</p>
                              <span className={`text-xs px-1.5 py-0.5 rounded-full text-white shrink-0 ${CATEGORY_COLORS[listing.category] || 'bg-gray-400'}`}>
                                {CATEGORY_LABELS[listing.category] || listing.category}
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <p className="text-sm font-bold text-orange-600">{listing.clicks}</p>
                              <p className="text-xs text-gray-400">paspaud.</p>
                            </div>
                            <button onClick={() => navigate(`/admin/listings/${listing.id}/analytics`)} className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors" title="Detalesnė analitika">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default OverviewPage;
