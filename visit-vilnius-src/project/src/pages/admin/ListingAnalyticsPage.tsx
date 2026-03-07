import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Eye,
  MousePointerClick,
  Users,
  TrendingUp,
  ArrowLeft,
  Phone,
  Globe,
  Calendar,
  MapPin,
  Monitor,
  Smartphone,
  Tablet,
  FileText,
  RefreshCw,
  BarChart2,
  Download,
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';

interface ListingInfo {
  id: string;
  name: string;
  category: string;
  location: string;
  image_url: string;
  status: string;
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
  uniqueSessions: number;
  viewsByDevice: Record<string, number>;
  viewsByLanguage: Record<string, number>;
  clickBreakdown: ClickBreakdown[];
  trend: DayData[];
}

const CATEGORY_LABELS: Record<string, string> = {
  hotel: 'Viešbutis',
  restaurant: 'Restoranas',
  bar: 'Baras',
  attraction: 'Lankytina vieta',
  shop: 'Parduotuvė',
  event: 'Renginys',
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
  { value: 'ytd', label: 'Nuo metų pradžios' },
  { value: '7d', label: '7 d.' },
  { value: '30d', label: '30 d.' },
  { value: '90d', label: '90 d.' },
  { value: '1y', label: '1 metai' },
];

const DATE_RANGE_LABELS: Record<string, string> = {
  week: 'šią savaitę',
  month: 'šį mėnesį',
  ytd: 'nuo metų pradžios',
  '7d': 'per paskutines 7 dienas',
  '30d': 'per paskutines 30 dienų',
  '90d': 'per paskutines 90 dienų',
  '1y': 'per paskutinius metus',
};

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
  return 365;
};

const ListingAnalyticsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);

  const [listing, setListing] = useState<ListingInfo | null>(null);
  const [data, setData] = useState<AnalyticsData>({
    totalViews: 0,
    totalClicks: 0,
    uniqueSessions: 0,
    viewsByDevice: {},
    viewsByLanguage: {},
    clickBreakdown: [],
    trend: [],
  });
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('month');
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (id) loadListing();
  }, [id]);

  const loadListing = async () => {
    const { data } = await supabase
      .from('listings')
      .select('id, name, category, location, image_url, status')
      .eq('id', id)
      .maybeSingle();
    if (data) setListing(data);
  };

  const loadAnalytics = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const startISO = getDateRangeStart(dateRange);
      const daysAgo = getDaysForRange(dateRange);

      const [viewsResult, clicksResult] = await Promise.all([
        supabase
          .from('analytics_views')
          .select('id, session_id, device_type, user_language, viewed_at')
          .eq('listing_id', id)
          .gte('viewed_at', startISO),
        supabase
          .from('analytics_clicks')
          .select('id, click_type, element_label, clicked_at')
          .eq('listing_id', id)
          .gte('clicked_at', startISO),
      ]);

      const views = viewsResult.data || [];
      const clicks = clicksResult.data || [];

      const uniqueSessions = new Set(views.map((v: any) => v.session_id).filter(Boolean)).size;

      const viewsByDevice: Record<string, number> = {};
      views.forEach((v: any) => {
        const d = v.device_type || 'desktop';
        viewsByDevice[d] = (viewsByDevice[d] || 0) + 1;
      });

      const viewsByLanguage: Record<string, number> = {};
      views.forEach((v: any) => {
        if (v.user_language) {
          viewsByLanguage[v.user_language] = (viewsByLanguage[v.user_language] || 0) + 1;
        }
      });

      const clickTypes: Record<string, number> = {};
      clicks.forEach((c: any) => {
        const t = c.click_type || 'other';
        clickTypes[t] = (clickTypes[t] || 0) + 1;
      });
      const clickBreakdown: ClickBreakdown[] = Object.entries(clickTypes)
        .map(([type, count]) => ({ type, count }))
        .sort((a, b) => b.count - a.count);

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

      const trend: DayData[] = Object.entries(trendMap).map(([date, v]) => ({
        date,
        views: v.views,
        clicks: v.clicks,
      }));

      setData({ totalViews: views.length, totalClicks: clicks.length, uniqueSessions, viewsByDevice, viewsByLanguage, clickBreakdown, trend });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, dateRange]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  const handlePrint = () => {
    setIsPrinting(true);
    setTimeout(() => {
      window.print();
      setIsPrinting(false);
    }, 300);
  };

  const maxTrend = Math.max(...data.trend.map(d => d.views), 1);
  const ctr = data.totalViews > 0 ? ((data.totalClicks / data.totalViews) * 100).toFixed(1) : '0.0';
  const reportDate = new Date().toLocaleDateString('lt-LT', { year: 'numeric', month: 'long', day: 'numeric' });

  if (!listing && !loading) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-96 text-gray-400">
          <p className="text-lg">Listingas nerastas</p>
          <button onClick={() => navigate(-1)} className="mt-4 text-blue-600 hover:underline text-sm">Grįžti atgal</button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #listing-report, #listing-report * { visibility: visible !important; }
          #listing-report { position: absolute; left: 0; top: 0; width: 100%; }
          .no-print { display: none !important; }
        }
      `}</style>

      <div className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-4 no-print">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {listing ? listing.name : 'Kraunama...'}
              </h1>
              {listing && (
                <p className="text-sm text-gray-500 mt-0.5">
                  {CATEGORY_LABELS[listing.category] || listing.category}
                  {listing.location ? ` · ${listing.location}` : ''}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadAnalytics}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Atnaujinti"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              <Download className="w-4 h-4" />
              Spausdinti / PDF
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1 flex-wrap no-print">
          {DATE_RANGES.map(range => (
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

        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          </div>
        ) : (
          <div id="listing-report" ref={printRef}>
            <div className="hidden print:block mb-8 pb-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{listing?.name}</h1>
                  <p className="text-gray-500 mt-1">
                    {CATEGORY_LABELS[listing?.category || ''] || listing?.category}
                    {listing?.location ? ` · ${listing.location}` : ''}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">Lankomumo ataskaita · {reportDate}</p>
                  <p className="text-sm text-gray-500 mt-0.5">Laikotarpis: {DATE_RANGE_LABELS[dateRange] || dateRange}</p>
                </div>
                <div className="text-right text-sm text-gray-400">
                  <p className="font-bold text-gray-900 text-lg">Visit Vilnius</p>
                  <p>visitvilnius.lt</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { label: 'Peržiūros', value: data.totalViews.toLocaleString(), icon: Eye, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-100' },
                { label: 'Paspaudimai', value: data.totalClicks.toLocaleString(), icon: MousePointerClick, color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-100' },
                { label: 'Unikalūs seansai', value: data.uniqueSessions.toLocaleString(), icon: Users, color: 'text-sky-600', bg: 'bg-sky-50', border: 'border-sky-100' },
                { label: 'CTR', value: `${ctr}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100' },
              ].map(card => {
                const Icon = card.icon;
                return (
                  <div key={card.label} className={`bg-white rounded-xl border ${card.border} p-5 shadow-sm`}>
                    <div className={`inline-flex p-2.5 rounded-lg ${card.bg} mb-3`}>
                      <Icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                    <p className="text-sm text-gray-500 mb-1">{card.label}</p>
                    <p className="text-3xl font-bold text-gray-900">{card.value}</p>
                  </div>
                );
              })}
            </div>

            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 mb-6">
              <div className="flex items-center gap-2 mb-5">
                <BarChart2 className="w-5 h-5 text-gray-400" />
                <h2 className="text-base font-semibold text-gray-900">Peržiūros per laikotarpį</h2>
              </div>
              {data.trend.every(d => d.views === 0) ? (
                <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                  <Eye className="w-10 h-10 mb-3 opacity-30" />
                  <p className="text-sm">Nėra peržiūrų šiam laikotarpiui</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {data.trend.filter((_, i) => {
                    const days = getDaysForRange(dateRange);
                    if (days <= 30) return true;
                    return i % 3 === 0;
                  }).map(day => (
                    <div key={day.date} className="flex items-center gap-3 group">
                      <span className="text-xs text-gray-400 w-20 shrink-0 text-right">
                        {new Date(day.date + 'T12:00:00').toLocaleDateString('lt-LT', { month: 'short', day: 'numeric' })}
                      </span>
                      <div className="flex-1 flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-5 relative overflow-hidden">
                          <div
                            className="h-full bg-blue-500 rounded-full transition-all duration-500 flex items-center justify-end pr-2"
                            style={{ width: `${Math.max((day.views / maxTrend) * 100, day.views > 0 ? 4 : 0)}%` }}
                          >
                            {day.views > 0 && (
                              <span className="text-[10px] text-white font-semibold">{day.views}</span>
                            )}
                          </div>
                        </div>
                        {day.clicks > 0 && (
                          <span className="text-xs text-orange-500 font-medium w-14 shrink-0">{day.clicks} paspaud.</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Monitor className="w-4 h-4 text-gray-400" />
                  <h2 className="text-base font-semibold text-gray-900">Įrenginys</h2>
                </div>
                {Object.keys(data.viewsByDevice).length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">Nėra duomenų</p>
                ) : (
                  <div className="space-y-4">
                    {Object.entries(data.viewsByDevice).sort(([, a], [, b]) => b - a).map(([device, count]) => {
                      const pct = data.totalViews > 0 ? Math.round((count / data.totalViews) * 100) : 0;
                      const DeviceIcon = device === 'mobile' ? Smartphone : device === 'tablet' ? Tablet : Monitor;
                      return (
                        <div key={device} className="flex items-center gap-3">
                          <DeviceIcon className="w-5 h-5 text-gray-400 shrink-0" />
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-700">{device === 'mobile' ? 'Telefonas' : device === 'tablet' ? 'Planšetė' : 'Kompiuteris'}</span>
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
                  <Globe className="w-4 h-4 text-gray-400" />
                  <h2 className="text-base font-semibold text-gray-900">Kalba</h2>
                </div>
                {Object.keys(data.viewsByLanguage).length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">Nėra duomenų</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(data.viewsByLanguage).sort(([, a], [, b]) => b - a).map(([lang, count]) => {
                      const pct = data.totalViews > 0 ? Math.round((count / data.totalViews) * 100) : 0;
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
                  <MousePointerClick className="w-4 h-4 text-gray-400" />
                  <h2 className="text-base font-semibold text-gray-900">Paspaudimų tipai</h2>
                </div>
                {data.clickBreakdown.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-6">Nėra paspaudimų</p>
                ) : (
                  <div className="space-y-4">
                    {data.clickBreakdown.map(({ type, count }) => {
                      const pct = data.totalClicks > 0 ? Math.round((count / data.totalClicks) * 100) : 0;
                      const ClickIcon = type === 'phone' ? Phone : type === 'website' ? Globe : type === 'booking' ? Calendar : MapPin;
                      return (
                        <div key={type} className="flex items-center gap-3">
                          <ClickIcon className="w-4 h-4 text-gray-400 shrink-0" />
                          <div className="flex-1">
                            <div className="flex justify-between mb-1">
                              <span className="text-sm text-gray-700">{CLICK_TYPE_LABELS[type] || type}</span>
                              <span className="text-sm font-semibold text-gray-900">{count} <span className="text-gray-400 font-normal">({pct}%)</span></span>
                            </div>
                            <div className="w-full bg-gray-100 rounded-full h-1.5">
                              <div className="bg-orange-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="hidden print:block mt-8 pt-6 border-t border-gray-200 text-center text-xs text-gray-400">
              <p>Ataskaita sugeneruota {reportDate} · Visit Vilnius administracinė sistema</p>
              <p className="mt-1">Šis dokumentas skirtas partneriui ir yra konfidencialus</p>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default ListingAnalyticsPage;
