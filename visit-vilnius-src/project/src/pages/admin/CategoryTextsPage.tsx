import React, { useState, useEffect } from 'react';
import { Save, Loader2, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase, adminFetch } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';

interface SectionTexts {
  key: string;
  title_lt: string; title_en: string; title_pl: string; title_de: string; title_ru: string; title_fr: string;
  description_lt: string; description_en: string; description_pl: string; description_de: string; description_ru: string; description_fr: string;
}

const SECTIONS = [
  { key: 'see', label: 'Ką pamatyti', icon: '🏛️' },
  { key: 'eat', label: 'Kur valgyti', icon: '🍽️' },
  { key: 'bar', label: 'Barai ir vyninės', icon: '🍷' },
  { key: 'stay', label: 'Kur nakvoti', icon: '🏨' },
  { key: 'shop', label: 'Apsipirkimas', icon: '🛍️' },
  { key: 'events', label: 'Renginiai', icon: '🎭' },
];

const LANGUAGES = [
  { code: 'lt', label: 'Lietuvių', flag: '🇱🇹' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
];

const empty = (): SectionTexts => ({
  key: '',
  title_lt: '', title_en: '', title_pl: '', title_de: '', title_ru: '', title_fr: '',
  description_lt: '', description_en: '', description_pl: '', description_de: '', description_ru: '', description_fr: '',
});

const CategoryTextsPage: React.FC = () => {
  const [data, setData] = useState<Record<string, SectionTexts>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, { type: 'success' | 'error'; text: string }>>({});
  const [expanded, setExpanded] = useState<string>('see');
  const [activeLang, setActiveLang] = useState<Record<string, string>>({});

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    const { data: rows } = await supabase
      .from('category_sections')
      .select('*')
      .in('key', SECTIONS.map(s => s.key));

    const map: Record<string, SectionTexts> = {};
    SECTIONS.forEach(s => { map[s.key] = { ...empty(), key: s.key }; });
    (rows || []).forEach(r => { map[r.key] = r; });
    setData(map);

    const langs: Record<string, string> = {};
    SECTIONS.forEach(s => { langs[s.key] = 'lt'; });
    setActiveLang(langs);
    setLoading(false);
  };

  const updateField = (sectionKey: string, field: string, value: string) => {
    setData(prev => ({
      ...prev,
      [sectionKey]: { ...prev[sectionKey], [field]: value },
    }));
  };

  const handleSave = async (sectionKey: string) => {
    setSaving(sectionKey);
    setMessages(prev => ({ ...prev, [sectionKey]: undefined as any }));
    const row = data[sectionKey];
    try {
      await adminFetch('admin-write', {
        action: 'upsert',
        table: 'category_sections',
        payload: { ...row, updated_at: new Date().toISOString() },
      });
      setMessages(prev => ({ ...prev, [sectionKey]: { type: 'success', text: 'Išsaugota sėkmingai' } }));
    } catch (err: any) {
      setMessages(prev => ({ ...prev, [sectionKey]: { type: 'error', text: err?.message || 'Klaida išsaugant' } }));
    } finally {
      setSaving(null);
    }
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
      <div className="space-y-4 max-w-4xl">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sekcijų tekstai</h1>
          <p className="text-gray-600 mt-1">Redaguokite pagrindinio puslapio sekcijų antraštes ir aprašymus visomis kalbomis.</p>
        </div>

        {SECTIONS.map(section => {
          const isOpen = expanded === section.key;
          const texts = data[section.key] || empty();
          const lang = activeLang[section.key] || 'lt';
          const msg = messages[section.key];

          return (
            <div key={section.key} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? '' : section.key)}
                className="w-full flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{section.icon}</span>
                  <div className="text-left">
                    <p className="font-semibold text-gray-900">{section.label}</p>
                    <p className="text-sm text-gray-500 truncate max-w-sm">
                      {texts.title_lt || <span className="italic text-gray-400">Nėra antraštės</span>}
                    </p>
                  </div>
                </div>
                {isOpen ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>

              {isOpen && (
                <div className="border-t border-gray-100 px-6 pb-6 pt-4 space-y-4">
                  {msg && (
                    <div className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
                      msg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {msg.type === 'success' ? <CheckCircle className="w-4 h-4 flex-shrink-0" /> : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                      {msg.text}
                    </div>
                  )}

                  <div className="flex gap-1 flex-wrap">
                    {LANGUAGES.map(l => (
                      <button
                        key={l.code}
                        onClick={() => setActiveLang(prev => ({ ...prev, [section.key]: l.code }))}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          lang === l.code ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <span>{l.flag}</span>
                        {l.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Antraštė
                      </label>
                      <input
                        type="text"
                        value={texts[`title_${lang}` as keyof SectionTexts] as string}
                        onChange={e => updateField(section.key, `title_${lang}`, e.target.value)}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Aprašymas
                      </label>
                      <textarea
                        value={texts[`description_${lang}` as keyof SectionTexts] as string}
                        onChange={e => updateField(section.key, `description_${lang}`, e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 resize-none"
                      />
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                      <p className="text-xs text-gray-500 mb-2 font-medium uppercase tracking-wide">Peržiūra</p>
                      <p className="font-bold text-gray-900 text-lg">{texts[`title_${lang}` as keyof SectionTexts] as string || '—'}</p>
                      <p className="text-gray-600 text-sm mt-1">{texts[`description_${lang}` as keyof SectionTexts] as string || '—'}</p>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSave(section.key)}
                      disabled={saving === section.key}
                      className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium text-sm"
                    >
                      {saving === section.key ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                      {saving === section.key ? 'Saugoma...' : 'Išsaugoti'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </AdminLayout>
  );
};

export default CategoryTextsPage;
