import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Save, ArrowLeft, Languages, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { useTranslate } from '../lib/useTranslate';
import ImageUploadField from '../components/admin/ImageUploadField';

interface ArticleFormData {
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featured_image: string;
  category: string;
  tags: string[];
  meta_description: string;
  meta_keywords: string;
  published: boolean;
  featured: boolean;
  title_en: string;
  title_pl: string;
  title_de: string;
  title_ru: string;
  title_fr: string;
  slug_en: string;
  slug_pl: string;
  slug_de: string;
  slug_ru: string;
  slug_fr: string;
  content_en: string;
  content_pl: string;
  content_de: string;
  content_ru: string;
  content_fr: string;
  excerpt_en: string;
  excerpt_pl: string;
  excerpt_de: string;
  excerpt_ru: string;
  excerpt_fr: string;
}

const initialFormData: ArticleFormData = {
  title: '',
  slug: '',
  content: '',
  excerpt: '',
  featured_image: '',
  category: 'eat',
  tags: [],
  meta_description: '',
  meta_keywords: '',
  published: false,
  featured: false,
  title_en: '',
  title_pl: '',
  title_de: '',
  title_ru: '',
  title_fr: '',
  slug_en: '',
  slug_pl: '',
  slug_de: '',
  slug_ru: '',
  slug_fr: '',
  content_en: '',
  content_pl: '',
  content_de: '',
  content_ru: '',
  content_fr: '',
  excerpt_en: '',
  excerpt_pl: '',
  excerpt_de: '',
  excerpt_ru: '',
  excerpt_fr: '',
};

const LANG_LABELS: Record<string, string> = {
  en: 'English',
  pl: 'Polski',
  de: 'Deutsch',
  ru: 'Русский',
  fr: 'Français',
};

const categories = [
  { value: 'event', label: 'Renginiai' },
  { value: 'eat', label: 'Restoranai' },
  { value: 'bar', label: 'Barai' },
  { value: 'shop', label: 'Parduotuvės' },
  { value: 'stay', label: 'Apgyvendinimas' },
  { value: 'see', label: 'Atrakcijos' },
];

