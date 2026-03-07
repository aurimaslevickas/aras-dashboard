import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from './supabase';

const LANG_COL: Record<string, string> = {
  lt: 'lt', en: 'en', pl: 'pl', de: 'de', ru: 'ru', fr: 'fr',
};

interface SectionTexts {
  title: string;
  description: string;
}

export function useSectionTexts(sectionKey: string): SectionTexts {
  const { i18n } = useTranslation();
  const [texts, setTexts] = useState<SectionTexts>({ title: '', description: '' });

  useEffect(() => {
    const lang = (i18n.language?.split('-')[0] || 'en') in LANG_COL
      ? i18n.language?.split('-')[0]
      : 'en';

    supabase
      .from('category_sections')
      .select(`title_${lang}, description_${lang}`)
      .eq('key', sectionKey)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setTexts({
            title: (data as Record<string, string>)[`title_${lang}`] || '',
            description: (data as Record<string, string>)[`description_${lang}`] || '',
          });
        }
      });
  }, [i18n.language, sectionKey]);

  return texts;
}
