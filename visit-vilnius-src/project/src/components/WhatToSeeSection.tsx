import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Star } from 'lucide-react';
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
  badge: string;
}

const WhatToSeeSection = () => {
  const { t, i18n } = useTranslation();
  const locale = normalizeLocale(i18n.language);
  const categoryPath = getCategoryUrl(locale, 'see');
  const [attractions, setAttractions] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const section = useSectionTexts('see');

  useEffect(() => {
    fetchAttractions();
  }, []);

  const fetchAttractions = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('category', 'attraction')
        .eq('status', 'active')
        .order('promoted_until', { ascending: false, nullsFirst: false })
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setAttractions(data || []);
    } catch (error) {
      console.error('Error fetching attractions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            {section.title || t('category.sightseeing')}
          </h2>
          {section.description && (
            <p className="text-gray-600 max-w-2xl mx-auto">
              {section.description}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {attractions.map((attraction, index) => (
            <Link
              key={attraction.id}
              to={`${categoryPath}/${attraction.slug}`}
              className={`group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 no-underline${index >= 4 ? ' hidden md:flex md:flex-col' : ''}`}
            >
              <div className="relative h-56 overflow-hidden">
                <ResponsiveImage
                  src={attraction.image_url}
                  alt={attraction.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  widths={[400, 600, 800]}
                  defaultWidth={600}
                  loading={index < 3 ? 'eager' : 'lazy'}
                  fetchpriority={index === 0 ? 'high' : 'auto'}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                {attraction.badge && (
                  <div className="absolute top-4 left-4 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
                    {['featured', 'free_entry', 'must_try', 'new', 'popular'].includes(attraction.badge)
                      ? t(`common.${attraction.badge}`)
                      : attraction.badge}
                  </div>
                )}
                {attraction.image_attribution && (
                  <div className="absolute bottom-2 right-2">
                    {attraction.image_attribution_url ? (
                      <a
                        href={attraction.image_attribution_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={e => e.stopPropagation()}
                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-sm text-white/80 text-xs hover:text-white transition-colors"
                      >
                        <span className="opacity-60">&#169;</span>
                        <span>{attraction.image_attribution}</span>
                      </a>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/40 backdrop-blur-sm text-white/80 text-xs">
                        <span className="opacity-60">&#169;</span>
                        <span>{attraction.image_attribution}</span>
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-3 line-clamp-2 leading-tight">
                  {attraction.name}
                </h3>

                {attraction.location && (
                  <div className="flex items-center gap-2 text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm line-clamp-1">{attraction.location}</span>
                  </div>
                )}

                {attraction.description && (
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {attraction.description}
                  </p>
                )}
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

export default WhatToSeeSection;