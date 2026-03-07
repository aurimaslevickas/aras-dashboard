import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { STATIC_PAGE_DEFAULTS } from '../lib/staticPageDefaults';

interface StaticPageConfig {
  key: string;
  title: string;
  backLabel: string;
}

const PAGE_CONFIG: Record<string, StaticPageConfig> = {
  about: { key: 'page_about', title: 'Apie mus', backLabel: 'Grįžti' },
  contact: { key: 'page_contact', title: 'Kontaktai', backLabel: 'Grįžti' },
  privacy: { key: 'page_privacy', title: 'Privatumo politika', backLabel: 'Grįžti' },
  cookies: { key: 'page_cookies', title: 'Slapukų politika', backLabel: 'Grįžti' },
  terms: { key: 'page_terms', title: 'Naudojimosi sąlygos', backLabel: 'Grįžti' },
};


interface StaticPageProps {
  page: string;
}

const StaticPage = ({ page }: StaticPageProps) => {
  const config = page ? PAGE_CONFIG[page] : null;
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!config) {
      setLoading(false);
      return;
    }
    loadContent();
  }, [page]);

  const loadContent = async () => {
    try {
      const { data } = await supabase
        .from('site_settings')
        .select('value_lt')
        .eq('key', config!.key)
        .maybeSingle();

      setContent(data?.value_lt || STATIC_PAGE_DEFAULTS[config!.key]?.lt || '');
    } catch (error) {
      setContent(STATIC_PAGE_DEFAULTS[config!.key]?.lt || '');
    } finally {
      setLoading(false);
    }
  };

  if (!config) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Puslapis nerastas</h2>
          <Link to="/" className="text-blue-600 hover:text-blue-800">Grįžti į pradžią</Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium">
            <ArrowLeft className="w-4 h-4" />
            {config.backLabel}
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">{config.title}</h1>
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="prose prose-gray max-w-none">
              {content.split('\n').map((paragraph, i) => {
                if (!paragraph.trim()) return <br key={i} />;
                return (
                  <p key={i} className="text-gray-700 leading-relaxed mb-4">
                    {paragraph}
                  </p>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StaticPage;
