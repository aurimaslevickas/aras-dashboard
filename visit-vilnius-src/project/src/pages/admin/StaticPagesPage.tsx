import React, { useState, useEffect } from 'react';
import { Save, ChevronDown, ChevronUp, CheckCircle, AlertCircle, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';
import { STATIC_PAGE_DEFAULTS } from '../../lib/staticPageDefaults';

interface StaticPage {
  key: string;
  title: string;
  url: string;
  value_lt: string;
  value_en: string;
}

const PAGES: { key: string; title: string; url: string }[] = [
  { key: 'page_about', title: 'Apie mus', url: '/about' },
  { key: 'page_contact', title: 'Kontaktai', url: '/contact' },
  { key: 'page_privacy', title: 'Privatumo politika', url: '/privacy' },
  { key: 'page_cookies', title: 'Slapukų politika', url: '/cookies' },
  { key: 'page_terms', title: 'Naudojimosi sąlygos', url: '/terms' },
];

const StaticPagesPage = () => {
  const [pages, setPages] = useState<Record<string, StaticPage>>({});
  const [expanded, setExpanded] = useState<string | null>('page_about');
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPages();
  }, []);

  const loadPages = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('key, value_lt, value_en')
        .in('key', PAGES.map((p) => p.key));

      const pagesMap: Record<string, StaticPage> = {};
      PAGES.forEach((page) => {
        const existing = data?.find((d) => d.key === page.key);
        const defaults = STATIC_PAGE_DEFAULTS[page.key];
        pagesMap[page.key] = {
          ...page,
          value_lt: existing?.value_lt || defaults?.lt || '',
          value_en: existing?.value_en || defaults?.en || '',
        };
      });
      setPages(pagesMap);
    } catch (error) {
      console.error('Error loading pages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (key: string) => {
    setSaving(key);
    setMessage(null);
    try {
      const page = pages[key];
      await supabase
        .from('site_settings')
        .upsert(
          { key, value_lt: page.value_lt, value_en: page.value_en, type: 'text', updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );
      setMessage({ type: 'success', text: `"${page.title}" išsaugotas sėkmingai` });
    } catch (error) {
      setMessage({ type: 'error', text: 'Klaida išsaugant puslapį' });
    } finally {
      setSaving(null);
    }
  };

  const updatePage = (key: string, field: 'value_lt' | 'value_en', value: string) => {
    setPages((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
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
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Statiniai puslapiai</h1>
          <p className="text-gray-600 mt-1">Apie mus, Kontaktai, Privatumo politika ir kt.</p>
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
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)} className="ml-auto">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <div className="space-y-3">
          {PAGES.map((pageDef) => {
            const page = pages[pageDef.key];
            const isExpanded = expanded === pageDef.key;

            return (
              <div key={pageDef.key} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <button
                  onClick={() => setExpanded(isExpanded ? null : pageDef.key)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">{pageDef.title}</span>
                    <span className="text-sm text-gray-400 font-mono">{pageDef.url}</span>
                  </div>
                  {isExpanded ? (
                    <ChevronUp className="w-5 h-5 text-gray-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-gray-400" />
                  )}
                </button>

                {isExpanded && page && (
                  <div className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Turinys (LT)
                      </label>
                      <textarea
                        value={page.value_lt}
                        onChange={(e) => updatePage(pageDef.key, 'value_lt', e.target.value)}
                        rows={8}
                        placeholder="Įveskite puslapio turinį lietuvių kalba..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 resize-y text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Turinys (EN)
                      </label>
                      <textarea
                        value={page.value_en}
                        onChange={(e) => updatePage(pageDef.key, 'value_en', e.target.value)}
                        rows={8}
                        placeholder="Enter page content in English..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 resize-y text-sm"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleSave(pageDef.key)}
                        disabled={saving === pageDef.key}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium"
                      >
                        <Save className="w-4 h-4" />
                        {saving === pageDef.key ? 'Saugoma...' : 'Išsaugoti'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
};

export default StaticPagesPage;
