import React, { useState } from 'react';
import {
  X, ChevronLeft, ChevronRight, Calendar, Heart, Wallet,
  Clock, Star, Download, MapPin, Utensils, Trees, Music,
  ShoppingBag, Landmark, Award, Coffee, Moon, Sun, Sunset
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { TRIP_PLANNER_TAG_MAP } from '../lib/suggestedTags';

interface TripPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Preferences {
  duration: '1-day' | '2-3-days' | 'weekend' | 'week' | null;
  interests: string[];
  budget: 'free' | 'budget' | 'moderate' | 'luxury' | null;
}

type TimeSlot = 'morning' | 'midday' | 'afternoon' | 'evening' | 'night';

interface PlannedItem {
  timeSlot: TimeSlot;
  time: string;
  durationMin: number;
  id: string;
  name: string;
  category: string;
  slug: string;
  description: string;
  price_range: string;
  rating: number | null;
  is_featured: boolean;
  michelin_stars: number;
  michelin_nominated: boolean;
  opening_hours: Record<string, string>;
  note?: string;
}

interface DayPlan {
  day: number;
  items: PlannedItem[];
}

const INTEREST_OPTIONS = [
  { value: 'historical', label: 'Istorija', icon: Landmark, color: 'bg-amber-500', categories: ['attraction'], featureTags: TRIP_PLANNER_TAG_MAP.historical },
  { value: 'cultural', label: 'Kultūra', icon: Heart, color: 'bg-rose-500', categories: ['attraction'], featureTags: TRIP_PLANNER_TAG_MAP.cultural },
  { value: 'nature', label: 'Gamta', icon: Trees, color: 'bg-green-500', categories: ['attraction'], featureTags: TRIP_PLANNER_TAG_MAP.nature },
  { value: 'food', label: 'Maistas', icon: Utensils, color: 'bg-orange-500', categories: ['restaurant'], featureTags: TRIP_PLANNER_TAG_MAP.food },
  { value: 'nightlife', label: 'Naktinis gyvenimas', icon: Music, color: 'bg-blue-600', categories: ['bar'], featureTags: TRIP_PLANNER_TAG_MAP.nightlife },
  { value: 'shopping', label: 'Apsipirkimas', icon: ShoppingBag, color: 'bg-pink-500', categories: ['shop'], featureTags: TRIP_PLANNER_TAG_MAP.shopping },
];

const DURATION_OPTIONS = [
  { value: '1-day', label: '1 diena', days: 1 },
  { value: '2-3-days', label: '2–3 dienos', days: 3 },
  { value: 'weekend', label: 'Savaitgalis', days: 2 },
  { value: 'week', label: 'Savaitė', days: 5 },
];

const BUDGET_OPTIONS = [
  { value: 'free', label: 'Nemokama', desc: 'Tik nemokamos veiklos' },
  { value: 'budget', label: 'Taupus', desc: '€ — pigesni variantai' },
  { value: 'moderate', label: 'Vidutinis', desc: '€€ — patogu ir nebrangu' },
  { value: 'luxury', label: 'Prabangus', desc: '€€€€ — michelin, elitinis' },
];

const SLOT_ICONS: Record<TimeSlot, React.FC<{ className?: string }>> = {
  morning: Sun,
  midday: Coffee,
  afternoon: Sunset,
  evening: Moon,
  night: Moon,
};

const SLOT_TIMES: Record<TimeSlot, string> = {
  morning: '09:00',
  midday: '12:30',
  afternoon: '15:00',
  evening: '19:00',
  night: '21:30',
};

const CATEGORY_DURATION: Record<string, number> = {
  attraction: 90,
  restaurant: 75,
  bar: 90,
  shop: 60,
  hotel: 20,
  event: 120,
};

const DAY_NAMES_LT = ['Sekmadienis', 'Pirmadienis', 'Antradienis', 'Trečiadienis', 'Ketvirtadienis', 'Penktadienis', 'Šeštadienis'];

function getDayName(offset: number): string {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return DAY_NAMES_LT[d.getDay()];
}

function isOpenAtTime(opening_hours: Record<string, string>, dayOffset: number, time: string): boolean {
  if (!opening_hours || Object.keys(opening_hours).length === 0) return true;
  if (opening_hours['reception'] === '24/7') return true;

  const d = new Date();
  d.setDate(d.getDate() + dayOffset);
  const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][d.getDay()];

  const hours = opening_hours[dayName];
  if (!hours) return false;
  if (hours.toLowerCase() === 'closed') return false;

  const [open, close] = hours.split('-');
  if (!open || !close) return true;

  const toMins = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + (m || 0);
  };

  const visitMins = toMins(time);
  const openMins = toMins(open.trim());
  let closeMins = toMins(close.trim());
  if (closeMins === 0) closeMins = 24 * 60;

  return visitMins >= openMins && visitMins + 60 <= closeMins;
}

