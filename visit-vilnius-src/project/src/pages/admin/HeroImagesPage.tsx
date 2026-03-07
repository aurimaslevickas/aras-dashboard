import React, { useState, useEffect } from 'react';
import { Trash2, Loader2, Image as ImageIcon, Plus, Save, CheckCircle, AlertCircle, Languages, X, Pencil, User } from 'lucide-react';
import { supabase, adminFetch as adminFetchLib } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';
import MediaPickerModal from '../../components/admin/MediaPickerModal';

interface HeroImage {
  id: string;
  season: string;
  image_url: string;
  sort_order: number;
  photographer_name: string;
  photographer_url: string;
}

interface HeroTexts {
  welcome_prefix_lt: string;
  welcome_prefix_en: string;
  welcome_prefix_pl: string;
  welcome_prefix_de: string;
  welcome_prefix_ru: string;
  welcome_prefix_fr: string;
  title_lt: string;
  title_en: string;
  title_pl: string;
  title_de: string;
  title_ru: string;
  title_fr: string;
  description_lt: string;
  description_en: string;
  description_pl: string;
  description_de: string;
  description_ru: string;
  description_fr: string;
}

const SEASONS = [
  { key: 'spring', label: 'Pavasaris', months: 'Kovas — Gegužė', color: 'bg-green-50 border-green-200', badge: 'bg-green-100 text-green-800' },
  { key: 'summer', label: 'Vasara', months: 'Birželis — Rugpjūtis', color: 'bg-yellow-50 border-yellow-200', badge: 'bg-yellow-100 text-yellow-800' },
  { key: 'autumn', label: 'Ruduo', months: 'Rugsėjis — Lapkritis', color: 'bg-orange-50 border-orange-200', badge: 'bg-orange-100 text-orange-800' },
  { key: 'winter', label: 'Žiema', months: 'Gruodis — Vasaris', color: 'bg-blue-50 border-blue-200', badge: 'bg-blue-100 text-blue-800' },
];

