import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { getCategoryUrl, normalizeLocale } from '../lib/localeRoutes';
import { translateTag } from '../lib/suggestedTags';
import { localizeAddress } from '../utils/locationUtils';
import { Wine, Star, MapPin } from 'lucide-react';
import { useSectionTexts } from '../lib/useSectionTexts';
import ResponsiveImage from './ResponsiveImage';

interface Listing {
  id: string;
  slug: string;
  name: string;
  description: string;
  location: string;
  image_url: string;
  price_range: string;
  badge: string;
  features: string[];
}

export default function BarsSection() {
  const { t, i18n } = useTranslation();
  const locale = normalizeLocale(i18n.language);
  const categoryPath = getCategoryUrl(locale, 'bar');
  const [bars, setBars] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const section = useSectionTexts('bar');

  useEffect(() => {
    fetchBars();
  }, []);

  const fetchBars = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('category', 'bar')
        .eq('status', 'active')
        .order('promoted_until', { ascending: false, nullsFirst: false })
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setBars(data || []);
    } catch (error) {
      console.error('Error fetching bars:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded w-1/4 mb-8 mx-auto"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-80 bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (bars.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-4 mb-3">
            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center">
              <Wine className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-4xl font-bold text-gray-900">
              {section.title || t('category.bar')}
            </h2>
          </div>
          {section.description && (
            <p className="text-gray-600 max-w-2xl mx-auto">
              {section.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {bars.map((bar, index) => (
            <Link
              key={bar.id}
              to={`${categoryPath}/${bar.slug}`}
              className={`group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2${index >= 4 ? ' hidden md:flex md:flex-col' : ''}`}
            >
              <div className="relative h-56 overflow-hidden">
                <ResponsiveImage
                  src={bar.image_url || 'https://images.pexels.com/photos/941864/pexels-photo-941864.jpeg?auto=compress&cs=tinysrgb&w=800'}
                  alt={bar.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  widths={[400, 600, 800]}
                  defaultWidth={600}
                  loading={index < 3 ? 'eager' : 'lazy'}
                  fetchpriority={index === 0 ? 'high' : 'auto'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                {bar.badge && (
                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-slate-700 text-white text-xs font-bold rounded-full shadow-lg">
                    {t(`common.${bar.badge}`)}
                  </div>
                )}

                {bar.price_range && (
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-gray-900 text-sm font-bold rounded-full shadow-md">
                    {bar.price_range}
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-slate-700 transition-colors line-clamp-1 mb-3">
                  {bar.name}
                </h3>

                {bar.location && (
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm line-clamp-1">{localizeAddress(bar.location, locale)}</span>
                  </div>
                )}

                {bar.description && (
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {bar.description}
                  </p>
                )}

                {bar.features && bar.features.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {bar.features.slice(0, 3).map((feature) => (
                      <span
                        key={feature}
                        className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-full"
                      >
                        {translateTag(feature, locale)}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to={categoryPath}
            className="inline-flex items-center gap-2 px-8 py-3 bg-slate-800 text-white rounded-full font-semibold hover:bg-slate-900 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            {t('common.viewAll')}
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