export default function AdminArticleFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { translate, translating, translateError } = useTranslate();

  const [formData, setFormData] = useState<ArticleFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');
  const [activeTab, setActiveTab] = useState<'lt' | 'translations'>('lt');
  const [translateSuccess, setTranslateSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchArticle();
    }
  }, [id]);

  const fetchArticle = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      if (data) {
        setFormData({
          title: data.title || '',
          slug: data.slug || '',
          content: data.content || '',
          excerpt: data.excerpt || '',
          featured_image: data.featured_image || '',
          category: data.category || 'eat',
          tags: data.tags || [],
          meta_description: data.meta_description || '',
          meta_keywords: data.meta_keywords || '',
          published: data.published || false,
          featured: data.featured || false,
          title_en: data.title_en || '',
          title_pl: data.title_pl || '',
          title_de: data.title_de || '',
          title_ru: data.title_ru || '',
          title_fr: data.title_fr || '',
          slug_en: data.slug_en || '',
          slug_pl: data.slug_pl || '',
          slug_de: data.slug_de || '',
          slug_ru: data.slug_ru || '',
          slug_fr: data.slug_fr || '',
          content_en: data.content_en || '',
          content_pl: data.content_pl || '',
          content_de: data.content_de || '',
          content_ru: data.content_ru || '',
          content_fr: data.content_fr || '',
          excerpt_en: data.excerpt_en || '',
          excerpt_pl: data.excerpt_pl || '',
          excerpt_de: data.excerpt_de || '',
          excerpt_ru: data.excerpt_ru || '',
          excerpt_fr: data.excerpt_fr || '',
        });
      }
    } catch (error) {
      console.error('Error fetching article:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({ ...formData, title, slug: generateSlug(title) });
  };

  const handleAutoTranslate = async () => {
    if (!formData.title) return;
    setTranslateSuccess(false);

    const fieldsToTranslate: Record<string, string> = {
      title: formData.title,
    };
    if (formData.excerpt) fieldsToTranslate.excerpt = formData.excerpt;
    if (formData.content) fieldsToTranslate.content = formData.content;

    const result = await translate(fieldsToTranslate);

    if (result) {
      setFormData(prev => ({
        ...prev,
        title_en: result.en?.title || prev.title_en,
        title_pl: result.pl?.title || prev.title_pl,
        title_de: result.de?.title || prev.title_de,
        title_ru: result.ru?.title || prev.title_ru,
        title_fr: result.fr?.title || prev.title_fr,
        slug_en: result.en?.slug || prev.slug_en,
        slug_pl: result.pl?.slug || prev.slug_pl,
        slug_de: result.de?.slug || prev.slug_de,
        slug_ru: result.ru?.slug || prev.slug_ru,
        slug_fr: result.fr?.slug || prev.slug_fr,
        content_en: result.en?.content || prev.content_en,
        content_pl: result.pl?.content || prev.content_pl,
        content_de: result.de?.content || prev.content_de,
        content_ru: result.ru?.content || prev.content_ru,
        content_fr: result.fr?.content || prev.content_fr,
        excerpt_en: result.en?.excerpt || prev.excerpt_en,
        excerpt_pl: result.pl?.excerpt || prev.excerpt_pl,
        excerpt_de: result.de?.excerpt || prev.excerpt_de,
        excerpt_ru: result.ru?.excerpt || prev.excerpt_ru,
        excerpt_fr: result.fr?.excerpt || prev.excerpt_fr,
      }));
      setTranslateSuccess(true);
      setActiveTab('translations');
      setTimeout(() => setTranslateSuccess(false), 4000);
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.slug || !formData.category) return;

    try {
      setLoading(true);
      const articleData = { ...formData, updated_at: new Date().toISOString() };

      if (id) {
        const { error } = await supabase.from('articles').update(articleData).eq('id', id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('articles').insert([{ ...articleData, author_id: 'Administrator' }]);
        if (error) throw error;
      }

      navigate('/admin/articles');
    } catch (error) {
      console.error('Error saving article:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/admin/articles')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Atgal į straipsnius
          </button>
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold text-gray-900">
              {id ? 'Redaguoti straipsnį' : 'Naujas straipsnis'}
            </h1>
            <button
              type="button"
              onClick={handleAutoTranslate}
              disabled={translating || !formData.title}
              className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm font-medium"
            >
              {translating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Languages className="w-4 h-4" />}
              {translating ? 'Verčiama...' : 'Auto-vertimas į 5 kalbas'}
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">

          {translateError && (
            <div className="mb-4 flex items-center gap-3 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {translateError}
            </div>
          )}

          {translateSuccess && (
            <div className="mb-4 flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-700 text-sm">
              <CheckCircle className="w-4 h-4 flex-shrink-0" />
              Straipsnis sėkmingai išverstas į 5 kalbas
            </div>
          )}

          <div className="flex gap-1 mb-6 border-b border-gray-200">
            <button
              type="button"
              onClick={() => setActiveTab('lt')}
              className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                activeTab === 'lt'
                  ? 'bg-white border border-b-white border-gray-200 text-orange-600 -mb-px'
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
                  ? 'bg-white border border-b-white border-gray-200 text-orange-600 -mb-px'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              Vertimai (EN, PL, DE, RU, FR)
            </button>
          </div>

          {activeTab === 'lt' && (
            <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pavadinimas *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="Įveskite straipsnio pavadinimą"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL kelias *</label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="straipsnio-url-kelias"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Kategorija *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  required
                >
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Trumpas aprašymas</label>
                <textarea
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={3}
                  placeholder="Trumpas aprašymas, rodomas sąraše"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Turinys</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono"
                  rows={15}
                  placeholder="Straipsnio turinys (palaikomas HTML)"
                />
              </div>

              <ImageUploadField
                value={formData.featured_image}
                onChange={(url) => setFormData(prev => ({ ...prev, featured_image: url }))}
                label="Pagrindinis paveikslas"
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Žymos</label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholder="Įveskite žymą ir spauskite Enter"
                  />
                  <button type="button" onClick={addTag} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700">
                    Pridėti
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-orange-900">×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta aprašymas (SEO)</label>
                <textarea
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  rows={2}
                  placeholder="SEO meta aprašymas"
                  maxLength={160}
                />
                <p className="text-xs text-gray-500 mt-1">{formData.meta_description.length}/160 simbolių</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Meta raktažodžiai (SEO)</label>
                <input
                  type="text"
                  value={formData.meta_keywords}
                  onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  placeholder="raktažodis1, raktažodis2"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.published}
                    onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Publikuotas</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                    className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Rodyti kategorijos puslapyje</span>
                </label>
              </div>

              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Saugoma...' : id ? 'Atnaujinti straipsnį' : 'Sukurti straipsnį'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/articles')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Atšaukti
                </button>
              </div>
            </div>
          )}

          {activeTab === 'translations' && (
            <div className="space-y-6">
              <p className="text-sm text-gray-500">
                Vertimai generuojami automatiškai paspaudus "Auto-vertimas". Galite juos redaguoti rankiniu būdu.
              </p>
              {(['en', 'pl', 'de', 'ru', 'fr'] as const).map((lang) => (
                <div key={lang} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
                  <h3 className="font-semibold text-gray-800 text-base">{LANG_LABELS[lang]}</h3>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Pavadinimas</label>
                    <input
                      type="text"
                      value={(formData as Record<string, unknown>)[`title_${lang}`] as string || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [`title_${lang}`]: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slug</label>
                    <input
                      type="text"
                      value={(formData as Record<string, unknown>)[`slug_${lang}`] as string || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [`slug_${lang}`]: e.target.value }))}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trumpas aprašymas</label>
                    <textarea
                      value={(formData as Record<string, unknown>)[`excerpt_${lang}`] as string || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [`excerpt_${lang}`]: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Turinys</label>
                    <textarea
                      value={(formData as Record<string, unknown>)[`content_${lang}`] as string || ''}
                      onChange={(e) => setFormData(prev => ({ ...prev, [`content_${lang}`]: e.target.value }))}
                      rows={10}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent font-mono text-sm"
                    />
                  </div>
                </div>
              ))}

              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  onClick={handleSubmit}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                >
                  <Save className="w-5 h-5" />
                  {loading ? 'Saugoma...' : id ? 'Atnaujinti straipsnį' : 'Sukurti straipsnį'}
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/admin/articles')}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Atšaukti
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
