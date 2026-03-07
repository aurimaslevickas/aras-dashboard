import { supabase } from '../lib/supabase';

function getSessionId(): string {
  let sessionId = sessionStorage.getItem('analytics_session');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('analytics_session', sessionId);
  }
  return sessionId;
}

function getDeviceType(): string {
  const ua = navigator.userAgent;
  if (/tablet|ipad|playbook|silk/i.test(ua)) return 'tablet';
  if (/mobile|iphone|ipod|android|blackberry|opera mini|windows phone/i.test(ua)) return 'mobile';
  return 'desktop';
}

function getLanguage(): string {
  const lang = document.documentElement.lang || navigator.language || 'lt';
  return lang.split('-')[0].toLowerCase();
}

export async function trackListingView(listingId: string) {
  const { error } = await supabase.from('analytics_views').insert({
    listing_id: listingId,
    session_id: getSessionId(),
    device_type: getDeviceType(),
    user_language: getLanguage(),
    page_url: window.location.pathname,
    page_type: 'listing',
    referrer: document.referrer || null,
  });
  if (error) console.warn('[analytics] trackListingView error:', error.message);
}

export async function trackArticleView(articleId: string) {
  const { error } = await supabase.from('analytics_views').insert({
    article_id: articleId,
    session_id: getSessionId(),
    device_type: getDeviceType(),
    user_language: getLanguage(),
    page_url: window.location.pathname,
    page_type: 'article',
    referrer: document.referrer || null,
  });
  if (error) console.warn('[analytics] trackArticleView error:', error.message);
}

export async function trackPageView(pagePath: string, pageType = 'other') {
  const { error } = await supabase.from('analytics_page_views').insert({
    page_path: pagePath,
    page_type: pageType,
    session_id: getSessionId(),
    device_type: getDeviceType(),
    user_language: getLanguage(),
    referrer: document.referrer || null,
  });
  if (error) console.warn('[analytics] trackPageView error:', error.message);
}

export async function trackClick(options: {
  listingId?: string;
  articleId?: string;
  clickType: string;
  elementLabel?: string;
}) {
  const { error } = await supabase.from('analytics_clicks').insert({
    listing_id: options.listingId || null,
    article_id: options.articleId || null,
    click_type: options.clickType,
    element_label: options.elementLabel || null,
    session_id: getSessionId(),
    page_url: window.location.pathname,
  });
  if (error) console.warn('[analytics] trackClick error:', error.message);
}