function matchesBudget(price_range: string | null, budget: string): boolean {
  if (!price_range) return true;
  const p = price_range.toLowerCase();
  const free = p.includes('nemokama') || p.includes('free') || p === '€' || p === '';
  const euroCount = (price_range.match(/€/g) || []).length;

  if (budget === 'free') return free || euroCount <= 1;
  if (budget === 'budget') return free || euroCount <= 2;
  if (budget === 'moderate') return euroCount <= 3;
  if (budget === 'luxury') return true;
  return true;
}

function scoreListing(item: any, interests: string[], budget: string): number {
  let score = 0;
  if (item.is_featured) score += 10;
  if (item.michelin_stars > 0) score += item.michelin_stars * 8;
  if (item.michelin_nominated) score += 5;
  if (item.rating) score += Number(item.rating) * 2;
  if (!matchesBudget(item.price_range, budget)) score -= 50;

  if (interests.length > 0 && item.features && item.features.length > 0) {
    const wantedTags = new Set<string>();
    interests.forEach(interest => {
      const opt = INTEREST_OPTIONS.find(o => o.value === interest);
      opt?.featureTags.forEach(tag => wantedTags.add(tag.toLowerCase()));
    });
    const itemFeatures = item.features.map((f: string) => f.toLowerCase());
    const matchCount = itemFeatures.filter((f: string) => wantedTags.has(f)).length;
    score += matchCount * 15;
  }

  return score;
}

type DBListing = {
  id: string;
  name: string;
  category: string;
  slug: string;
  description: string;
  price_range: string;
  rating: string | null;
  is_featured: boolean;
  michelin_stars: number;
  michelin_nominated: boolean;
  opening_hours: Record<string, string>;
  features: string[] | null;
};

function buildDaySchedule(
  pool: DBListing[],
  interests: string[],
  budget: string,
  dayOffset: number,
  usedIds: Set<string>
): PlannedItem[] {
  const categoriesWanted = new Set<string>();
  interests.forEach(i => {
    const opt = INTEREST_OPTIONS.find(o => o.value === i);
    opt?.categories.forEach(c => categoriesWanted.add(c));
  });
  if (interests.length === 0) {
    ['attraction', 'restaurant'].forEach(c => categoriesWanted.add(c));
  }

  const alwaysAdd = ['restaurant'];
  alwaysAdd.forEach(c => categoriesWanted.add(c));

  const slots: { slot: TimeSlot; category: string; required: boolean }[] = [];

  slots.push({ slot: 'morning', category: 'attraction', required: true });
  slots.push({ slot: 'midday', category: 'restaurant', required: true });

  if (categoriesWanted.has('shop')) {
    slots.push({ slot: 'afternoon', category: 'shop', required: false });
  } else if (categoriesWanted.has('attraction')) {
    slots.push({ slot: 'afternoon', category: 'attraction', required: false });
  }

  if (categoriesWanted.has('bar') || interests.includes('nightlife')) {
    slots.push({ slot: 'evening', category: 'restaurant', required: false });
    slots.push({ slot: 'night', category: 'bar', required: false });
  } else {
    slots.push({ slot: 'evening', category: 'restaurant', required: true });
  }

  const result: PlannedItem[] = [];

  for (const { slot, category, required } of slots) {
    const time = SLOT_TIMES[slot];
    const candidates = pool
      .filter(p => p.category === category)
      .filter(p => !usedIds.has(p.id))
      .filter(p => isOpenAtTime(p.opening_hours, dayOffset, time))
      .filter(p => matchesBudget(p.price_range, budget))
      .map(p => ({ ...p, _score: scoreListing(p, interests, budget) }))
      .sort((a, b) => b._score - a._score);

    if (candidates.length === 0) {
      const fallback = pool
        .filter(p => p.category === category)
        .filter(p => !usedIds.has(p.id))
        .map(p => ({ ...p, _score: scoreListing(p, interests, budget) }))
        .sort((a, b) => b._score - a._score);

      if (fallback.length === 0) continue;
      const chosen = fallback[0];
      usedIds.add(chosen.id);
      result.push({
        timeSlot: slot,
        time,
        durationMin: CATEGORY_DURATION[category] || 60,
        id: chosen.id,
        name: chosen.name,
        category: chosen.category,
        slug: chosen.slug,
        description: chosen.description || '',
        price_range: chosen.price_range || '',
        rating: chosen.rating ? Number(chosen.rating) : null,
        is_featured: chosen.is_featured,
        michelin_stars: chosen.michelin_stars,
        michelin_nominated: chosen.michelin_nominated,
        opening_hours: chosen.opening_hours,
        note: 'Gali būti uždara — patikrinkite valandas',
      });
      continue;
    }

    const chosen = candidates[0];
    usedIds.add(chosen.id);
    result.push({
      timeSlot: slot,
      time,
      durationMin: CATEGORY_DURATION[category] || 60,
      id: chosen.id,
      name: chosen.name,
      category: chosen.category,
      slug: chosen.slug,
      description: chosen.description || '',
      price_range: chosen.price_range || '',
      rating: chosen.rating ? Number(chosen.rating) : null,
      is_featured: chosen.is_featured,
      michelin_stars: chosen.michelin_stars,
      michelin_nominated: chosen.michelin_nominated,
      opening_hours: chosen.opening_hours,
    });
  }

  return result;
}

