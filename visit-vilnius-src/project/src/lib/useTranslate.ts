import { useState } from 'react';
import { getValidToken } from './supabase';

export interface TranslationResult {
  [lang: string]: {
    [field: string]: string;
  };
}

export function useTranslate() {
  const [translating, setTranslating] = useState(false);
  const [translateError, setTranslateError] = useState<string | null>(null);

  const translate = async (fields: Record<string, string>): Promise<TranslationResult | null> => {
    setTranslating(true);
    setTranslateError(null);

    try {
      const token = await getValidToken();

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/translate-content`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ fields, sourceLanguage: 'lt' }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error ?? 'Vertimo klaida');
      }

      return data.translations as TranslationResult;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Vertimo klaida';
      setTranslateError(msg);
      return null;
    } finally {
      setTranslating(false);
    }
  };

  return { translate, translating, translateError };
}
