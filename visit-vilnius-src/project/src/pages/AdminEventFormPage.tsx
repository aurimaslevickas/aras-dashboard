import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, X, Languages, CheckCircle, AlertCircle, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AdminLayout from '../components/admin/AdminLayout';
import { useTranslate } from '../lib/useTranslate';
import { generateSlug, ensureUniqueSlug } from '../utils/slugUtils';
import ImageUploadField from '../components/admin/ImageUploadField';
import GalleryUploadField from '../components/admin/GalleryUploadField';
import { EVENT_TAG_GROUPS } from '../lib/suggestedTags';

interface EventFormData {
  name: string;
  slug: string;
  description: string;
  organizer: string;
  image_url: string;
  gallery_images: string[];
  location: string;
  price_range: string;
  event_start_date: string;
  event_start_time: string;
  event_end_date: string;
  event_end_time: string;
  badge: string;
  status: string;
  features: string[];
  contact_info: { email?: string; phone?: string; website?: string };
  name_en: string;
  name_pl: string;
  name_de: string;
  name_ru: string;
  name_fr: string;
  slug_en: string;
  slug_pl: string;
  slug_de: string;
  slug_ru: string;
  slug_fr: string;
  description_en: string;
  description_pl: string;
  description_de: string;
  description_ru: string;
  description_fr: string;
  image_alt_lt: string;
  image_alt_en: string;
  image_alt_pl: string;
  image_alt_de: string;
  image_alt_ru: string;
  image_alt_fr: string;
}


const LANG_LABELS: Record<string, string> = {
  en: 'English',
  pl: 'Polski',
  de: 'Deutsch',
  ru: 'Русский',
  fr: 'Français',
};

const LANGS = ['en', 'pl', 'de', 'ru', 'fr'] as const;

const AdminEventFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const { translate, translating, translateError } = useTranslate();

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newFeature, setNewFeature] = useState('');
  const [showTagSuggestions, setShowTagSuggestions] = useState(true);
  const [activeTab, setActiveTab] = useState<'lt' | 'translations'>('lt');
  const [translateSuccess, setTranslateSuccess] = useState(false);

  const [priceMode, setPriceMode] = useState<'free' | 'fixed' | 'range'>('free');
  const [priceFrom, setPriceFrom] = useState('');
  const [priceTo, setPriceTo] = useState('');

  const [formData, setFormData] = useState<EventFormData>({
    name: '',
    slug: '',
    description: '',
    organizer: '',
    image_url: '',
    gallery_images: [],
    location: '',
    price_range: 'Nemokama',
    event_start_date: '',
    event_start_time: '',
    event_end_date: '',
    event_end_time: '',
    badge: '',
    status: 'active',
    features: [],
    contact_info: {},
    name_en: '', name_pl: '', name_de: '', name_ru: '', name_fr: '',
    slug_en: '', slug_pl: '', slug_de: '', slug_ru: '', slug_fr: '',
    description_en: '', description_pl: '', description_de: '', description_ru: '', description_fr: '',
    image_alt_lt: '',
    image_alt_en: '',
    image_alt_pl: '',
    image_alt_de: '',
    image_alt_ru: '',
    image_alt_fr: '',
  });
  const [showLocationHint, setShowLocationHint] = useState(false);

  useEffect(() => {
    if (isEdit && id) {
      loadEvent();
    }
  }, [id]);

  const loadEvent = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .eq('category', 'event')
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setError('Renginys nerastas');
        return;
      }

      const parseDate = (val: string | null) => val ? val.split('T')[0] : '';
      const parseTime = (val: string | null) => {
        if (!val) return '';
        const t = val.includes('T') ? val.split('T')[1] : '';
        return t ? t.substring(0, 5) : '';
      };

      const rawPrice = data.price_range || 'Nemokama';
      if (rawPrice === 'Nemokama' || rawPrice === '' || rawPrice === null) {
        setPriceMode('free');
      } else if (rawPrice.includes('–')) {
        setPriceMode('range');
        const parts = rawPrice.replace(/€/g, '').split('–');
        setPriceFrom(parts[0]?.trim() || '');
        setPriceTo(parts[1]?.trim() || '');
      } else {
        setPriceMode('fixed');
        setPriceFrom(rawPrice.replace(/€/g, '').trim());
      }

      setFormData({
        name: data.name || '',
        slug: data.slug || '',
        description: data.description || '',
        organizer: data.organizer || '',
        image_url: data.image_url || '',
        gallery_images: data.gallery_images || [],
        location: data.location || '',
        price_range: rawPrice,
        event_start_date: parseDate(data.event_start_date),
        event_start_time: parseTime(data.event_start_date),
        event_end_date: parseDate(data.event_end_date),
        event_end_time: parseTime(data.event_end_date),
        badge: data.badge || '',
        status: data.status || 'active',
        features: data.features || [],
        contact_info: data.contact_info || {},
        name_en: data.name_en || '',
        name_pl: data.name_pl || '',
        name_de: data.name_de || '',
        name_ru: data.name_ru || '',
        name_fr: data.name_fr || '',
        slug_en: data.slug_en || '',
        slug_pl: data.slug_pl || '',
        slug_de: data.slug_de || '',
        slug_ru: data.slug_ru || '',
        slug_fr: data.slug_fr || '',
        description_en: data.description_en || '',
        description_pl: data.description_pl || '',
        description_de: data.description_de || '',
        description_ru: data.description_ru || '',
        description_fr: data.description_fr || '',
        image_alt_lt: data.image_alt_lt || '',
        image_alt_en: data.image_alt_en || '',
        image_alt_pl: data.image_alt_pl || '',
        image_alt_de: data.image_alt_de || '',
        image_alt_ru: data.image_alt_ru || '',
        image_alt_fr: data.image_alt_fr || '',
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Klaida kraunant renginį');
    } finally {
      setLoading(false);
    }
  };

  const handleAutoTranslate = async () => {
    if (!formData.name && !formData.description) return;
    setTranslateSuccess(false);

    const altLt = formData.image_alt_lt || formData.name;

    const fieldsToTranslate: Record<string, string> = {
      name: formData.name,
      description: formData.description,
    };
    if (altLt) fieldsToTranslate.image_alt = altLt;

    const result = await translate(fieldsToTranslate);

    if (result) {
      const uniqueSlugs: Record<string, string> = {};
      for (const lang of LANGS) {
        const baseSlug = result[lang]?.slug || generateSlug(result[lang]?.name || '');
        if (baseSlug) {
          uniqueSlugs[lang] = await ensureUniqueSlug(supabase, `slug_${lang}`, baseSlug, id);
        }
      }

      setFormData(prev => ({
        ...prev,
        name_en: result.en?.name || prev.name_en,
        name_pl: result.pl?.name || prev.name_pl,
        name_de: result.de?.name || prev.name_de,
        name_ru: result.ru?.name || prev.name_ru,
        name_fr: result.fr?.name || prev.name_fr,
        slug_en: uniqueSlugs.en || prev.slug_en,
        slug_pl: uniqueSlugs.pl || prev.slug_pl,
        slug_de: uniqueSlugs.de || prev.slug_de,
        slug_ru: uniqueSlugs.ru || prev.slug_ru,
        slug_fr: uniqueSlugs.fr || prev.slug_fr,
        description_en: result.en?.description || prev.description_en,
        description_pl: result.pl?.description || prev.description_pl,
        description_de: result.de?.description || prev.description_de,
        description_ru: result.ru?.description || prev.description_ru,
        description_fr: result.fr?.description || prev.description_fr,
        image_alt_en: result.en?.image_alt || prev.image_alt_en,
        image_alt_pl: result.pl?.image_alt || prev.image_alt_pl,
        image_alt_de: result.de?.image_alt || prev.image_alt_de,
        image_alt_ru: result.ru?.image_alt || prev.image_alt_ru,
        image_alt_fr: result.fr?.image_alt || prev.image_alt_fr,
      }));
      setTranslateSuccess(true);
      setActiveTab('translations');
      setTimeout(() => setTranslateSuccess(false), 4000);
    }
  };

  const buildPriceRange = () => {
    if (priceMode === 'free') return 'Nemokama';
    if (priceMode === 'fixed') return priceFrom ? `€${priceFrom}` : 'Nemokama';
    if (priceMode === 'range') {
      if (priceFrom && priceTo) return `€${priceFrom}–€${priceTo}`;
      if (priceFrom) return `€${priceFrom}`;
      return 'Nemokama';
    }
    return 'Nemokama';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    if (!formData.image_url) {
      setError('Privaloma įkelti pagrindinę nuotrauką.');
      setSaving(false);
      return;
    }

    if (!formData.event_end_date) {
      setError('Privaloma nurodyti pabaigos datą.');
      setSaving(false);
      return;
    }

    try {
      const uniqueSlug = await ensureUniqueSlug(supabase, 'slug', formData.slug, id);

      const buildDatetime = (date: string, time: string) => {
        if (!date) return null;
        return time ? `${date}T${time}:00` : `${date}T00:00:00`;
      };

      const { event_start_time, event_end_time, ...rest } = formData;
      const payload = {
        ...rest,
        slug: uniqueSlug,
        category: 'event',
        rating: 0,
        price_range: buildPriceRange(),
        event_start_date: buildDatetime(formData.event_start_date, event_start_time),
        event_end_date: buildDatetime(formData.event_end_date, event_end_time),
      };

      if (isEdit) {
        const { error } = await supabase
          .from('listings')
          .update(payload)
          .eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('listings')
          .insert([payload]);
        if (error) throw error;
      }

      navigate('/admin/events');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Klaida išsaugant renginį');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else if (name === 'name') {
      setFormData((prev) => ({ ...prev, name: value, slug: generateSlug(value) }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleContactChange = (field: string, value: string) => {
    let finalValue = value;
    if (field === 'website' && value && !value.startsWith('http://') && !value.startsWith('https://')) {
      if (value.startsWith('www.')) {
        finalValue = 'https://' + value;
      }
    }
    setFormData((prev) => ({
      ...prev,
      contact_info: { ...prev.contact_info, [field]: finalValue }
    }));
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData((prev) => ({ ...prev, features: [...prev.features, newFeature.trim()] }));
      setNewFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    setFormData((prev) => ({ ...prev, features: prev.features.filter((f) => f !== feature) }));
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <button
          onClick={() => navigate('/admin/events')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          Atgal į renginius
        </button>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {isEdit ? 'Redaguoti renginį' : 'Naujas renginys'}
            </h1>
            <button
              type="button"
              onClick={handleAutoTranslate}
              disabled={translating || (!formData.name && !formData.description)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
            >
              {translating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Languages className="w-4 h-4" />
              )}
              {translating ? 'Verčiama...' : 'Auto-vertimas'}
            </button>
          </div>

          {translateSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              Vertimai sėkmingai sugeneruoti
            </div>
          )}

          {translateError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {translateError}
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
              {error}
            </div>
          )}

          <div className="flex border-b border-gray-200 mb-6">
            <button
              type="button"
              onClick={() => setActiveTab('lt')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'lt'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Lietuvių
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('translations')}
              className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                activeTab === 'translations'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              Vertimai (EN, PL, DE, RU, FR)
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {activeTab === 'lt' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pavadinimas *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Aprašymas *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={4}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Organizatorius</label>
                  <input
                    type="text"
                    name="organizer"
                    value={formData.organizer}
                    onChange={handleChange}
                    placeholder="pvz. Baleto teatras, Raganiukės teatras"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-1">Naudojama statistikai ir filtravimui</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1.5">
                    Vieta *
                    <button
                      type="button"
                      className="relative"
                      onMouseEnter={() => setShowLocationHint(true)}
                      onMouseLeave={() => setShowLocationHint(false)}
                      onFocus={() => setShowLocationHint(true)}
                      onBlur={() => setShowLocationHint(false)}
                    >
                      <HelpCircle className="w-4 h-4 text-gray-400 hover:text-gray-600" />
                      {showLocationHint && (
                        <div className="absolute left-6 top-0 z-20 w-72 bg-gray-900 text-white text-xs rounded-lg p-3 shadow-xl leading-relaxed">
                          <p className="font-semibold mb-1">Kaip pildyti lauką "Vieta"?</p>
                          <p>Rašykite aiškų, tikslų vietos pavadinimą, kurį lankytojui bus lengva rasti.</p>
                          <p className="mt-1.5 text-gray-300">Pavyzdžiai:</p>
                          <ul className="mt-0.5 space-y-0.5 text-gray-300">
                            <li>• Šiaulių arena, Šiauliai</li>
                            <li>• Vilniaus katedros aikštė</li>
                            <li>• Žalgirio arena, Kaunas</li>
                            <li>• Online (nuotolinis renginys)</li>
                          </ul>
                          <div className="absolute -left-1.5 top-1.5 w-3 h-3 bg-gray-900 rotate-45" />
                        </div>
                      )}
                    </button>
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    placeholder="pvz. Vilniaus katedros aikštė"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pradžios data *</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      name="event_start_date"
                      value={formData.event_start_date}
                      onChange={handleChange}
                      required
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="time"
                      name="event_start_time"
                      value={formData.event_start_time}
                      onChange={handleChange}
                      placeholder="Laikas"
                      className="w-32 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Laikas neprivalomas</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pabaigos data *</label>
                  <div className="flex gap-2">
                    <input
                      type="date"
                      name="event_end_date"
                      value={formData.event_end_date}
                      onChange={handleChange}
                      min={formData.event_start_date || undefined}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="time"
                      name="event_end_time"
                      value={formData.event_end_time}
                      onChange={handleChange}
                      className="w-32 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Vienos dienos renginiui įveskite tą pačią datą kaip pradžia</p>
                </div>

                <div className="md:col-span-2">
                  <ImageUploadField
                    value={formData.image_url}
                    onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                    label="Pagrindinė nuotrauka *"
                  />
                  {!formData.image_url && (
                    <p className="text-xs text-red-500 mt-1">Nuotrauka privaloma</p>
                  )}
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      Alt tekstas nuotraukai (LT)
                      <span className="text-xs font-normal text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">SEO</span>
                    </label>
                    <input
                      type="text"
                      name="image_alt_lt"
                      value={formData.image_alt_lt}
                      onChange={handleChange}
                      placeholder={`pvz. ${formData.name || 'Renginio pavadinimas'}, Vilnius`}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-400 mt-1">Aprašo nuotrauką paieškos varikliams. Automatiškai išverčiamas paspaudus "Auto-vertimas".</p>
                  </div>
                </div>

                <div className="md:col-span-2">
                  <GalleryUploadField
                    images={formData.gallery_images}
                    onChange={(images) => setFormData(prev => ({ ...prev, gallery_images: images }))}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Kaina</label>
                  <div className="flex gap-2 mb-2">
                    {(['free', 'fixed', 'range'] as const).map(mode => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setPriceMode(mode)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                          priceMode === mode
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white text-gray-600 border-gray-300 hover:border-blue-400'
                        }`}
                      >
                        {mode === 'free' ? 'Nemokama' : mode === 'fixed' ? 'Fiksuota kaina' : 'Kainų ribos'}
                      </button>
                    ))}
                  </div>
                  {priceMode === 'fixed' && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-medium">€</span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={priceFrom}
                        onChange={e => setPriceFrom(e.target.value)}
                        placeholder="pvz. 10"
                        className="w-40 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                  {priceMode === 'range' && (
                    <div className="flex items-center gap-2">
                      <span className="text-gray-500 font-medium">€</span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={priceFrom}
                        onChange={e => setPriceFrom(e.target.value)}
                        placeholder="nuo"
                        className="w-32 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <span className="text-gray-400">–</span>
                      <span className="text-gray-500 font-medium">€</span>
                      <input
                        type="number"
                        min="0"
                        step="0.5"
                        value={priceTo}
                        onChange={e => setPriceTo(e.target.value)}
                        placeholder="iki"
                        className="w-32 px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  )}
                  {priceMode !== 'free' && (
                    <p className="text-xs text-gray-400 mt-1">Bus rodoma: <span className="font-medium text-gray-600">{buildPriceRange()}</span></p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Statusas</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="active">Aktyvus</option>
                    <option value="inactive">Neaktyvus</option>
                    <option value="pending">Laukia patvirtinimo</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Žymekliai</label>

                  <div className="mb-3">
                    <button
                      type="button"
                      onClick={() => setShowTagSuggestions(v => !v)}
                      className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 font-medium mb-2"
                    >
                      {showTagSuggestions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      Rekomenduojami žymekliai (Trip Planner filtravimui)
                    </button>
                    {showTagSuggestions && (
                      <div className="border border-blue-200 rounded-lg p-3 bg-blue-50 space-y-3">
                        <p className="text-xs text-blue-700">Spustelėkite žymeklį kad pridėtumėte. Šie žymekliai naudojami "Plan a Trip" filtravimui pagal pomėgius.</p>
                        {EVENT_TAG_GROUPS.map(group => (
                          <div key={group.group}>
                            <p className="text-xs font-semibold text-gray-600 mb-1.5">{group.icon} {group.group}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {group.tags.map(tag => {
                                const alreadyAdded = formData.features.includes(tag);
                                return (
                                  <button
                                    key={tag}
                                    type="button"
                                    onClick={() => {
                                      if (alreadyAdded) {
                                        removeFeature(tag);
                                      } else {
                                        setFormData(prev => ({ ...prev, features: [...prev.features, tag] }));
                                      }
                                    }}
                                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                                      alreadyAdded
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-100'
                                    }`}
                                  >
                                    {alreadyAdded ? '✓ ' : '+ '}{tag}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={newFeature}
                      onChange={(e) => setNewFeature(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeature(); }}}
                      placeholder="Arba rašykite savo žymeklį..."
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <button
                      type="button"
                      onClick={addFeature}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm transition-colors"
                    >
                      Pridėti
                    </button>
                  </div>
                  {formData.features.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {formData.features.map((feature) => (
                        <span
                          key={feature}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {feature}
                          <button type="button" onClick={() => removeFeature(feature)} className="hover:text-blue-900">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">El. paštas</label>
                  <input
                    type="email"
                    value={formData.contact_info.email || ''}
                    onChange={(e) => handleContactChange('email', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Telefonas</label>
                  <input
                    type="tel"
                    value={formData.contact_info.phone || ''}
                    onChange={(e) => handleContactChange('phone', e.target.value)}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Svetainė</label>
                  <input
                    type="text"
                    value={formData.contact_info.website || ''}
                    onChange={(e) => handleContactChange('website', e.target.value)}
                    onBlur={(e) => {
                      const val = e.target.value.trim();
                      if (val && !val.startsWith('http://') && !val.startsWith('https://')) {
                        handleContactChange('website', 'https://' + val);
                      }
                    }}
                    placeholder="pvz. www.renginys.lt arba https://renginys.lt"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-400 mt-1">https:// bus pridėta automatiškai jei nenurodyta</p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Ženklelis</label>
                  <select
                    name="badge"
                    value={formData.badge}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">— Nėra ženklelio —</option>
                    <option value="featured">Rekomenduojama</option>
                    <option value="free_entry">Nemokamas įėjimas</option>
                    <option value="must_try">Privaloma išbandyti</option>
                    <option value="new">Nauja</option>
                    <option value="popular">Populiaru</option>
                  </select>
                </div>
              </div>
            )}

            {activeTab === 'translations' && (
              <div className="space-y-8">
                {LANGS.map((lang) => (
                  <div key={lang} className="border border-gray-200 rounded-xl p-5">
                    <h3 className="text-base font-semibold text-gray-900 mb-4">{LANG_LABELS[lang]}</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pavadinimas</label>
                        <input
                          type="text"
                          value={(formData as any)[`name_${lang}`]}
                          onChange={(e) => setFormData(prev => ({ ...prev, [`name_${lang}`]: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                        <input
                          type="text"
                          value={(formData as any)[`slug_${lang}`]}
                          onChange={(e) => setFormData(prev => ({ ...prev, [`slug_${lang}`]: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Aprašymas</label>
                        <textarea
                          value={(formData as any)[`description_${lang}`]}
                          onChange={(e) => setFormData(prev => ({ ...prev, [`description_${lang}`]: e.target.value }))}
                          rows={3}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                          Alt tekstas nuotraukai
                          <span className="text-xs font-normal text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">SEO</span>
                        </label>
                        <input
                          type="text"
                          value={(formData as any)[`image_alt_${lang}`]}
                          onChange={(e) => setFormData(prev => ({ ...prev, [`image_alt_${lang}`]: e.target.value }))}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-center justify-end gap-4 pt-6 border-t">
              <button
                type="button"
                onClick={() => navigate('/admin/events')}
                className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Atšaukti
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Išsaugoma...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {isEdit ? 'Atnaujinti' : 'Sukurti renginį'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminEventFormPage;
