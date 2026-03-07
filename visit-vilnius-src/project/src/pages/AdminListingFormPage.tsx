import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2, X, Languages, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Star, TrendingUp, Home } from 'lucide-react';
import { supabase } from '../lib/supabase';
import AdminLayout from '../components/admin/AdminLayout';
import { useTranslate } from '../lib/useTranslate';
import { generateSlug, ensureUniqueSlug } from '../utils/slugUtils';
import ImageUploadField from '../components/admin/ImageUploadField';
import GalleryUploadField from '../components/admin/GalleryUploadField';
import { LISTING_TAG_GROUPS, CATEGORY_FILTER_TAGS } from '../lib/suggestedTags';
import RichTextEditor from '../components/admin/RichTextEditor';

const CATEGORY_BACK_PATHS: Record<string, string> = {
  attraction: '/admin/attractions',
  restaurant: '/admin/restaurants',
  bar: '/admin/bars',
  shop: '/admin/shops',
  hotel: '/admin/hotels',
};

interface ContactInfo {
  email?: string;
  phone?: string;
  website?: string;
}

interface OpeningHours {
  [key: string]: string;
}

interface ListingFormData {
  name: string;
  slug: string;
  description: string;
  category: string;
  image_url: string;
  gallery_images: string[];
  location: string;
  price_range: string;
  contact_info: ContactInfo;
  opening_hours: OpeningHours;
  badge: string;
  status: string;
  features: string[];
  features_en: string[];
  features_pl: string[];
  features_de: string[];
  features_ru: string[];
  features_fr: string[];
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
  contact_person: string;
  contact_phone_internal: string;
  contact_email_internal: string;
  membership_valid_until: string;
  is_featured: boolean;
  promoted_until: string;
}

const CATEGORIES = [
  { value: 'restaurant', label: 'Restoranai ir kavinės' },
  { value: 'bar', label: 'Barai ir klubai' },
  { value: 'hotel', label: 'Viešbučiai ir nakvynė' },
  { value: 'attraction', label: 'Lankytinos vietos' },
  { value: 'shop', label: 'Parduotuvės' }
];

const LANG_LABELS: Record<string, string> = {
  en: 'English',
  pl: 'Polski',
  de: 'Deutsch',
  ru: 'Русский',
  fr: 'Français',
};

const AdminListingFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(id);
  const { translate, translating, translateError } = useTranslate();

  const urlCategory = searchParams.get('category') || searchParams.get('from') || 'restaurant';
  const backPath = CATEGORY_BACK_PATHS[urlCategory] || '/admin/listings';

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newFeature, setNewFeature] = useState('');
  const [newFeatureLang, setNewFeatureLang] = useState<Record<string, string>>({});
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const [showFilterTags, setShowFilterTags] = useState(true);
  const [translateSuccess, setTranslateSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<'lt' | 'translations'>('lt');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  const [formData, setFormData] = useState<ListingFormData>({
    name: '',
    slug: '',
    description: '',
    category: urlCategory,
    image_url: '',
    gallery_images: [],
    location: '',
    price_range: '$$',
    contact_info: {},
    opening_hours: {},
    badge: '',
    status: 'active',
    features: [],
    features_en: [],
    features_pl: [],
    features_de: [],
    features_ru: [],
    features_fr: [],
    name_en: '',
    name_pl: '',
    name_de: '',
    name_ru: '',
    name_fr: '',
    slug_en: '',
    slug_pl: '',
    slug_de: '',
    slug_ru: '',
    slug_fr: '',
    description_en: '',
    description_pl: '',
    description_de: '',
    description_ru: '',
    description_fr: '',
    image_alt_lt: '',
    image_alt_en: '',
    image_alt_pl: '',
    image_alt_de: '',
    image_alt_ru: '',
    image_alt_fr: '',
    contact_person: '',
    contact_phone_internal: '',
    contact_email_internal: '',
    membership_valid_until: '',
    is_featured: false,
    promoted_until: '',
  });

  useEffect(() => {
    if (isEdit && id) {
      loadListing();
    }
  }, [id]);

  const loadListing = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('listings')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        setError('Listing not found');
        return;
      }

      setFormData({
        name: data.name || '',
        slug: data.slug || '',
        description: data.description || '',
        category: data.category || 'restaurant',
        image_url: data.image_url || '',
        gallery_images: data.gallery_images || [],
        location: data.location || '',
        price_range: data.price_range || '$$',
        contact_info: data.contact_info || {},
        opening_hours: data.opening_hours || {},
        badge: data.badge || '',
        status: data.status || 'active',
        features: data.features || [],
        features_en: data.features_en || [],
        features_pl: data.features_pl || [],
        features_de: data.features_de || [],
        features_ru: data.features_ru || [],
        features_fr: data.features_fr || [],
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
        contact_person: data.contact_person || '',
        contact_phone_internal: data.contact_phone || '',
        contact_email_internal: data.contact_email || '',
        membership_valid_until: data.membership_valid_until || '',
        is_featured: data.is_featured || false,
        promoted_until: data.promoted_until ? data.promoted_until.slice(0, 16) : '',
      });
      setSlugManuallyEdited(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load listing');
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
      const langs = ['en', 'pl', 'de', 'ru', 'fr'] as const;
      const uniqueSlugs: Record<string, string> = {};
      for (const lang of langs) {
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
        slug_en: uniqueSlugs.en || result.en?.slug || prev.slug_en,
        slug_pl: uniqueSlugs.pl || result.pl?.slug || prev.slug_pl,
        slug_de: uniqueSlugs.de || result.de?.slug || prev.slug_de,
        slug_ru: uniqueSlugs.ru || result.ru?.slug || prev.slug_ru,
        slug_fr: uniqueSlugs.fr || result.fr?.slug || prev.slug_fr,
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const uniqueSlug = await ensureUniqueSlug(supabase, 'slug', formData.slug, id);

      const { contact_phone_internal, contact_email_internal, ...rest } = formData;
      const payload: Record<string, unknown> = {
        ...rest,
        slug: uniqueSlug,
        contact_phone: contact_phone_internal,
        contact_email: contact_email_internal,
        membership_valid_until: (rest as any).membership_valid_until || null,
        promoted_until: (rest as any).promoted_until || null,
        ...(isEdit ? {} : { created_by: 'Administrator' })
      };

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Nesate prisijungęs. Prašome prisijungti iš naujo.');

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-write`;
      if (isEdit) {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
          body: JSON.stringify({ action: 'update', table: 'listings', payload, match: { id } }),
        });
        let json: any = {};
        try { json = await res.json(); } catch {}
        if (!res.ok || json.error) throw new Error(json.error || `Serverio klaida: HTTP ${res.status}`);
      } else {
        const res = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
          body: JSON.stringify({ action: 'insert', table: 'listings', payload }),
        });
        let json: any = {};
        try { json = await res.json(); } catch {}
        if (!res.ok || json.error) throw new Error(json.error || `Serverio klaida: HTTP ${res.status}`);
      }

      navigate(backPath);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save listing');
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
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else if (name === 'name') {
      setFormData(prev => ({
        ...prev,
        name: value,
        ...(!slugManuallyEdited ? { slug: generateSlug(value) } : {}),
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleContactInfoChange = (field: keyof ContactInfo, value: string) => {
    setFormData(prev => ({
      ...prev,
      contact_info: { ...prev.contact_info, [field]: value }
    }));
  };

  const handleOpeningHoursChange = (day: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      opening_hours: { ...prev.opening_hours, [day]: value }
    }));
  };

  const addFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({ ...prev, features: [...prev.features, newFeature.trim()] }));
      setNewFeature('');
    }
  };

  const removeFeature = (feature: string) => {
    setFormData(prev => ({ ...prev, features: prev.features.filter(f => f !== feature) }));
  };

  const addFeatureLang = (lang: string) => {
    const val = newFeatureLang[lang]?.trim();
    if (!val) return;
    const key = `features_${lang}` as keyof ListingFormData;
    const existing = (formData[key] as string[]) || [];
    if (!existing.includes(val)) {
      setFormData(prev => ({ ...prev, [key]: [...existing, val] }));
    }
    setNewFeatureLang(prev => ({ ...prev, [lang]: '' }));
  };

  const removeFeatureLang = (lang: string, feature: string) => {
    const key = `features_${lang}` as keyof ListingFormData;
    const existing = (formData[key] as string[]) || [];
    setFormData(prev => ({ ...prev, [key]: existing.filter(f => f !== feature) }));
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
      <div className="max-w-4xl mx-auto">
        <div className="space-y-6">
          <button
            onClick={() => navigate(backPath)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Atgal
          </button>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold text-gray-900">
                {isEdit ? 'Redaguoti objektą' : 'Naujas objektas'}
              </h1>
              <button
                type="button"
                onClick={handleAutoTranslate}
                disabled={translating || (!formData.name && !formData.description)}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
              >
                {translating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Languages className="w-4 h-4" />
                )}
                {translating ? 'Verčiama...' : 'Auto-vertimas į 5 kalbas'}
              </button>
            </div>

            {translateError && (
              <div className="mb-4 flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {translateError}
              </div>
            )}

            {translateSuccess && (
              <div className="mb-4 flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
                <CheckCircle className="w-4 h-4 flex-shrink-0" />
                Turinys sėkmingai išverstas į 5 kalbas
              </div>
            )}

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-1 mb-6 border-b border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab('lt')}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === 'lt'
                    ? 'bg-white border border-b-white border-gray-200 text-blue-600 -mb-px'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Lietuvių (LT)
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('translations')}
                className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'translations'
                    ? 'bg-white border border-b-white border-gray-200 text-blue-600 -mb-px'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Languages className="w-3.5 h-3.5" />
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Slug (URL)
                      <span className="ml-2 text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded">automatinis</span>
                    </label>
                    <input
                      type="text"
                      name="slug"
                      value={formData.slug}
                      onChange={e => {
                        setSlugManuallyEdited(true);
                        setFormData(prev => ({ ...prev, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-') }));
                      }}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-white text-gray-800 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <p className="text-xs text-gray-400 mt-1">Generuojamas automatiškai iš pavadinimo. Galite redaguoti rankiniu būdu.</p>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Aprašymas *</label>
                    <RichTextEditor
                      value={formData.description}
                      onChange={val => setFormData(prev => ({ ...prev, description: val }))}
                      rows={8}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Alt tekstas nuotraukai (LT)
                      <span className="ml-2 text-xs font-normal text-gray-400 bg-gray-100 px-2 py-0.5 rounded">SEO</span>
                    </label>
                    <input
                      type="text"
                      name="image_alt_lt"
                      value={formData.image_alt_lt}
                      onChange={handleChange}
                      placeholder={`pvz. ${formData.name || 'Pavadinimas'}, Vilniaus senamiestis`}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                    <p className="text-xs text-gray-400 mt-1">Aprašo nuotrauką paieškos varikliams. Paspaudus "Auto-vertimas" automatiškai išverčiamas į visas kalbas.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kategorija *</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      {CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Kainų kategorija *</label>
                    <select
                      name="price_range"
                      value={formData.price_range}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="$">$ - Pigu</option>
                      <option value="$$">$$ - Vidutiniškai</option>
                      <option value="$$$">$$$ - Brangu</option>
                      <option value="$$$$">$$$$ - Prabanga</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <ImageUploadField
                      value={formData.image_url}
                      onChange={(url) => setFormData(prev => ({ ...prev, image_url: url }))}
                      label="Pagrindinė nuotrauka"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <GalleryUploadField
                      images={formData.gallery_images}
                      onChange={(images) => setFormData(prev => ({ ...prev, gallery_images: images }))}
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Vieta *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ypatybės ir filtravimas</label>

                    {(() => {
                      const filterGroup = CATEGORY_FILTER_TAGS.find(g => g.category === formData.category);
                      if (!filterGroup) return null;
                      return (
                        <div className="mb-4">
                          <button
                            type="button"
                            onClick={() => setShowFilterTags(v => !v)}
                            className="flex items-center gap-2 text-sm text-blue-700 hover:text-blue-900 font-semibold mb-2"
                          >
                            {showFilterTags ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            Filtravimo žymekliai – kaip rodoma puslapyje
                          </button>
                          {showFilterTags && (
                            <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 space-y-2">
                              <p className="text-xs text-blue-700 mb-3">
                                Pasirinkite, kuriuose filtruose šis objektas turi pasirodyti. Kiekvienas žymeklis lemia rodymą atitinkame filtre.
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {filterGroup.filters.map(ft => {
                                  const active = formData.features.includes(ft.value);
                                  return (
                                    <button
                                      key={ft.value}
                                      type="button"
                                      title={ft.description}
                                      onClick={() => {
                                        if (active) {
                                          removeFeature(ft.value);
                                        } else {
                                          setFormData(prev => ({ ...prev, features: [...prev.features, ft.value] }));
                                        }
                                      }}
                                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all border ${
                                        active
                                          ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                                          : 'bg-white border-blue-300 text-blue-700 hover:bg-blue-100'
                                      }`}
                                    >
                                      <span className={`w-2 h-2 rounded-full flex-shrink-0 ${active ? 'bg-white' : 'bg-blue-300'}`} />
                                      {ft.label}
                                      <span className="text-xs opacity-70 ml-0.5">({ft.description})</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    <div className="mb-3">
                      <button
                        type="button"
                        onClick={() => setShowTagSuggestions(v => !v)}
                        className="flex items-center gap-2 text-sm text-amber-700 hover:text-amber-900 font-medium mb-2"
                      >
                        {showTagSuggestions ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        Papildomi žymekliai (Trip Planner ir aprašymai)
                      </button>
                      {showTagSuggestions && (
                        <div className="border border-amber-200 rounded-lg p-3 bg-amber-50 space-y-3">
                          <p className="text-xs text-amber-700">Šie žymekliai naudojami "Plan a Trip" filtravimui pagal pomėgius ir rodomi kortelėse kaip ypatybės.</p>
                          {LISTING_TAG_GROUPS.map(group => (
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
                                          ? 'bg-amber-500 text-white'
                                          : 'bg-white border border-amber-300 text-amber-700 hover:bg-amber-100'
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
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                      <button
                        type="button"
                        onClick={addFeature}
                        className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                      >
                        Pridėti
                      </button>
                    </div>
                    {formData.features.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {formData.features.map((feature, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-800 rounded-full text-sm"
                          >
                            {feature}
                            <button type="button" onClick={() => removeFeature(feature)} className="hover:text-amber-900">
                              <X className="w-4 h-4" />
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
                      onChange={(e) => handleContactInfoChange('email', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Telefonas</label>
                    <input
                      type="tel"
                      value={formData.contact_info.phone || ''}
                      onChange={(e) => handleContactInfoChange('phone', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Svetainė</label>
                    <input
                      type="text"
                      value={formData.contact_info.website || ''}
                      onChange={(e) => handleContactInfoChange('website', e.target.value)}
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (v && !v.match(/^https?:\/\//i)) {
                          handleContactInfoChange('website', 'https://' + v);
                        }
                      }}
                      placeholder="www.example.lt"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <div className="border-t border-gray-100 pt-4 mb-2">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Atsakingo asmens kontaktai (vidiniai, rodomi tik admino sistemoje)</p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Atsakingas asmuo</label>
                          <input
                            type="text"
                            name="contact_person"
                            value={formData.contact_person}
                            onChange={handleChange}
                            placeholder="Vardas Pavardė"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">El. paštas (vidinis)</label>
                          <input
                            type="email"
                            name="contact_email_internal"
                            value={formData.contact_email_internal}
                            onChange={handleChange}
                            placeholder="asmuo@pvz.lt"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Telefonas (vidinis)</label>
                          <input
                            type="tel"
                            name="contact_phone_internal"
                            value={formData.contact_phone_internal}
                            onChange={handleChange}
                            placeholder="+370 600 00000"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Narystė galioja iki</label>
                      <input
                        type="date"
                        name="membership_valid_until"
                        value={formData.membership_valid_until}
                        onChange={handleChange}
                        className="w-full md:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>

                  {formData.category !== 'hotel' && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Darbo laikas</label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {[
                        { key: 'Monday', label: 'Pirmadienis' },
                        { key: 'Tuesday', label: 'Antradienis' },
                        { key: 'Wednesday', label: 'Trečiadienis' },
                        { key: 'Thursday', label: 'Ketvirtadienis' },
                        { key: 'Friday', label: 'Penktadienis' },
                        { key: 'Saturday', label: 'Šeštadienis' },
                        { key: 'Sunday', label: 'Sekmadienis' },
                      ].map(({ key, label }) => (
                        <div key={key}>
                          <label className="block text-xs text-gray-600 mb-1">{label}</label>
                          <input
                            type="text"
                            value={formData.opening_hours[key] || ''}
                            onChange={(e) => handleOpeningHoursChange(key, e.target.value)}
                            placeholder="pvz. 9:00-17:00 arba Uždaryta"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Ženklelis (rodomas ant kortelės)</label>
                    <select
                      name="badge"
                      value={formData.badge}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="">— Nėra ženklelio —</option>
                      <option value="featured">Rekomenduojama</option>
                      <option value="free_entry">Nemokamas įėjimas</option>
                      <option value="must_try">Privaloma išbandyti</option>
                      <option value="new">Nauja</option>
                      <option value="popular">Populiaru</option>
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Ženklelis automatiškai rodomas lankytojo kalba.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Statusas</label>
                    <select
                      name="status"
                      value={formData.status}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    >
                      <option value="active">Aktyvus</option>
                      <option value="inactive">Neaktyvus</option>
                      <option value="pending">Laukia patvirtinimo</option>
                    </select>
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Iškėlimas kategorijoje</label>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, is_featured: !prev.is_featured }))}
                        className={`flex items-center gap-3 px-4 py-3 rounded-lg border-2 transition-all w-full text-left ${
                          formData.is_featured
                            ? 'border-amber-500 bg-amber-50 text-amber-800'
                            : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <Star size={18} className={formData.is_featured ? 'fill-amber-500 text-amber-500' : 'text-gray-400'} />
                        <div>
                          <div className="font-medium text-sm">
                            {formData.is_featured ? 'Iškeltas kategorijoje' : 'Neiškeltas'}
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">Rodomas kategorijos sąrašo viršuje</div>
                        </div>
                      </button>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Iškėlimas tituliniame</label>
                      <div className={`flex items-start gap-3 px-4 py-3 rounded-lg border-2 transition-all ${
                        formData.promoted_until && new Date(formData.promoted_until) > new Date()
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white'
                      }`}>
                        <Home size={18} className={`mt-0.5 flex-shrink-0 ${formData.promoted_until && new Date(formData.promoted_until) > new Date() ? 'text-blue-500' : 'text-gray-400'}`} />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-gray-700 mb-1">
                            {formData.promoted_until && new Date(formData.promoted_until) > new Date()
                              ? 'Rodomas tituliniame'
                              : formData.promoted_until
                                ? 'Iškėlimas pasibaigė'
                                : 'Neiškeltas tituliniame'}
                          </div>
                          <div className="text-xs text-gray-500 mb-2">Galioja iki:</div>
                          <input
                            type="datetime-local"
                            value={formData.promoted_until}
                            onChange={e => setFormData(prev => ({ ...prev, promoted_until: e.target.value }))}
                            className="w-full text-xs px-2 py-1.5 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                          />
                          {formData.promoted_until && (
                            <button
                              type="button"
                              onClick={() => setFormData(prev => ({ ...prev, promoted_until: '' }))}
                              className="mt-1.5 text-xs text-red-500 hover:text-red-700"
                            >
                              Pašalinti iškėlimą
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'translations' && (
                <div className="space-y-8">
                  <p className="text-sm text-gray-500">
                    Vertimai generuojami automatiškai paspaudus "Auto-vertimas". Galite juos redaguoti rankiniu būdu.
                  </p>
                  {(['en', 'pl', 'de', 'ru', 'fr'] as const).map((lang) => (
                    <div key={lang} className="border border-gray-200 rounded-xl p-5 space-y-4">
                      <h3 className="font-semibold text-gray-800 text-base">{LANG_LABELS[lang]}</h3>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Pavadinimas</label>
                        <input
                          type="text"
                          value={(formData as Record<string, unknown>)[`name_${lang}`] as string || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, [`name_${lang}`]: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                        <input
                          type="text"
                          value={(formData as Record<string, unknown>)[`slug_${lang}`] as string || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, [`slug_${lang}`]: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Aprašymas</label>
                        <RichTextEditor
                          value={(formData as Record<string, unknown>)[`description_${lang}`] as string || ''}
                          onChange={val => setFormData(prev => ({ ...prev, [`description_${lang}`]: val }))}
                          rows={6}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                          Alt tekstas nuotraukai
                          <span className="text-xs font-normal text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">SEO</span>
                        </label>
                        <input
                          type="text"
                          value={(formData as Record<string, unknown>)[`image_alt_${lang}`] as string || ''}
                          onChange={(e) => setFormData(prev => ({ ...prev, [`image_alt_${lang}`]: e.target.value }))}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Savybės / Features</label>
                        <div className="flex gap-2 mb-2">
                          <input
                            type="text"
                            value={newFeatureLang[lang] || ''}
                            onChange={(e) => setNewFeatureLang(prev => ({ ...prev, [lang]: e.target.value }))}
                            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addFeatureLang(lang); }}}
                            placeholder={`Savybė ${LANG_LABELS[lang]} kalba...`}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                          />
                          <button
                            type="button"
                            onClick={() => addFeatureLang(lang)}
                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            Pridėti
                          </button>
                        </div>
                        {((formData as Record<string, unknown>)[`features_${lang}`] as string[] || []).length > 0 && (
                          <div className="flex flex-wrap gap-2">
                            {((formData as Record<string, unknown>)[`features_${lang}`] as string[]).map((feature, idx) => (
                              <span key={idx} className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                                {feature}
                                <button type="button" onClick={() => removeFeatureLang(lang, feature)} className="hover:text-blue-900">
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-center justify-end gap-4 pt-6 border-t">
                <button
                  type="button"
                  onClick={() => navigate(backPath)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Atšaukti
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Išsaugoma...
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      {isEdit ? 'Atnaujinti' : 'Sukurti objektą'}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminListingFormPage;
