import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MapPin, Clock, Calendar, ChevronRight, ChevronLeft, Star } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { getCategoryUrl, normalizeLocale } from '../lib/localeRoutes';
import { localizePriceRange } from '../utils/locationUtils';
import ResponsiveImage from './ResponsiveImage';

interface Event {
  id: string;
  slug: string;
  name: string;
  description: string;
  event_start_date: string;
  event_end_date: string;
  location: string;
  price_range: string;
  image_url: string;
  is_featured: boolean;
}

type DateFilter = 'all' | 'today' | 'tomorrow' | 'week' | 'weekend' | 'month';

const EventsSection = () => {
  const { t, i18n } = useTranslation();
  const locale = normalizeLocale(i18n.language);
  const categoryPath = getCategoryUrl(locale, 'events');
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<DateFilter>('all');
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];

      const { data, error } = await supabase
        .from('listings')
        .select('id, slug, name, description, event_start_date, event_end_date, location, price_range, image_url, is_featured')
        .eq('category', 'event')
        .eq('status', 'active')
        .or(`event_end_date.is.null,event_end_date.gte.${today}`)
        .order('is_featured', { ascending: false })
        .order('event_start_date', { ascending: true })
        .limit(20);

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', checkScroll, { passive: true });
    checkScroll();
    return () => el.removeEventListener('scroll', checkScroll);
  }, [events]);

  const scroll = (dir: 'left' | 'right') => {
    if (!scrollRef.current) return;
    const cardWidth = 300 + 16;
    scrollRef.current.scrollBy({ left: dir === 'right' ? cardWidth * 2 : -cardWidth * 2, behavior: 'smooth' });
  };

  const getDateRange = (filter: DateFilter) => {
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

  const filteredEvents = events.filter((event) => {
    if (dateFilter === 'all') return true;
    const { todayStr, tomorrowStr, weekEndStr, saturdayStr, sundayStr, monthEndStr } = getDateRange(dateFilter);
    const startDate = event.event_start_date?.split('T')[0];
    const endDate = event.event_end_date?.split('T')[0];
    if (dateFilter === 'today') {
      if (endDate) return startDate <= todayStr && endDate >= todayStr;
      return startDate === todayStr || !startDate;
    }
    if (dateFilter === 'tomorrow') {
      if (endDate) return startDate <= tomorrowStr && endDate >= tomorrowStr;
      return startDate === tomorrowStr;
    }
    if (dateFilter === 'week') return !startDate || startDate <= weekEndStr;
    if (dateFilter === 'weekend') {
      if (endDate) return startDate <= sundayStr && endDate >= saturdayStr;
      return startDate === saturdayStr || startDate === sundayStr;
    }
    if (dateFilter === 'month') {
      if (endDate) return (!startDate || startDate <= monthEndStr) && endDate >= todayStr;
      return !startDate || startDate <= monthEndStr;
    }
    return true;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(locale === 'lt' ? 'lt-LT' : locale, {
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(locale === 'lt' ? 'lt-LT' : locale, {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const dateFilters: { value: DateFilter; label: string }[] = [
    { value: 'all', label: t('filter.dateAll') },
    { value: 'today', label: t('filter.dateToday') },
    { value: 'tomorrow', label: t('filter.dateTomorrow') },
    { value: 'week', label: t('filter.dateThisWeek') },
    { value: 'weekend', label: t('filter.dateWeekend') },
    { value: 'month', label: t('filter.dateThisMonth') },
  ];

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-bold text-gray-900 mb-3">
            {t('events.whatsHappening')}
          </h2>
          <p className="text-lg text-gray-600">
            {t('events.liveEvents')}
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          {dateFilters.map((f) => (
            <button
              key={f.value}
              onClick={() => setDateFilter(f.value)}
              className={`px-4 py-1.5 rounded-full font-medium text-sm transition-all duration-200 ${
                dateFilter === f.value
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white text-gray-600 hover:bg-blue-50 hover:text-blue-600 border border-gray-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">{t('filter.notFoundEvents')}</p>
          </div>
        ) : (
          <div className="relative">
            {canScrollLeft && (
              <button
                onClick={() => scroll('left')}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 bg-white shadow-lg border border-gray-200 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-700" />
              </button>
            )}
            {canScrollRight && (
              <button
                onClick={() => scroll('right')}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 bg-white shadow-lg border border-gray-200 rounded-full w-10 h-10 flex items-center justify-center hover:bg-gray-50 transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-700" />
              </button>
            )}

            <div
              ref={scrollRef}
              className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide scroll-smooth"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {filteredEvents.map((event, index) => (
                <Link
                  key={event.id}
                  to={`${categoryPath}/${event.slug}`}
                  className="flex-none w-72 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300 group"
                >
                  <div className="relative h-44 overflow-hidden">
                    <ResponsiveImage
                      src={event.image_url}
                      alt={event.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      widths={[300, 500, 700]}
                      defaultWidth={600}
                      loading={index < 3 ? 'eager' : 'lazy'}
                      fetchpriority={index === 0 ? 'high' : 'auto'}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    {event.is_featured && (
                      <div className="absolute top-3 left-3 bg-amber-400 text-amber-900 px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1">
                        <Star className="w-3 h-3 fill-amber-900" />
                        {t('common.featured')}
                      </div>
                    )}
                    {event.price_range && (
                      <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm text-gray-800 px-2.5 py-0.5 rounded-full text-xs font-semibold">
                        {localizePriceRange(event.price_range, locale)}
                      </div>
                    )}
                    {event.event_start_date && (
                      <div className="absolute bottom-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-lg text-xs font-bold">
                        {formatDate(event.event_start_date)}
                        {' · '}
                        {formatTime(event.event_start_date)}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-sm font-bold text-gray-900 mb-1.5 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                      {event.name}
                    </h3>

                    {event.location && (
                      <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="line-clamp-1">{event.location}</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-blue-600 font-semibold group-hover:underline flex items-center gap-1">
                        {t('filter.learnMore')}
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <div className="mt-10 text-center">
          <Link
            to={categoryPath}
            className="inline-flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            {t('events.viewAll')}
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </section>
  );
};

export default EventsSection;
