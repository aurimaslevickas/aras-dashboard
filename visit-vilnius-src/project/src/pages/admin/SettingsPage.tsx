import React, { useState, useEffect } from 'react';
import { Save, Eye, EyeOff, CheckCircle, AlertCircle, Share2, Image } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';
import ImageUploadField from '../../components/admin/ImageUploadField';

interface SocialLink {
  enabled: boolean;
  url: string;
}

const SettingsPage = () => {
  const [ga4Id, setGa4Id] = useState('');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [ogImage, setOgImage] = useState('');
  const [showOpenaiKey, setShowOpenaiKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);
  const [socialFacebook, setSocialFacebook] = useState<SocialLink>({ enabled: false, url: '' });
  const [socialInstagram, setSocialInstagram] = useState<SocialLink>({ enabled: false, url: '' });
  const [socialTiktok, setSocialTiktok] = useState<SocialLink>({ enabled: false, url: '' });
  const [socialX, setSocialX] = useState<SocialLink>({ enabled: false, url: '' });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('key, value_lt')
        .in('key', [
          'ga4_measurement_id', 'openai_api_key', 'og_title', 'og_description', 'og_image',
          'social_facebook_enabled', 'social_facebook_url',
          'social_instagram_enabled', 'social_instagram_url',
          'social_tiktok_enabled', 'social_tiktok_url',
          'social_x_enabled', 'social_x_url',
        ]);

      if (data) {
        const map: Record<string, string> = {};
        data.forEach((s) => { map[s.key] = s.value_lt || ''; });
        if (map['ga4_measurement_id'] !== undefined) setGa4Id(map['ga4_measurement_id']);
        if (map['openai_api_key'] !== undefined) setOpenaiApiKey(map['openai_api_key']);
        if (map['og_title'] !== undefined) setOgTitle(map['og_title']);
        if (map['og_description'] !== undefined) setOgDescription(map['og_description']);
        if (map['og_image'] !== undefined) setOgImage(map['og_image']);
        setSocialFacebook({ enabled: map['social_facebook_enabled'] === 'true', url: map['social_facebook_url'] || '' });
        setSocialInstagram({ enabled: map['social_instagram_enabled'] === 'true', url: map['social_instagram_url'] || '' });
        setSocialTiktok({ enabled: map['social_tiktok_enabled'] === 'true', url: map['social_tiktok_url'] || '' });
        setSocialX({ enabled: map['social_x_enabled'] === 'true', url: map['social_x_url'] || '' });
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSetting = async (key: string, value: string) => {
    const { error } = await supabase
      .from('site_settings')
      .update({ value_lt: value, updated_at: new Date().toISOString() })
      .eq('key', key);
    if (error) throw error;
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      await Promise.all([
        saveSetting('ga4_measurement_id', ga4Id),
        saveSetting('openai_api_key', openaiApiKey),
        saveSetting('og_title', ogTitle),
        saveSetting('og_description', ogDescription),
        saveSetting('og_image', ogImage),
        saveSetting('social_facebook_enabled', socialFacebook.enabled ? 'true' : 'false'),
        saveSetting('social_facebook_url', socialFacebook.url),
        saveSetting('social_instagram_enabled', socialInstagram.enabled ? 'true' : 'false'),
        saveSetting('social_instagram_url', socialInstagram.url),
        saveSetting('social_tiktok_enabled', socialTiktok.enabled ? 'true' : 'false'),
        saveSetting('social_tiktok_url', socialTiktok.url),
        saveSetting('social_x_enabled', socialX.enabled ? 'true' : 'false'),
        saveSetting('social_x_url', socialX.url),
      ]);
      setMessage({ type: 'success', text: 'Nustatymai išsaugoti sėkmingai' });
    } catch (error: any) {
      const msg = error?.message || error?.details || error?.hint || JSON.stringify(error) || 'Klaida išsaugant nustatymus';
      setMessage({ type: 'error', text: msg });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nustatymai</h1>
          <p className="text-gray-600 mt-1">Svetainės konfigūracija ir SEO nustatymai</p>
        </div>

        {message && (
          <div className={`flex items-center gap-3 p-4 rounded-lg border ${
            message.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            {message.type === 'success'
              ? <CheckCircle className="w-5 h-5 flex-shrink-0" />
              : <AlertCircle className="w-5 h-5 flex-shrink-0" />
            }
            {message.text}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Socialinis dalinimasis (Open Graph)</h2>
          </div>
          <p className="text-sm text-gray-500 -mt-4">
            Kai kas nors dalinasi pagrindine svetainės nuoroda Facebook, Viber, WhatsApp ar kitose platformose — rodoma ši informacija ir nuotrauka.
            Atskirų puslapių (lankytinų vietų, renginių) nuotraukos naudojamos automatiškai iš jų pačių įrašų.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pavadinimas (og:title)
            </label>
            <input
              type="text"
              value={ogTitle}
              onChange={(e) => setOgTitle(e.target.value)}
              placeholder="pvz. Visit Vilnius – Kelionių gidas po Vilnių"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <p className="mt-1 text-xs text-gray-400">Rekomenduojama: iki 60 simbolių</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Aprašymas (og:description)
            </label>
            <textarea
              value={ogDescription}
              onChange={(e) => setOgDescription(e.target.value)}
              placeholder="pvz. Atraskite geriausias lankytinas vietas, restoranus, barus ir renginius Vilniuje."
              rows={3}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
            />
            <p className="mt-1 text-xs text-gray-400">Rekomenduojama: iki 160 simbolių</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <span className="flex items-center gap-1.5"><Image className="w-4 h-4" /> Dalinimosi nuotrauka (og:image)</span>
            </label>
            <p className="text-xs text-gray-500 mb-3">
              Nuotrauka kuri rodoma kai dalinasi nuoroda socialiniuose tinkluose. Rekomenduojamas dydis: <strong>1200 × 630 px</strong>.
            </p>
            <ImageUploadField
              value={ogImage}
              onChange={setOgImage}
              label=""
            />
            {!ogImage && (
              <p className="mt-2 text-sm text-orange-600">
                Nuotrauka nesukonfigūruota — dalinantis nuoroda nebus rodoma jokia nuotrauka
              </p>
            )}
          </div>

          {ogImage && (
            <div>
              <p className="text-xs font-medium text-gray-500 mb-2">Peržiūra (socialinių tinklų kortelė):</p>
              <div className="border border-gray-200 rounded-lg overflow-hidden max-w-sm">
                <img src={ogImage} alt="OG preview" className="w-full h-40 object-cover" />
                <div className="p-3 bg-gray-50">
                  <p className="text-xs text-gray-400 uppercase tracking-wide">visitvilnius.lt</p>
                  <p className="text-sm font-semibold text-gray-900 mt-0.5 line-clamp-1">{ogTitle || 'Pavadinimas...'}</p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{ogDescription || 'Aprašymas...'}</p>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Google Analytics 4</h2>
            <p className="text-sm text-gray-500 mb-4">
              GA4 Measurement ID (pvz. G-XXXXXXXXXX). Jei tuščias — GA4 neįjungiamas.
              Snippet automatiškai įdedamas kai ID sukonfigūruotas IR lankytojas priėmė slapukus.
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Measurement ID
            </label>
            <input
              type="text"
              value={ga4Id}
              onChange={(e) => setGa4Id(e.target.value)}
              placeholder="G-XXXXXXXXXX"
              className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
            />
            {!ga4Id && (
              <p className="mt-2 text-sm text-orange-600">
                GA4 nesukonfigūruota — analitika neveikia
              </p>
            )}
          </div>

          <hr className="border-gray-100" />

          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">OpenAI API</h2>
            <p className="text-sm text-gray-500 mb-4">
              OpenAI API raktas automatiniam turinio vertimui į 6 kalbas (LT, EN, PL, DE, RU, FR).
              Naudojamas GPT-4.1-mini modelis. Jei tuščias — auto-vertimas neveikia.
            </p>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API raktas
            </label>
            <div className="relative">
              <input
                type={showOpenaiKey ? 'text' : 'password'}
                value={openaiApiKey}
                onChange={(e) => setOpenaiApiKey(e.target.value)}
                placeholder="sk-..."
                className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowOpenaiKey(!showOpenaiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showOpenaiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            {!openaiApiKey && (
              <p className="mt-2 text-sm text-orange-600">
                OpenAI API nesukonfigūruotas — auto-vertimas neveikia
              </p>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 space-y-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-1">Socialiniai tinklai</h2>
            <p className="text-sm text-gray-500">
              Aktyvuokite ir įveskite nuorodas į socialinius tinklus. Aktyvuotos ikonėlės rodomos svetainės apatinėje dalyje.
            </p>
          </div>

          {[
            { key: 'facebook', label: 'Facebook', state: socialFacebook, setState: setSocialFacebook, placeholder: 'https://facebook.com/yourpage', color: 'bg-blue-600' },
            { key: 'instagram', label: 'Instagram', state: socialInstagram, setState: setSocialInstagram, placeholder: 'https://instagram.com/yourprofile', color: 'bg-pink-600' },
            { key: 'tiktok', label: 'TikTok', state: socialTiktok, setState: setSocialTiktok, placeholder: 'https://tiktok.com/@yourprofile', color: 'bg-gray-900' },
            { key: 'x', label: 'X (Twitter)', state: socialX, setState: setSocialX, placeholder: 'https://x.com/yourprofile', color: 'bg-gray-800' },
          ].map(({ key, label, state, setState, placeholder, color }) => (
            <div key={key} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full ${color} flex items-center justify-center text-white text-xs font-bold`}>
                    {label[0]}
                  </span>
                  <span className="font-medium text-gray-900">{label}</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.enabled}
                    onChange={(e) => setState({ ...state, enabled: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  <span className="ms-3 text-sm font-medium text-gray-700">{state.enabled ? 'Aktyvus' : 'Neaktyvus'}</span>
                </label>
              </div>
              <input
                type="text"
                value={state.url}
                onChange={(e) => setState({ ...state, url: e.target.value })}
                onBlur={(e) => {
                  const v = e.target.value.trim();
                  if (v && !v.match(/^https?:\/\//i)) {
                    setState({ ...state, url: 'https://' + v });
                  }
                }}
                placeholder={placeholder}
                className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm"
              />
              {state.enabled && !state.url && (
                <p className="mt-1.5 text-xs text-orange-600">Ikonėlė rodoma be nuorodos — įveskite URL</p>
              )}
            </div>
          ))}
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
        >
          <Save className="w-5 h-5" />
          {saving ? 'Saugoma...' : 'Išsaugoti viską'}
        </button>
      </div>
    </AdminLayout>
  );
};

export default SettingsPage;
