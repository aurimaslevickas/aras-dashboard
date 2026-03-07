import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Bed, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ArticlesSection from '../components/ArticlesSection';
import { getCategoryUrl, normalizeLocale } from '../lib/localeRoutes';
import { useSectionTexts } from '../lib/useSectionTexts';
import ResponsiveImage from '../components/ResponsiveImage';
import PartnerCTA from '../components/PartnerCTA';
import PartnerCTA from '../components/PartnerCTA';

interface Listing {
  id: string;
  slug: string;
  slug_lt?: string;
  slug_en?: string;
  slug_pl?: string;
  slug_de?: string;
  slug_ru?: string;
  slug_fr?: string;
  name: string;
  name_en?: string;
  name_pl?: string;
  name_de?: string;
  name_ru?: string;
  name_fr?: string;
  description: string;
  description_en?: string;
  description_pl?: string;
  description_de?: string;
  description_ru?: string;
  description_fr?: string;
  location: string;
  price_range: string;
  image_url: string;
  features: string[];
  badge: string;
  image_alt_lt?: string;
  image_alt_en?: string;
  image_alt_pl?: string;
  image_alt_de?: string;
  image_alt_ru?: string;
  image_alt_fr?: string;
}

const MOBILE_INITIAL = 4;
const ITEMS_PER_PAGE = 12;

const StayPage = () => {
  const { t, i18n } = useTranslation();
  const locale = normalizeLocale(i18n.language);
  const section = useSectionTexts('stay');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [mobileExpanded, setMobileExpanded] = useState(false);

  const filters = [
    { value: 'all', label: t('filter.allHotels') },
    { value: 'luxury', label: t('filter.luxuryHotels') },
    { value: 'boutique', label: t('filter.boutiqueHotels') },
    { value: 'budget', label: t('filter.budgetHotels') },
    { value: 'hostel', label: t('filter.hostels') },
    { value: 'spa', label: t('filter.spaHotels') },
  ];

  useEffect(() => {
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('category', 'hotel')
        .eq('status', 'active')
        .order('promoted_until', { ascending: false, nullsFirst: false })
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false });
      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getLocalizedName = (listing: Listing) => {
    const key = `name_${locale}` as keyof Listing;
    return (listing[key] as string) || listing.name;
  };

  const getLocalizedDescription = (listing: Listing) => {
    const key = `description_${locale}` as keyof Listing;
    return (listing[key] as string) || listing.description;
  };

  const getLocalizedImageAlt = (listing: Listing) => {
    const key = `image_alt_${locale}` as keyof Listing;
    return (listing[key] as string) || listing.image_alt_lt || listing.name;
  };

  const getLocalizedSlug = (listing: Listing) => {
    const key = `slug_${locale}` as keyof Listing;
    return (listing[key] as string) || listing.slug;
  };

  const getCardUrl = (listing: Listing) => {
    const catUrl = getCategoryUrl(locale, 'stay');
    const slug = getLocalizedSlug(listing);
    return `${catUrl}/${slug}`;
  };

  const filteredListings = listings.filter((listing) => {
    if (selectedFilter === 'all') return true;
    return listing.features?.includes(selectedFilter);
  });

  const totalPages = Math.ceil(filteredListings.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedListings = filteredListings.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-amber-600 via-orange-600 to-red-600 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Bed className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold">{section.title || t('category.hotel')}</h1>
          </div>
          <p className="text-xl text-white/80 max-w-3xl">
            {section.description}
          </p>
        </div>
      </div>

      <ArticlesSection category="stay" />

      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="mb-10">
            <div className="flex items-center gap-3 mb-3">
              <Filter className="w-7 h-7 text-orange-600" />
              <h2 className="text-3xl font-bold text-gray-900">{t('filter.findHotel')}</h2>
            </div>
          </div>

          <div className="mb-8">
            <div className="flex flex-wrap gap-3">
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => { setSelectedFilter(filter.value); setCurrentPage(1); setMobileExpanded(false); }}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    selectedFilter === filter.value
                      ? 'bg-orange-600 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 hover:bg-orange-50 hover:text-orange-600 shadow-md'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-8 pb-6 border-b border-gray-200">
            <p className="text-gray-600 text-lg">
              {t('filter.found')} <span className="font-bold text-orange-600 text-xl">{filteredListings.length}</span> {t('filter.hotels')}
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-64 bg-gray-200 rounded-xl mb-4"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : filteredListings.length === 0 ? (
            <div className="text-center py-16">
              <Bed className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('filter.notFoundHotels')}</h3>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
                {paginatedListings.map((listing, idx) => (
                  <Link
                    key={listing.id}
                    to={getCardUrl(listing)}
                    className={`group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 ${!mobileExpanded && idx >= MOBILE_INITIAL ? 'hidden md:block' : ''}`}
                  >
                    <div className="relative h-56 overflow-hidden">
                      <ResponsiveImage
                        src={listing.image_url || 'https://images.pexels.com/photos/271624/pexels-photo-271624.jpeg?auto=compress&cs=tinysrgb&w=800'}
                        alt={getLocalizedImageAlt(listing)}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        widths={[400, 600, 800]}
                        defaultWidth={600}
                        loading={idx < 3 ? 'eager' : 'lazy'}
                        fetchpriority={idx === 0 ? 'high' : 'auto'}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                      {listing.badge && (
                        <div className="absolute top-4 left-4 px-3 py-1.5 bg-orange-600 text-white text-xs font-bold rounded-full shadow-lg">
                          {t(`common.${listing.badge}`)}
                        </div>
                      )}
                      {listing.price_range && (
                        <div className="absolute bottom-4 right-4 px-3 py-1.5 bg-orange-600 text-white text-xs font-bold rounded-full shadow-lg">
                          {listing.price_range}
                        </div>
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-1 mb-3">
                        {getLocalizedName(listing)}
                      </h3>
                      {listing.location && (
                        <div className="flex items-center gap-2 text-gray-600 mb-3">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm line-clamp-1">{listing.location}</span>
                        </div>
                      )}
                      {getLocalizedDescription(listing) && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{getLocalizedDescription(listing)}</p>
                      )}
                      {listing.features && listing.features.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {listing.features.slice(0, 3).map((feature) => (
                            <span key={feature} className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full">
                              {feature}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>

              {!mobileExpanded && filteredListings.length > MOBILE_INITIAL && (
                <div className="flex justify-center md:hidden mb-8">
                  <button
                    onClick={() => setMobileExpanded(true)}
                    className="px-8 py-3 bg-orange-600 text-white font-semibold rounded-xl hover:bg-orange-700 transition-colors shadow-lg"
                  >
                    {t('common.more')} ({filteredListings.length - MOBILE_INITIAL})
                  </button>
                </div>
              )}

              {totalPages > 1 && (
                <div className="hidden md:flex items-center justify-center gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('filter.back')}
                  </button>
                  <div className="flex gap-2">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`w-10 h-10 rounded-lg font-semibold transition-colors ${
                          currentPage === page ? 'bg-orange-600 text-white' : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>
                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {t('filter.next')}
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      <PartnerCTA accentColor="amber" />
      </section>

      <PartnerCTA accentColor="teal" />
    </div>
  );
};

export default StayPage;
