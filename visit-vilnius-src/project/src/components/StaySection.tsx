import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getCategoryUrl, normalizeLocale } from '../lib/localeRoutes';
import { useSectionTexts } from '../lib/useSectionTexts';
import ResponsiveImage from './ResponsiveImage';

interface Listing {
  id: string;
  slug: string;
  name: string;
  description: string;
  location: string;
  image_url: string;
  image_attribution: string;
  image_attribution_url: string;
  price_range: string;
  badge: string;
}

const StaySection = () => {
  const { t, i18n } = useTranslation();
  const locale = normalizeLocale(i18n.language);
  const categoryPath = getCategoryUrl(locale, 'stay');
  const section = useSectionTexts('stay');
  const [hotels, setHotels] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('category', 'hotel')
        .eq('status', 'active')
        .order('promoted_until', { ascending: false, nullsFirst: false })
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setHotels(data || []);
    } catch (error) {
      console.error('Error fetching hotels:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </section>
    );
  }

  if (hotels.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {section.title || t('category.accommodation')}
          </h2>
          {section.description && (
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              {section.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {hotels.map((hotel, index) => (
            <Link
              key={hotel.id}
              to={`${categoryPath}/${hotel.slug}`}
              className={`bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group no-underline${index >= 4 ? ' hidden md:flex md:flex-col' : ''}`}
            >
              <div className="relative h-48 overflow-hidden">
                <ResponsiveImage
                  src={hotel.image_url}
                  alt={hotel.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  widths={[400, 600, 800]}
                  defaultWidth={600}
                  loading={index < 3 ? 'eager' : 'lazy'}
                  fetchpriority={index === 0 ? 'high' : 'auto'}
                />
                {hotel.badge && (
                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
                    {t(`common.${hotel.badge}`)}
                  </div>
                )}
                {hotel.price_range && (
                  <div className="absolute bottom-4 right-4 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-bold">
                    {hotel.price_range}
                  </div>
                )}
                {hotel.image_attribution && !hotel.price_range && (
                  <div className="absolute bottom-2 right-2">
                    {hotel.image_attribution_url ? (
                      <a
                        href={hotel.image_attribution_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-sm text-white/80 text-xs hover:text-white transition-colors"
                      >
                        <span className="opacity-60">&#169;</span>
                        <span>{hotel.image_attribution}</span>
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-sm text-white/80 text-xs">
                        <span className="opacity-60">&#169;</span>
                        <span>{hotel.image_attribution}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                  {hotel.name}
                </h3>

                <p className="text-gray-600 text-sm mb-4 leading-relaxed line-clamp-2">
                  {hotel.description}
                </p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center text-gray-500">
                    <MapPin className="w-4 h-4 mr-1" />
                    <span>{hotel.location}</span>
                  </div>

                  <span className="text-blue-600 font-semibold">
                    {t('filter.moreDetails')}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            to={categoryPath}
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
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
};

export default StaySection;