function addTime(base: string, minutes: number): string {
  const [h, m] = base.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const nh = Math.floor(total / 60) % 24;
  const nm = total % 60;
  return `${String(nh).padStart(2, '0')}:${String(nm).padStart(2, '0')}`;
}

function reassignTimes(items: PlannedItem[]): PlannedItem[] {
  const result: PlannedItem[] = [];
  let cursor = '09:00';
  for (const item of items) {
    result.push({ ...item, time: cursor });
    cursor = addTime(cursor, item.durationMin + 30);
  }
  return result;
}

const categoryRoutes: Record<string, string> = {
  attraction: 'see',
  restaurant: 'eat',
  bar: 'bar',
  shop: 'shop',
  hotel: 'stay',
  event: 'events',
};

const categoryColors: Record<string, string> = {
  attraction: 'bg-amber-100 text-amber-800 border-amber-200',
  restaurant: 'bg-orange-100 text-orange-800 border-orange-200',
  bar: 'bg-blue-100 text-blue-800 border-blue-200',
  shop: 'bg-pink-100 text-pink-800 border-pink-200',
  hotel: 'bg-gray-100 text-gray-700 border-gray-200',
  event: 'bg-green-100 text-green-800 border-green-200',
};

const categoryLabels: Record<string, string> = {
  attraction: 'Lankytina vieta',
  restaurant: 'Restoranas',
  bar: 'Baras',
  shop: 'Parduotuvė',
  hotel: 'Viešbutis',
  event: 'Renginys',
};

