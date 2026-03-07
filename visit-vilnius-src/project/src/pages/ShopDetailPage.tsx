import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, MapPin, Clock, Star, Phone, Globe, ShoppingBag, Heart, Share2, Navigation } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SEOHead from '../components/SEOHead';
import { getCategoryUrl, normalizeLocale } from '../lib/localeRoutes';
import { translateTag } from '../lib/suggestedTags';
import { localizeAddress, localizePriceRange } from '../utils/locationUtils';
import PhotoGallery from '../components/PhotoGallery';
import { trackListingView, trackClick } from '../utils/analytics';

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
  category: string;
  location: string;
  price_range: string;
  rating: number;
  image_url: string;
  gallery_images?: string[];
  contact_info: any;
  opening_hours: any;
  features: string[];
  features_en?: string[];
  features_pl?: string[];
  features_de?: string[];
  features_ru?: string[];
  features_fr?: string[];
  status: string;
  image_alt_lt?: string;
  image_alt_en?: string;
  image_alt_pl?: string;
  image_alt_de?: string;
  image_alt_ru?: string;
  image_alt_fr?: string;
}

const ShopDetailPage = () => {
  const { slug } = useParams();
  const { t, i18n } = useTranslation();
  const locale = normalizeLocale(i18n.language);
  const [item, setItem] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);

  const backUrl = getCategoryUrl(locale, 'shop');

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchItem();
  }, [slug]);

  const fetchItem = async () => {
    try {
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .or(`slug.eq.${slug},slug_lt.eq.${slug},slug_en.eq.${slug},slug_pl.eq.${slug},slug_de.eq.${slug},slug_ru.eq.${slug},slug_fr.eq.${slug}`)
        .eq('category', 'shop')
        .eq('status', 'active')
        .maybeSingle();
      if (error) throw error;
      setItem(data);
      if (data?.id) trackListingView(data.id);
    } catch (error) {
      console.error('Error fetching shop:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('detail.shop.notFound')}</h2>
          <Link to={backUrl} className="text-green-600 hover:text-green-800">
            {t('category.shop')}
          </Link>
        </div>
      </div>
    );
  }

  const getLocalizedName = () => {
    const key = `name_${locale}` as keyof Listing;
    return (item[key] as string) || item.name;
  };

  const getLocalizedDescription = () => {
    const key = `description_${locale}` as keyof Listing;
    return (item[key] as string) || item.description;
  };

  const isHtmlDescription = (text: string) => /<[a-z][\s\S]*>/i.test(text);

  const getLocalizedImageAlt = () => {
    const key = `image_alt_${locale}` as keyof Listing;
    return (item[key] as string) || item.image_alt_lt || getLocalizedName();
  };

  const slugsByLocale = {
    lt: item.slug_lt || item.slug,
    en: item.slug_en || item.slug,
    pl: item.slug_pl || item.slug,
    de: item.slug_de || item.slug,
    ru: item.slug_ru || item.slug,
    fr: item.slug_fr || item.slug,
  };

  const getLocalizedFeatures = (): string[] => {
    if (locale !== 'lt') {
      const key = `features_${locale}` as keyof Listing;
      const localized = item[key] as string[] | undefined;
      if (localized && localized.length > 0) return localized;
    }
    return (item.features || []).map(tag => translateTag(tag, locale));
  };

  const features = getLocalizedFeatures();
  const openingHours = item.opening_hours || {};
  const translateDay = (day: string) => t(`days.${day}`, day);

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title={`${getLocalizedName()} | Visit Vilnius`}
        description={getLocalizedDescription()}
        image={item.image_url}
        url={window.location.href}
        type="place"
        slugsByLocale={slugsByLocale}
      />
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to={backUrl} className="inline-flex items-center space-x-2 text-green-600 hover:text-green-800 font-medium">
            <ArrowLeft className="w-4 h-4" />
            <span>{t('category.shop')}</span>
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="mb-8">
              <PhotoGallery
                mainImage={item.image_url}
                images={item.gallery_images || []}
                alt={getLocalizedImageAlt()}
              />
            </div>

            <div className="mb-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{getLocalizedName()}</h1>
                  <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                    {t('detail.shop.category')}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full">
                    <Heart className="w-5 h-5 text-gray-600" />
                  </button>
                  <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full">
                    <Share2 className="w-5 h-5 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('detail.shop.about')}</h2>
              <div
                className="text-gray-700 leading-relaxed prose prose-sm max-w-none [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-4 [&_h2]:mb-2 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:my-2 [&_a]:text-amber-600 [&_a]:underline [&_p]:my-2"
                dangerouslySetInnerHTML={{ __html: getLocalizedDescription() }}
              />
            </div>

            {features.length > 0 && (
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('detail.features')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full" />
                      <span className="text-gray-800">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">{t('detail.contacts')}</h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-900">{localizeAddress(item.location, locale)}</span>
                  </div>
                  {item.price_range && (
                    <div className="flex items-center space-x-3">
                      <Clock className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">{localizePriceRange(item.price_range, locale)}</span>
                    </div>
                  )}
                  {item.contact_info?.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <span className="font-medium text-gray-900">{item.contact_info.phone}</span>
                    </div>
                  )}
                  {item.contact_info?.website && (
                    <div className="flex items-center space-x-3">
                      <Globe className="w-5 h-5 text-gray-400" />
                      <a href={item.contact_info.website} target="_blank" rel="noopener noreferrer" className="font-medium text-green-600 hover:underline truncate">
                        {item.contact_info.website}
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {Object.keys(openingHours).length > 0 && (
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{t('detail.openingHours')}</h3>
                  <div className="space-y-2">
                    {Object.entries(openingHours).map(([day, hours]) => (
                      <div key={day} className="flex justify-between">
                        <span className="text-gray-600">{translateDay(day)}</span>
                        <span className="font-medium text-gray-900">{hours as string}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-3">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(getLocalizedName() + ', ' + item.location + ', Vilnius')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                >
                  <Navigation className="w-5 h-5" />
                  <span>{t('detail.showOnMap')}</span>
                </a>
                {item.contact_info?.phone && (
                  <a
                    href={`tel:${item.contact_info.phone}`}
                    className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2 block text-center"
                  >
                    <Phone className="w-5 h-5 inline mr-2" />
                    {t('detail.call')}
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopDetailPage;
