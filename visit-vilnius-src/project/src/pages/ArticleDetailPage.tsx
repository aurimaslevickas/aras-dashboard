import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Calendar, Tag, BookOpen } from 'lucide-react';
import { supabase } from '../lib/supabase';
import SEOHead from '../components/SEOHead';
import { normalizeLocale, getCategoryUrl } from '../lib/localeRoutes';
import type { CategoryKey } from '../lib/localeRoutes';
import { trackArticleView } from '../utils/analytics';
import ResponsiveImage from '../components/ResponsiveImage';

interface Article {
  id: string;
  title: string;
  slug: string;
  slug_en?: string;
  slug_pl?: string;
  slug_de?: string;
  slug_ru?: string;
  slug_fr?: string;
  content: string;
  content_en?: string;
  content_pl?: string;
  content_de?: string;
  content_ru?: string;
  content_fr?: string;
  excerpt: string;
  excerpt_en?: string;
  excerpt_pl?: string;
  excerpt_de?: string;
  excerpt_ru?: string;
  excerpt_fr?: string;
  title_en?: string;
  title_pl?: string;
  title_de?: string;
  title_ru?: string;
  title_fr?: string;
  featured_image: string;
  category: string;
  tags: string[];
  meta_description?: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

const ARTICLE_CATEGORY_TO_KEY: Record<string, CategoryKey> = {
  eat: 'eat',
  bar: 'bar',
  stay: 'stay',
  shop: 'shop',
  see: 'see',
  event: 'events',
};

const ArticleDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { t, i18n } = useTranslation();
  const locale = normalizeLocale(i18n.language);

  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchArticle();
  }, [slug]);

  const fetchArticle = async () => {
    try {
      const { data, error } = await supabase
        .from('articles')
        .select('*')
        .or(`slug.eq.${slug},slug_en.eq.${slug},slug_pl.eq.${slug},slug_de.eq.${slug},slug_ru.eq.${slug},slug_fr.eq.${slug}`)
        .eq('published', true)
        .maybeSingle();

      if (error) throw error;
      setArticle(data);
      if (data?.id) trackArticleView(data.id);

      if (data) {
        fetchRelated(data.category, data.id);
      }
    } catch (err) {
      console.error('Error fetching article:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchRelated = async (category: string, excludeId: string) => {
    try {
      const { data } = await supabase
        .from('articles')
        .select('id, title, slug, featured_image, category, created_at, excerpt, tags')
        .eq('category', category)
        .eq('published', true)
        .neq('id', excludeId)
        .limit(3);
      setRelatedArticles(data || []);
    } catch {}
  };

  const getLocalizedTitle = () => {
    if (!article) return '';
    const key = `title_${locale}` as keyof Article;
    return (article[key] as string) || article.title;
  };

  const getLocalizedContent = () => {
    if (!article) return '';
    const key = `content_${locale}` as keyof Article;
    return (article[key] as string) || article.content;
  };

  const getLocalizedExcerpt = () => {
    if (!article) return '';
    const key = `excerpt_${locale}` as keyof Article;
    return (article[key] as string) || article.excerpt;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4" />
          <p className="text-gray-600">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t('articles.notFound')}</h2>
          <p className="text-gray-500 mb-6">{t('articles.notFoundDesc')}</p>
          <Link to={`/${locale}`} className="text-orange-600 hover:text-orange-800 font-medium">
            {t('common.backToHome')}
          </Link>
        </div>
      </div>
    );
  }

  const content = getLocalizedContent();
  const categoryKey = ARTICLE_CATEGORY_TO_KEY[article.category];
  const backUrl = categoryKey ? getCategoryUrl(locale, categoryKey) : `/${locale}`;
  const backLabel = categoryKey ? t(`nav.${categoryKey}`) : t('common.back');

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title={`${getLocalizedTitle()} | Visit Vilnius`}
        description={article.meta_description || getLocalizedExcerpt()}
        image={article.featured_image}
        url={window.location.href}
        type="article"
        slugsByLocale={{
          lt: article.slug,
          en: article.slug_en || article.slug,
          pl: article.slug_pl || article.slug,
          de: article.slug_de || article.slug,
          ru: article.slug_ru || article.slug,
          fr: article.slug_fr || article.slug,
        }}
      />

      {article.featured_image && (
        <div className="relative h-72 md:h-[480px] overflow-hidden">
          <ResponsiveImage
            src={article.featured_image}
            alt={getLocalizedTitle()}
            className="w-full h-full object-cover"
            sizes="100vw"
            widths={[800, 1200, 1600]}
            defaultWidth={1200}
            loading="eager"
            fetchpriority="high"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 container mx-auto px-4 pb-8">
            <div className="max-w-3xl">
              {article.tags && article.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {article.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="px-3 py-1 bg-orange-600 text-white rounded-full text-xs font-bold uppercase tracking-wide">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
              <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight">
                {getLocalizedTitle()}
              </h1>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <Link
              to={backUrl}
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-800 font-medium transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              {backLabel}
            </Link>

            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                <span>{new Date(article.created_at).toLocaleDateString(i18n.language, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              {article.category && (
                <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-full text-xs font-semibold">
                  {categoryKey ? t(`nav.${categoryKey}`) : article.category}
                </span>
              )}
            </div>
          </div>

          {!article.featured_image && (
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
              {getLocalizedTitle()}
            </h1>
          )}

          {getLocalizedExcerpt() && (
            <p className="text-xl text-gray-600 leading-relaxed mb-8 font-light border-l-4 border-orange-500 pl-5">
              {getLocalizedExcerpt()}
            </p>
          )}

          {content ? (
            <div
              className="prose prose-lg prose-gray max-w-none
                prose-headings:font-bold prose-headings:text-gray-900
                prose-p:text-gray-700 prose-p:leading-relaxed
                prose-a:text-orange-600 prose-a:no-underline hover:prose-a:underline
                prose-strong:text-gray-900
                prose-img:rounded-xl prose-img:shadow-md
                prose-ul:text-gray-700 prose-ol:text-gray-700
                prose-li:my-1"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.
              </p>
              <p className="text-gray-700 leading-relaxed mt-4">
                Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt. Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet.
              </p>
            </div>
          )}

          {article.tags && article.tags.length > 0 && (
            <div className="mt-10 pt-8 border-t border-gray-100">
              <div className="flex items-center gap-2 flex-wrap">
                <Tag className="w-4 h-4 text-gray-400" />
                {article.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm hover:bg-orange-50 hover:text-orange-700 transition-colors cursor-default">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {relatedArticles.length > 0 && (
          <div className="max-w-5xl mx-auto mt-16 pt-12 border-t border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('articles.relatedTitle')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((rel, index) => (
                <Link
                  key={rel.id}
                  to={`/articles/${rel.slug}`}
                  className="group block rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100"
                >
                  {rel.featured_image && (
                    <div className="h-40 overflow-hidden">
                      <ResponsiveImage
                        src={rel.featured_image}
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        widths={[400, 600, 800]}
                        defaultWidth={600}
                        loading={index < 3 ? 'eager' : 'lazy'}
                        fetchpriority={index === 0 ? 'high' : 'auto'}
                      />
                    </div>
                  )}
                  <div className="p-4 bg-white">
                    <h3 className="font-semibold text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                      {rel.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(rel.created_at).toLocaleDateString(i18n.language)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ArticleDetailPage;
