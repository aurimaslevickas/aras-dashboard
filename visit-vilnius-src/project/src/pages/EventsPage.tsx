import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

import { useTranslation } from 'react-i18next';
import { supabase } from '../lib/supabase';
import { getCategoryUrl, normalizeLocale } from '../lib/localeRoutes';
import { Calendar, MapPin, Filter, ChevronRight } from 'lucide-react';
import ArticlesSection from '../components/ArticlesSection';
import { useSectionTexts } from '../lib/useSectionTexts';
import ResponsiveImage from '../components/ResponsiveImage';
import PartnerCTA from '../components/PartnerCTA';

interface Listing {
  id: string;
  slug: string;
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
  location: string;
  image_url: string;
  price_range: string;
  badge: string;
  event_start_date: string;
  event_end_date: string;
  features: string[];
  opening_hours: any;
  image_alt_lt?: string;
  image_alt_en?: string;
  image_alt_pl?: string;
  image_alt_de?: string;
  image_alt_ru?: string;
  image_alt_fr?: string;
}

type DateFilter = 'all' | 'today' | 'tomorrow' | 'week' | 'weekend' | 'month';

export default function EventsPage() {
  const { t, i18n } = useTranslation();
  const locale = normalizeLocale(i18n.language);
  const section = useSectionTexts('events');
  const categoryPath = getCategoryUrl(locale, 'events');
  const [events, setEvents] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDate, setSelectedDate] = useState<DateFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const eventTypes = [
    { value: 'all', label: t('filter.allEvents') },
    { value: 'festival', label: t('filter.festivals') },
    { value: 'concert', label: t('filter.concerts') },
    { value: 'theater', label: t('filter.theater') },
    { value: 'exhibition', label: t('filter.exhibitions') },
    { value: 'sport', label: t('filter.sport') },
    { value: 'food', label: t('filter.foodEvents') },
  ];

  const dateFilters: { value: DateFilter; label: string }[] = [
    { value: 'all', label: t('filter.dateAll') },
    { value: 'today', label: t('filter.dateToday') },
    { value: 'tomorrow', label: t('filter.dateTomorrow') },
    { value: 'week', label: t('filter.dateThisWeek') },
    { value: 'weekend', label: t('filter.dateWeekend') },
    { value: 'month', label: t('filter.dateThisMonth') },
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('category', 'event')
        .eq('status', 'active')
        .or(`event_end_date.is.null,event_end_date.gte.${today}`)
        .order('is_featured', { ascending: false })
        .order('event_end_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDateRange = () => {
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split('T')[0];
    const weekEnd = new Date(now);
    weekEnd.setDate(weekEnd.getDate() + 7);
    const weekEndStr = weekEnd.toISOString().split('T')[0];
    const dayOfWeek = now.getDay();
    const daysUntilSat = (6 - dayOfWeek + 7) % 7 || 7;
    const saturday = new Date(now);
    saturday.setDate(saturday.getDate() + daysUntilSat);
    const sunday = new Date(saturday);
    sunday.setDate(sunday.getDate() + 1);
    const saturdayStr = saturday.toISOString().split('T')[0];
    const sundayStr = sunday.toISOString().split('T')[0];
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const monthEndStr = monthEnd.toISOString().split('T')[0];
    return { todayStr, tomorrowStr, weekEndStr, saturdayStr, sundayStr, monthEndStr };
  };

  const getLocalizedImageAlt = (event: Listing) => {
    const key = `image_alt_${locale}` as keyof Listing;
    return (event[key] as string) || event.image_alt_lt || event.name;
  };

  const filteredEvents = events.filter((event) => {
    const matchesType = selectedType === 'all' || event.features?.includes(selectedType);
    if (!matchesType) return false;

    if (selectedDate === 'all') return true;
    const { todayStr, tomorrowStr, weekEndStr, saturdayStr, sundayStr, monthEndStr } = getDateRange();
    const startDate = event.event_start_date?.split('T')[0];
    const endDate = event.event_end_date?.split('T')[0];

    if (selectedDate === 'today') {
      if (endDate) return (!startDate || startDate <= todayStr) && endDate >= todayStr;
      return !startDate || startDate === todayStr;
    }
    if (selectedDate === 'tomorrow') {
      if (endDate) return (!startDate || startDate <= tomorrowStr) && endDate >= tomorrowStr;
      return startDate === tomorrowStr;
    }
    if (selectedDate === 'week') {
      return !startDate || startDate <= weekEndStr;
    }
    if (selectedDate === 'weekend') {
      if (endDate) return (!startDate || startDate <= sundayStr) && endDate >= saturdayStr;
      return startDate === saturdayStr || startDate === sundayStr;
    }
    if (selectedDate === 'month') {
      if (endDate) return (!startDate || startDate <= monthEndStr) && endDate >= todayStr;
      return !startDate || startDate <= monthEndStr;
    }
    return true;
  });

  const totalPages = Math.ceil(filteredEvents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEvents = filteredEvents.slice(startIndex, startIndex + itemsPerPage);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString(locale === 'lt' ? 'lt-LT' : locale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleTypeChange = (value: string) => {
    setSelectedType(value);
    setCurrentPage(1);
  };

  const handleDateChange = (value: DateFilter) => {
    setSelectedDate(value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-cyan-600 text-white py-10">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-5xl font-bold">{section.title || t('category.event')}</h1>
          </div>
          <p className="text-xl text-blue-100 max-w-3xl">
            {section.description || t('events.liveEvents')}
          </p>
        </div>
      </div>

      <ArticlesSection category="event" />

      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-5">
              <Filter className="w-6 h-6 text-gray-600" />
              <h2 className="text-2xl font-bold text-gray-900">{t('filter.byType')}</h2>
            </div>

            <div className="flex flex-wrap gap-3 mb-6">
              {eventTypes.map((type) => (
                <button
                  key={type.value}
                  onClick={() => handleTypeChange(type.value)}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                    selectedType === type.value
                      ? 'bg-blue-600 text-white shadow-lg scale-105'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {dateFilters.map((df) => (
                <button
                  key={df.value}
                  onClick={() => handleDateChange(df.value)}
                  className={`px-5 py-2 rounded-full font-semibold text-sm transition-all duration-200 ${
                    selectedDate === df.value
                      ? 'bg-cyan-600 text-white shadow-md'
                      : 'bg-gray-50 text-gray-600 hover:bg-cyan-50 hover:text-cyan-700 border border-gray-200'
                  }`}
                >
                  {df.label}
                </button>
              ))}
            </div>
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
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16">
              <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                {t('filter.notFoundEvents')}
              </h3>
              <p className="text-gray-600">
                {t('filter.tryChangeFilters')}
              </p>
            </div>
          ) : (
            <>
              <div className="mb-6 text-gray-600">
                {t('filter.found')} <span className="font-semibold text-gray-900">{filteredEvents.length}</span> {t('filter.events')}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {paginatedEvents.map((event, index) => (
                  <div
                    key={event.id}
                    className="group bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
                  >
                    <div className="relative h-56 overflow-hidden">
                      <ResponsiveImage
                        src={event.image_url || 'https://images.pexels.com/photos/1763075/pexels-photo-1763075.jpeg?auto=compress&cs=tinysrgb&w=800'}
                        alt={getLocalizedImageAlt(event)}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        widths={[400, 600, 800]}
                        defaultWidth={600}
                        loading={index < 3 ? 'eager' : 'lazy'}
                        fetchpriority={index === 0 ? 'high' : 'auto'}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                      {event.badge && (
                        <div className="absolute top-4 left-4 px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-full shadow-lg">
                          {t(`common.${event.badge}`)}
                        </div>
                      )}

                      {event.price_range && (
                        <div className="absolute top-4 right-4 px-3 py-1.5 bg-white/90 backdrop-blur-sm text-gray-900 text-sm font-bold rounded-full shadow-md">
                          {event.price_range}
                        </div>
                      )}

                      {event.event_end_date && (
                        <div className="absolute bottom-4 left-4 px-3 py-1.5 bg-cyan-600 text-white text-xs font-bold rounded-full shadow-lg flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(event.event_end_date)}
                        </div>
                      )}
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors mb-3 line-clamp-2">
                        {event.name}
                      </h3>

                      {event.location && (
                        <div className="flex items-center gap-2 text-gray-600 mb-3">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="text-sm line-clamp-1">{event.location}</span>
                        </div>
                      )}

                      {event.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {event.description}
                        </p>
                      )}

                      {event.features && event.features.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {event.features.slice(0, 3).map((feature) => (
                            <span
                              key={feature}
                              className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full"
                            >
                              {feature}
                            </span>
                          ))}
                        </div>
                      )}

                      <Link
                        to={`${categoryPath}/${event.slug}`}
                        className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors"
                      >
                        {t('filter.learnMore')}
                        <ChevronRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
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
                          currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
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
      </section>

      <PartnerCTA accentColor="blue" />
    </div>
  );
}