const TripPlannerModal: React.FC<TripPlannerModalProps> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState(1);
  const [preferences, setPreferences] = useState<Preferences>({ duration: null, interests: [], budget: null });
  const [itinerary, setItinerary] = useState<DayPlan[]>([]);
  const [generating, setGenerating] = useState(false);
  const [activeDay, setActiveDay] = useState(0);

  const totalDays = DURATION_OPTIONS.find(d => d.value === preferences.duration)?.days ?? 1;

  const generateItinerary = async () => {
    if (!preferences.budget || !preferences.duration) return;
    setGenerating(true);

    const categoriesNeeded = new Set<string>(['attraction', 'restaurant']);
    preferences.interests.forEach(i => {
      const opt = INTEREST_OPTIONS.find(o => o.value === i);
      opt?.categories.forEach(c => categoriesNeeded.add(c));
    });

    const { data } = await supabase
      .from('listings')
      .select('id, name, category, slug, description, price_range, rating, is_featured, michelin_stars, michelin_nominated, opening_hours, features')
      .eq('status', 'active')
      .in('category', Array.from(categoriesNeeded))
      .order('is_featured', { ascending: false })
      .order('rating', { ascending: false });

    const pool: DBListing[] = data || [];
    const usedIds = new Set<string>();
    const plans: DayPlan[] = [];

    for (let day = 0; day < totalDays; day++) {
      const items = buildDaySchedule(pool, preferences.interests, preferences.budget, day, usedIds);
      plans.push({ day: day + 1, items: reassignTimes(items) });
    }

    setItinerary(plans);
    setActiveDay(0);
    setGenerating(false);
    setStep(4);
  };

  const reset = () => {
    setStep(1);
    setPreferences({ duration: null, interests: [], budget: null });
    setItinerary([]);
    setActiveDay(0);
  };

  if (!isOpen) return null;

  const stepCount = 3;
  const progress = step < 4 ? ((step - 1) / stepCount) * 100 : 100;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div
        className="bg-white w-full sm:rounded-2xl sm:max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 text-white px-6 py-4 flex-shrink-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xl font-bold tracking-tight">Planuoti kelionę</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-white/20 rounded-full transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          {step < 4 && (
            <div className="h-1.5 bg-white/20 rounded-full overflow-hidden">
              <div
                className="h-full bg-white rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5">
          {step === 1 && (
            <div>
              <div className="flex items-center gap-2 mb-5">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Kiek dienų lankysitės?</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                {DURATION_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { setPreferences(p => ({ ...p, duration: opt.value as any })); setStep(2); }}
                    className={`p-5 border-2 rounded-xl text-center font-semibold transition-all hover:scale-105 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700 ${preferences.duration === opt.value ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-800'}`}
                  >
                    <div className="text-2xl font-black mb-1">{opt.label}</div>
                    <div className="text-xs text-gray-500">{opt.days === 1 ? '1 dienos programa' : `${opt.days} dienų programa`}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Kas jus domina?</h3>
              </div>
              <p className="text-sm text-gray-500 mb-5">Pasirinkite vieną ar kelis pomėgius</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {INTEREST_OPTIONS.map(opt => {
                  const Icon = opt.icon;
                  const selected = preferences.interests.includes(opt.value);
                  return (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setPreferences(p => ({
                          ...p,
                          interests: selected
                            ? p.interests.filter(i => i !== opt.value)
                            : [...p.interests, opt.value],
                        }));
                      }}
                      className={`p-4 rounded-xl border-2 flex items-center gap-3 font-semibold transition-all ${selected ? 'border-blue-500 bg-blue-50 text-blue-800' : 'border-gray-200 text-gray-800 hover:border-gray-300'}`}
                    >
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${opt.color}`}>
                        <Icon className="w-5 h-5 text-white" />
                      </div>
                      <span className="text-sm">{opt.label}</span>
                    </button>
                  );
                })}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold flex items-center justify-center gap-2 hover:bg-gray-50">
                  <ChevronLeft className="w-4 h-4" /> Atgal
                </button>
                <button
                  onClick={() => setStep(3)}
                  disabled={preferences.interests.length === 0}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Toliau <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wallet className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-bold text-gray-900">Koks jūsų biudžetas?</h3>
              </div>
              <p className="text-sm text-gray-500 mb-5">Pagal tai filtruosime vietas</p>
              <div className="space-y-2 mb-6">
                {BUDGET_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => setPreferences(p => ({ ...p, budget: opt.value as any }))}
                    className={`w-full p-4 rounded-xl border-2 text-left flex items-center justify-between transition-all ${preferences.budget === opt.value ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}
                  >
                    <div>
                      <div className={`font-semibold ${preferences.budget === opt.value ? 'text-blue-800' : 'text-gray-900'}`}>{opt.label}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{opt.desc}</div>
                    </div>
                    {preferences.budget === opt.value && (
                      <div className="w-4 h-4 rounded-full bg-blue-600 flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(2)} className="flex-1 py-3 border-2 border-gray-200 rounded-xl text-gray-700 font-semibold flex items-center justify-center gap-2 hover:bg-gray-50">
                  <ChevronLeft className="w-4 h-4" /> Atgal
                </button>
                <button
                  onClick={generateItinerary}
                  disabled={!preferences.budget || generating}
                  className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {generating ? (
                    <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Kuriama...</>
                  ) : (
                    <>Sudaryti planą <ChevronRight className="w-4 h-4" /></>
                  )}
                </button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div>
              <div className="flex items-start justify-between mb-4 gap-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">Jūsų maršrutas</h3>
                  <p className="text-sm text-gray-500 mt-0.5">
                    {DURATION_OPTIONS.find(d => d.value === preferences.duration)?.label} · {BUDGET_OPTIONS.find(b => b.value === preferences.budget)?.label}
                  </p>
                </div>
                <button
                  onClick={() => window.print()}
                  className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 text-sm border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Download className="w-4 h-4" /> PDF
                </button>
              </div>

              {itinerary.length > 1 && (
                <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
                  {itinerary.map((day, idx) => (
                    <button
                      key={day.day}
                      onClick={() => setActiveDay(idx)}
                      className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all ${activeDay === idx ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                    >
                      {idx + 1} diena
                    </button>
                  ))}
                </div>
              )}

              {itinerary[activeDay] && (
                <div>
                  {itinerary.length > 1 && (
                    <div className="flex items-center gap-2 text-xs text-gray-500 mb-4">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{getDayName(activeDay)}</span>
                    </div>
                  )}

                  <div className="relative">
                    <div className="absolute left-[42px] top-0 bottom-0 w-px bg-gray-100" />
                    <div className="space-y-1">
                      {itinerary[activeDay].items.map((item, idx) => {
                        const SlotIcon = SLOT_ICONS[item.timeSlot];
                        const routeBase = categoryRoutes[item.category] || item.category;
                        return (
                          <div key={idx} className="relative flex gap-4">
                            <div className="flex-shrink-0 flex flex-col items-center gap-1 pt-3">
                              <div className="w-9 h-9 rounded-full bg-blue-50 border-2 border-blue-100 flex items-center justify-center z-10">
                                <SlotIcon className="w-4 h-4 text-blue-500" />
                              </div>
                              <span className="text-[11px] font-mono text-gray-400 tabular-nums">{item.time}</span>
                            </div>

                            <div className="flex-1 bg-white border border-gray-100 rounded-xl p-4 mb-3 hover:border-gray-200 hover:shadow-sm transition-all">
                              <div className="flex items-start justify-between gap-3 mb-1.5">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                                    <h4 className="font-bold text-gray-900 text-base leading-tight">{item.name}</h4>
                                    {item.michelin_stars > 0 && (
                                      <span className="flex items-center gap-0.5 text-xs bg-red-50 text-red-700 border border-red-200 px-1.5 py-0.5 rounded-full font-semibold">
                                        <Award className="w-3 h-3" />
                                        {'★'.repeat(item.michelin_stars)} Michelin
                                      </span>
                                    )}
                                    {item.michelin_nominated && !item.michelin_stars && (
                                      <span className="text-xs bg-red-50 text-red-600 border border-red-200 px-1.5 py-0.5 rounded-full font-semibold">Michelin</span>
                                    )}
                                    {item.is_featured && !item.michelin_stars && !item.michelin_nominated && (
                                      <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full font-semibold">Rekomenduojama</span>
                                    )}
                                  </div>
                                  <span className={`inline-block text-xs px-2 py-0.5 rounded-md border font-medium ${categoryColors[item.category] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                                    {categoryLabels[item.category] || item.category}
                                  </span>
                                </div>
                                <Link
                                  to={`/${routeBase}/${item.slug}`}
                                  onClick={onClose}
                                  className="flex-shrink-0 flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-semibold border border-blue-200 hover:border-blue-400 rounded-lg px-2.5 py-1.5 transition-colors"
                                >
                                  <MapPin className="w-3 h-3" /> Rodyti
                                </Link>
                              </div>

                              {item.description && (
                                <p className="text-sm text-gray-600 mb-2 line-clamp-2">{item.description}</p>
                              )}

                              <div className="flex items-center gap-3 flex-wrap">
                                {item.rating !== null && (
                                  <span className="flex items-center gap-1 text-sm text-yellow-600 font-semibold">
                                    <Star className="w-3.5 h-3.5 fill-current" />
                                    {item.rating.toFixed(1)}
                                  </span>
                                )}
                                {item.price_range && (
                                  <span className="text-sm text-gray-500 font-medium">{item.price_range}</span>
                                )}
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  ~{item.durationMin} min.
                                </span>
                                {item.note && (
                                  <span className="text-xs text-orange-600 font-medium">{item.note}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              <button
                onClick={reset}
                className="w-full mt-4 py-3 border-2 border-blue-200 text-blue-700 rounded-xl font-semibold hover:bg-blue-50 transition-colors"
              >
                Planuoti iš naujo
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TripPlannerModal;