const LANGUAGES = [
  { code: 'lt', label: 'Lietuvių', flag: '🇱🇹' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

const getActiveSeason = () => {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5) return 'spring';
  if (m >= 6 && m <= 8) return 'summer';
  if (m >= 9 && m <= 11) return 'autumn';
  return 'winter';
};

const HeroImagesPage: React.FC = () => {
  const [images, setImages] = useState<HeroImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [pickerSeason, setPickerSeason] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'images' | 'texts'>('images');
  const [activeLang, setActiveLang] = useState('lt');
  const [texts, setTexts] = useState<HeroTexts>({
    welcome_prefix_lt: 'Sveiki atvykę į',
    welcome_prefix_en: 'Welcome to',
    welcome_prefix_pl: 'Witamy w',
    welcome_prefix_de: 'Willkommen in',
    welcome_prefix_ru: 'Добро пожаловать в',
    welcome_prefix_fr: 'Bienvenue à',
    title_lt: 'Vilnių',
    title_en: 'Vilnius',
    title_pl: 'Wilno',
    title_de: 'Vilnius',
    title_ru: 'Вильнюс',
    title_fr: 'Vilnius',
    description_lt: 'Ištyrinėk sostinės grožį, skonį ir kultūrą',
    description_en: "Explore the capital's beauty, flavors and culture",
    description_pl: 'Poznaj piękno, smaki i kulturę stolicy',
    description_de: 'Erkunde die Schönheit, Geschmäcke und Kultur der Hauptstadt',
    description_ru: 'Исследуйте красоту, вкусы и культуру столицы',
    description_fr: 'Explorez la beauté, les saveurs et la culture de la capitale',
  });
  const [saving, setSaving] = useState(false);
  const [textMessage, setTextMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [imageMessage, setImageMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingAttribution, setEditingAttribution] = useState<string | null>(null);
  const [attributionDraft, setAttributionDraft] = useState<{ photographer_name: string; photographer_url: string }>({ photographer_name: '', photographer_url: '' });
  const [savingAttribution, setSavingAttribution] = useState(false);

  const activeSeason = getActiveSeason();

  useEffect(() => {
    loadImages();
    loadTexts();
  }, []);

  const loadImages = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('hero_season_images')
      .select('*')
      .order('season')
      .order('sort_order');
    setImages(data || []);
    setLoading(false);
  };

  const loadTexts = async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('key, value_lt, value_en, value_pl, value_de, value_ru, value_fr')
      .in('key', ['hero_welcome_prefix', 'hero_title', 'hero_description']);

    if (data && data.length > 0) {
      const map: Record<string, Record<string, string>> = {};
      data.forEach(row => { map[row.key] = row; });

      const prefix = map['hero_welcome_prefix'] || {};
      const title = map['hero_title'] || {};
      const desc = map['hero_description'] || {};

      setTexts({
        welcome_prefix_lt: prefix.value_lt || 'Sveiki atvykę į',
        welcome_prefix_en: prefix.value_en || 'Welcome to',
        welcome_prefix_pl: prefix.value_pl || 'Witamy w',
        welcome_prefix_de: prefix.value_de || 'Willkommen in',
        welcome_prefix_ru: prefix.value_ru || 'Добро пожаловать в',
        welcome_prefix_fr: prefix.value_fr || 'Bienvenue à',
        title_lt: title.value_lt || 'Vilnių',
        title_en: title.value_en || 'Vilnius',
        title_pl: title.value_pl || 'Wilno',
        title_de: title.value_de || 'Vilnius',
        title_ru: title.value_ru || 'Вильнюс',
        title_fr: title.value_fr || 'Vilnius',
        description_lt: desc.value_lt || '',
        description_en: desc.value_en || '',
        description_pl: desc.value_pl || '',
        description_de: desc.value_de || '',
        description_ru: desc.value_ru || '',
        description_fr: desc.value_fr || '',
      });
    }
  };

  const adminFetch = (body: object) => adminFetchLib('admin-write', body);

  const handleAddFromPicker = async (imageUrl: string) => {
    if (!pickerSeason) return;
    const seasonImages = images.filter(i => i.season === pickerSeason);
    if (seasonImages.length >= 4) {
      setPickerSeason(null);
      return;
    }
    setAdding(pickerSeason);
    setImageMessage(null);
    const maxOrder = seasonImages.reduce((m, i) => Math.max(m, i.sort_order), 0);
    try {
      await adminFetch({
        action: 'insert',
        table: 'hero_season_images',
        payload: { season: pickerSeason, image_url: imageUrl, sort_order: maxOrder + 1 },
      });
      await loadImages();
      setImageMessage({ type: 'success', text: 'Nuotrauka pridėta sėkmingai' });
    } catch (err: any) {
      setImageMessage({ type: 'error', text: err?.message || 'Klaida pridedant nuotrauką' });
    }
    setAdding(null);
    setPickerSeason(null);
  };

  const handleDelete = async (id: string) => {
    setDeleting(id);
    setImageMessage(null);
    try {
      await adminFetch({ action: 'delete', table: 'hero_season_images', match: { id } });
      setImages(prev => prev.filter(i => i.id !== id));
      setImageMessage({ type: 'success', text: 'Nuotrauka ištrinta' });
    } catch (err: any) {
      setImageMessage({ type: 'error', text: err?.message || 'Klaida trinant nuotrauką' });
    }
    setDeleting(null);
  };

  const handleOpenAttribution = (img: HeroImage) => {
    setAttributionDraft({ photographer_name: img.photographer_name || '', photographer_url: img.photographer_url || '' });
    setEditingAttribution(img.id);
  };

  const handleSaveAttribution = async () => {
    if (!editingAttribution) return;
    setSavingAttribution(true);
    try {
      await adminFetch({
        action: 'update',
        table: 'hero_season_images',
        match: { id: editingAttribution },
        payload: {
          photographer_name: attributionDraft.photographer_name,
          photographer_url: attributionDraft.photographer_url,
        },
      });
      setImages(prev => prev.map(i =>
        i.id === editingAttribution
          ? { ...i, photographer_name: attributionDraft.photographer_name, photographer_url: attributionDraft.photographer_url }
          : i
      ));
      setEditingAttribution(null);
      setImageMessage({ type: 'success', text: 'Atribucija išsaugota' });
    } catch (err: any) {
      setImageMessage({ type: 'error', text: err?.message || 'Klaida išsaugant atribuciją' });
    }
    setSavingAttribution(false);
  };

  const handleSaveTexts = async () => {
    setSaving(true);
    setTextMessage(null);
    try {
      await adminFetch({
        action: 'update_many',
        table: 'site_settings',
        rows: [
          {
            key: 'hero_welcome_prefix',
            value_lt: texts.welcome_prefix_lt,
            value_en: texts.welcome_prefix_en,
            value_pl: texts.welcome_prefix_pl,
            value_de: texts.welcome_prefix_de,
            value_ru: texts.welcome_prefix_ru,
            value_fr: texts.welcome_prefix_fr,
            updated_at: new Date().toISOString(),
          },
          {
            key: 'hero_title',
            value_lt: texts.title_lt,
            value_en: texts.title_en,
            value_pl: texts.title_pl,
            value_de: texts.title_de,
            value_ru: texts.title_ru,
            value_fr: texts.title_fr,
            updated_at: new Date().toISOString(),
          },
          {
            key: 'hero_description',
            value_lt: texts.description_lt,
            value_en: texts.description_en,
            value_pl: texts.description_pl,
            value_de: texts.description_de,
            value_ru: texts.description_ru,
            value_fr: texts.description_fr,
            updated_at: new Date().toISOString(),
          },
        ],
      });
      setTextMessage({ type: 'success', text: 'Tekstai išsaugoti sėkmingai' });
    } catch (err: any) {
      setTextMessage({ type: 'error', text: err?.message || 'Klaida išsaugant' });
    } finally {
      setSaving(false);
    }
  };

  const updateText = (field: keyof HeroTexts, value: string) => {
    setTexts(prev => ({ ...prev, [field]: value }));
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
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Titulinis puslapis</h1>
          <p className="text-gray-600 mt-1">
            Valdykite titulinio puslapio nuotraukas ir tekstus.
          </p>
        </div>

        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('images')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'images'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            Nuotraukos
          </button>
          <button
            onClick={() => setActiveTab('texts')}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === 'texts'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Languages className="w-4 h-4" />
            Tekstai
          </button>
        </div>

        {activeTab === 'images' && (
          <div className="space-y-4">
            {imageMessage && (
              <div className={`flex items-center gap-3 p-4 rounded-lg border ${
                imageMessage.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {imageMessage.type === 'success'
                  ? <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  : <AlertCircle className="w-5 h-5 flex-shrink-0" />
                }
                <span>{imageMessage.text}</span>
                <button onClick={() => setImageMessage(null)} className="ml-auto">
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-sm text-gray-500">
              Kiekvienam metų laikui galima pridėti iki 4 nuotraukų. Jos keičiasi automatiškai kas 6 sekundes.
              Aktyvus sezonas: <strong>{SEASONS.find(s => s.key === activeSeason)?.label}</strong>.
            </p>
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {SEASONS.map(season => {
                const seasonImages = images.filter(i => i.season === season.key);
                const isActive = season.key === activeSeason;
                const canAdd = seasonImages.length < 4;

                return (
                  <div
                    key={season.key}
                    className={`rounded-2xl border-2 p-5 ${season.color} ${isActive ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg font-bold text-gray-900">{season.label}</h2>
                          {isActive && (
                            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs font-bold rounded-full">Dabar</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">{season.months}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${season.badge}`}>
                        {seasonImages.length} / 4
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      {seasonImages.map(img => (
                        <div key={img.id} className="group relative rounded-xl overflow-hidden bg-gray-100">
                          <div className="relative aspect-video">
                            <img
                              src={img.image_url}
                              alt=""
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleOpenAttribution(img)}
                                className="p-1.5 bg-blue-600 text-white rounded-full hover:bg-blue-700"
                                title="Redaguoti atribuciją"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(img.id)}
                                disabled={deleting === img.id}
                                className="p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 disabled:opacity-50"
                              >
                                {deleting === img.id
                                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                  : <Trash2 className="w-3.5 h-3.5" />
                                }
                              </button>
                            </div>
                            {img.photographer_name && (
                              <div className="absolute bottom-1.5 left-1.5 right-1.5 flex items-center gap-1 px-1.5 py-0.5 rounded bg-black/50 text-white text-xs truncate">
                                <User className="w-2.5 h-2.5 flex-shrink-0 opacity-70" />
                                <span className="truncate">{img.photographer_name}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      {canAdd && (
                        <button
                          onClick={() => setPickerSeason(season.key)}
                          disabled={adding === season.key}
                          className="aspect-video rounded-xl border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-white/50 transition-colors flex flex-col items-center justify-center gap-1 disabled:opacity-50"
                        >
                          {adding === season.key
                            ? <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                            : <Plus className="w-6 h-6 text-gray-400" />
                          }
                          <span className="text-xs text-gray-400">Pridėti</span>
                        </button>
                      )}
                    </div>

                    {seasonImages.length === 0 && (
                      <div className="flex flex-col items-center justify-center py-6 gap-2">
                        <ImageIcon className="w-10 h-10 text-gray-300" />
                        <p className="text-sm text-gray-400">Nėra nuotraukų. Pridėkite bent vieną.</p>
                        <button
                          onClick={() => setPickerSeason(season.key)}
                          className="mt-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                        >
                          <Plus className="w-4 h-4" />
                          Pridėti nuotrauką
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'texts' && (
          <div className="space-y-6 max-w-3xl">
            <p className="text-sm text-gray-500">
              Redaguokite titulinio puslapio antraštę ir aprašymą kiekvienai kalbai atskirai.
            </p>

            {textMessage && (
              <div className={`flex items-center gap-3 p-4 rounded-lg border ${
                textMessage.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                {textMessage.type === 'success'
                  ? <CheckCircle className="w-5 h-5 flex-shrink-0" />
                  : <AlertCircle className="w-5 h-5 flex-shrink-0" />
                }
                {textMessage.text}
              </div>
            )}

            <div className="flex gap-1 flex-wrap">
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => setActiveLang(lang.code)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeLang === lang.code
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{lang.flag}</span>
                  {lang.label}
                </button>
              ))}
            </div>

            {LANGUAGES.filter(l => l.code === activeLang).map(lang => (
              <div key={lang.code} className="bg-white rounded-xl shadow-sm p-6 space-y-5">
                <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                  <span className="text-xl">{lang.flag}</span>
                  {lang.label}
                </h2>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Įžanginė frazė <span className="text-gray-400 font-normal">(pvz. "Welcome to")</span>
                  </label>
                  <input
                    type="text"
                    value={texts[`welcome_prefix_${lang.code}` as keyof HeroTexts]}
                    onChange={e => updateText(`welcome_prefix_${lang.code}` as keyof HeroTexts, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Welcome to"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Miesto pavadinimas <span className="text-gray-400 font-normal">(rodomas geltonai)</span>
                  </label>
                  <input
                    type="text"
                    value={texts[`title_${lang.code}` as keyof HeroTexts]}
                    onChange={e => updateText(`title_${lang.code}` as keyof HeroTexts, e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="Vilnius"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aprašymas
                  </label>
                  <textarea
                    value={texts[`description_${lang.code}` as keyof HeroTexts]}
                    onChange={e => updateText(`description_${lang.code}` as keyof HeroTexts, e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                    placeholder="Ištyrinėk sostinės grožį..."
                  />
                </div>

                <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                  <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Peržiūra</p>
                  <div className="bg-gray-800 rounded-lg p-4 text-center">
                    <p className="text-white text-sm font-bold">
                      {texts[`welcome_prefix_${lang.code}` as keyof HeroTexts]}
                    </p>
                    <p className="text-yellow-400 text-lg font-bold">
                      {texts[`title_${lang.code}` as keyof HeroTexts]}
                    </p>
                    <p className="text-gray-300 text-xs mt-1">
                      {texts[`description_${lang.code}` as keyof HeroTexts]}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            <button
              onClick={handleSaveTexts}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
            >
              {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
              {saving ? 'Saugoma...' : 'Išsaugoti tekstus'}
            </button>
          </div>
        )}
      </div>

      {pickerSeason && (
        <MediaPickerModal
          onSelect={handleAddFromPicker}
          onClose={() => setPickerSeason(null)}
        />
      )}

      {editingAttribution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Nuotraukos atribucija
              </h3>
              <button onClick={() => setEditingAttribution(null)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <p className="text-sm text-gray-500">
              Fotogravo vardas bus rodomas nuotraukos apatiniame dešiniame kampe.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Fotografo vardas
                </label>
                <input
                  type="text"
                  value={attributionDraft.photographer_name}
                  onChange={e => setAttributionDraft(prev => ({ ...prev, photographer_name: e.target.value }))}
                  placeholder="pvz. Jonas Jonaitis"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Nuoroda <span className="text-gray-400 font-normal">(neprivaloma)</span>
                </label>
                <input
                  type="url"
                  value={attributionDraft.photographer_url}
                  onChange={e => setAttributionDraft(prev => ({ ...prev, photographer_url: e.target.value }))}
                  placeholder="https://pexels.com/..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setEditingAttribution(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors"
              >
                Atšaukti
              </button>
              <button
                onClick={handleSaveAttribution}
                disabled={savingAttribution}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 text-sm font-medium transition-colors"
              >
                {savingAttribution ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                Išsaugoti
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default HeroImagesPage;
