import React, { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useParams } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { SUPPORTED_LOCALES, categorySlugsByLocale, normalizeLocale, type SupportedLocale, type CategoryKey } from './lib/localeRoutes';
import Header from './components/Header';
import SeasonalHero from './components/SeasonalHero';
import EventsSection from './components/EventsSection';
import WhatToSeeSection from './components/WhatToSeeSection';
import EatDrinkSection from './components/EatDrinkSection';
import StaySection from './components/StaySection';
import BarsSection from './components/BarsSection';
import ShoppingSection from './components/ShoppingSection';
import DidYouKnowSection from './components/DidYouKnowSection';
import Footer from './components/Footer';
import MobileNavigation from './components/MobileNavigation';
import ScrollToTop from './components/ScrollToTop';
import CookiesBanner from './components/CookiesBanner';

const AdminPage = lazy(() => import('./pages/AdminPage'));
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
const AdminEventsPage = lazy(() => import('./pages/AdminEventsPage'));
const AdminEventFormPage = lazy(() => import('./pages/AdminEventFormPage'));
const AdminListingsPage = lazy(() => import('./pages/AdminListingsPage'));
const AdminListingFormPage = lazy(() => import('./pages/AdminListingFormPage'));
const AdminUsersPage = lazy(() => import('./pages/AdminUsersPage'));
const AdminArticlesPage = lazy(() => import('./pages/AdminArticlesPage'));
const AdminArticleFormPage = lazy(() => import('./pages/AdminArticleFormPage'));
const AdminLoginHistoryPage = lazy(() => import('./pages/AdminLoginHistoryPage'));
const AdminCategoryPage = lazy(() => import('./pages/AdminCategoryPage'));
const OverviewPage = lazy(() => import('./pages/admin/OverviewPage'));
const PartnersPage = lazy(() => import('./pages/admin/PartnersPage'));
const AnalyticsPage = lazy(() => import('./pages/admin/AnalyticsPage'));
const SettingsPage = lazy(() => import('./pages/admin/SettingsPage'));
const MediaLibraryPage = lazy(() => import('./pages/admin/MediaLibraryPage'));
const StaticPagesPage = lazy(() => import('./pages/admin/StaticPagesPage'));
const HeroImagesPage = lazy(() => import('./pages/admin/HeroImagesPage'));
const CategoryTextsPage = lazy(() => import('./pages/admin/CategoryTextsPage'));
const ListingAnalyticsPage = lazy(() => import('./pages/admin/ListingAnalyticsPage'));
const RevenuePage = lazy(() => import('./pages/admin/RevenuePage'));
const StaticPage = lazy(() => import('./pages/StaticPage'));
const ContentProviderPage = lazy(() => import('./pages/ContentProviderPage'));
const StayPage = lazy(() => import('./pages/StayPage'));
const EatPage = lazy(() => import('./pages/EatPage'));
const PlanPage = lazy(() => import('./pages/PlanPage'));
const ShopPage = lazy(() => import('./pages/ShopPage'));
const BarPage = lazy(() => import('./pages/BarPage'));
const EventsPage = lazy(() => import('./pages/EventsPage'));
const SeePage = lazy(() => import('./pages/SeePage'));
const AttractionDetailPage = lazy(() => import('./pages/AttractionDetailPage'));
const RestaurantDetailPage = lazy(() => import('./pages/RestaurantDetailPage'));
const HotelDetailPage = lazy(() => import('./pages/HotelDetailPage'));
const ShopDetailPage = lazy(() => import('./pages/ShopDetailPage'));
const BarDetailPage = lazy(() => import('./pages/BarDetailPage'));
const EventDetailPage = lazy(() => import('./pages/EventDetailPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('./pages/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('./pages/ResetPasswordPage'));
const PartnerRegisterPage = lazy(() => import('./pages/PartnerRegisterPage'));
const SitemapPage = lazy(() => import('./pages/SitemapPage'));
const ArticleDetailPage = lazy(() => import('./pages/ArticleDetailPage'));
const SubmitEventPage = lazy(() => import('./pages/SubmitEventPage'));
const SubmitListingPage = lazy(() => import('./pages/SubmitListingPage'));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-white">
    <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

const ProtectedAdminRoute = ({ children, adminOnly = false }: { children: React.ReactNode; adminOnly?: boolean }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || (user.role !== 'admin' && user.role !== 'editor')) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
};

const RedirectHome = () => {
  const { i18n } = useTranslation();
  const locale = normalizeLocale(i18n.language);
  return <Navigate to={`/${locale}`} replace />;
};

const RedirectToLocaleCategory = ({ categoryKey }: { categoryKey: CategoryKey }) => {
  const { i18n } = useTranslation();
  const locale = normalizeLocale(i18n.language);
  const slug = categorySlugsByLocale[categoryKey][locale];
  return <Navigate to={`/${locale}/${slug}`} replace />;
};

const LocaleWrapper = ({ children }: { children: React.ReactNode }) => {
  const { locale } = useParams<{ locale: string }>();
  const { i18n } = useTranslation();

  useEffect(() => {
    if (locale && SUPPORTED_LOCALES.includes(locale as SupportedLocale)) {
      if (i18n.language !== locale) {
        i18n.changeLanguage(locale);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  return <>{children}</>;
};

const HomePage = () => (
  <>
    <SeasonalHero />
    <EventsSection />
    <WhatToSeeSection />
    <EatDrinkSection />
    <BarsSection />
    <ShoppingSection />
    <StaySection />
    <DidYouKnowSection />
  </>
);

const Layout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
      <MobileNavigation />
      <div className="h-20 md:hidden" />
      <CookiesBanner />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
        <div className="min-h-screen bg-white flex flex-col">
          <Layout>
            <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<RedirectHome />} />
              <Route path="/sitemap.xml" element={<SitemapPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/partner/register" element={<PartnerRegisterPage />} />
              <Route path="/submit" element={<SubmitListingPage />} />
              <Route path="/admin" element={<ProtectedAdminRoute><OverviewPage /></ProtectedAdminRoute>} />
              <Route path="/admin/dashboard" element={<ProtectedAdminRoute><AdminDashboard /></ProtectedAdminRoute>} />
              <Route path="/admin/partners" element={<ProtectedAdminRoute><PartnersPage /></ProtectedAdminRoute>} />
              <Route path="/admin/analytics" element={<ProtectedAdminRoute><AnalyticsPage /></ProtectedAdminRoute>} />
              <Route path="/admin/events" element={<ProtectedAdminRoute><AdminEventsPage /></ProtectedAdminRoute>} />
              <Route path="/admin/events/new" element={<ProtectedAdminRoute><AdminEventFormPage /></ProtectedAdminRoute>} />
              <Route path="/admin/events/:id" element={<ProtectedAdminRoute><AdminEventFormPage /></ProtectedAdminRoute>} />
              <Route path="/admin/listings" element={<ProtectedAdminRoute><AdminListingsPage /></ProtectedAdminRoute>} />
              <Route path="/admin/listings/new" element={<ProtectedAdminRoute><AdminListingFormPage /></ProtectedAdminRoute>} />
              <Route path="/admin/listings/:id" element={<ProtectedAdminRoute><AdminListingFormPage /></ProtectedAdminRoute>} />
              <Route path="/admin/listings/:id/analytics" element={<ProtectedAdminRoute><ListingAnalyticsPage /></ProtectedAdminRoute>} />
              <Route path="/admin/attractions" element={<ProtectedAdminRoute><AdminCategoryPage category="attraction" title="Lankytinos vietos" description="Valdykite lankytinų vietų sąrašą" newLabel="Nauja lankytina vieta" /></ProtectedAdminRoute>} />
              <Route path="/admin/restaurants" element={<ProtectedAdminRoute><AdminCategoryPage category="restaurant" title="Restoranai ir kavinės" description="Valdykite restoranų ir kavinių sąrašą" newLabel="Naujas restoranas" /></ProtectedAdminRoute>} />
              <Route path="/admin/bars" element={<ProtectedAdminRoute><AdminCategoryPage category="bar" title="Barai ir vyninės" description="Valdykite barų ir vyninių sąrašą" newLabel="Naujas baras" /></ProtectedAdminRoute>} />
              <Route path="/admin/shops" element={<ProtectedAdminRoute><AdminCategoryPage category="shop" title="Parduotuvės" description="Valdykite parduotuvių sąrašą" newLabel="Nauja parduotuvė" /></ProtectedAdminRoute>} />
              <Route path="/admin/hotels" element={<ProtectedAdminRoute><AdminCategoryPage category="hotel" title="Nakvynė" description="Valdykite viešbučių ir nakvynės sąrašą" newLabel="Naujas nakvynės objektas" /></ProtectedAdminRoute>} />
              <Route path="/admin/users" element={<ProtectedAdminRoute adminOnly><AdminUsersPage /></ProtectedAdminRoute>} />
              <Route path="/admin/articles" element={<ProtectedAdminRoute><AdminArticlesPage /></ProtectedAdminRoute>} />
              <Route path="/admin/articles/new" element={<ProtectedAdminRoute><AdminArticleFormPage /></ProtectedAdminRoute>} />
              <Route path="/admin/articles/:id" element={<ProtectedAdminRoute><AdminArticleFormPage /></ProtectedAdminRoute>} />
              <Route path="/admin/logins" element={<ProtectedAdminRoute adminOnly><AdminLoginHistoryPage /></ProtectedAdminRoute>} />
              <Route path="/admin/hero-images" element={<ProtectedAdminRoute><HeroImagesPage /></ProtectedAdminRoute>} />
              <Route path="/admin/category-texts" element={<ProtectedAdminRoute><CategoryTextsPage /></ProtectedAdminRoute>} />
              <Route path="/admin/revenue" element={<ProtectedAdminRoute adminOnly><RevenuePage /></ProtectedAdminRoute>} />
              <Route path="/admin/settings" element={<ProtectedAdminRoute adminOnly><SettingsPage /></ProtectedAdminRoute>} />
              <Route path="/admin/media" element={<ProtectedAdminRoute><MediaLibraryPage /></ProtectedAdminRoute>} />
              <Route path="/admin/pages" element={<ProtectedAdminRoute adminOnly><StaticPagesPage /></ProtectedAdminRoute>} />
              <Route path="/provider" element={<ContentProviderPage />} />
              <Route path="/about" element={<StaticPage page="about" />} />
              <Route path="/contact" element={<StaticPage page="contact" />} />
              <Route path="/privacy" element={<StaticPage page="privacy" />} />
              <Route path="/cookies" element={<StaticPage page="cookies" />} />
              <Route path="/terms" element={<StaticPage page="terms" />} />
              <Route path="/see" element={<RedirectToLocaleCategory categoryKey="see" />} />
              <Route path="/see/:slug" element={<AttractionDetailPage />} />
              <Route path="/events" element={<RedirectToLocaleCategory categoryKey="events" />} />
              <Route path="/events/:slug" element={<EventDetailPage />} />
              <Route path="/eat" element={<RedirectToLocaleCategory categoryKey="eat" />} />
              <Route path="/eat/:slug" element={<RestaurantDetailPage />} />
              <Route path="/bar" element={<RedirectToLocaleCategory categoryKey="bar" />} />
              <Route path="/bar/:slug" element={<BarDetailPage />} />
              <Route path="/stay" element={<RedirectToLocaleCategory categoryKey="stay" />} />
              <Route path="/stay/:slug" element={<HotelDetailPage />} />
              <Route path="/shop" element={<RedirectToLocaleCategory categoryKey="shop" />} />
              <Route path="/shop/:slug" element={<ShopDetailPage />} />
              <Route path="/plan" element={<PlanPage />} />
              <Route path="/articles/:slug" element={<ArticleDetailPage />} />
              <Route path="/:locale/articles/:slug" element={<LocaleWrapper><ArticleDetailPage /></LocaleWrapper>} />

              <Route path="/:locale" element={<LocaleWrapper><HomePage /></LocaleWrapper>} />
              <Route path="/:locale/matyti" element={<LocaleWrapper><SeePage /></LocaleWrapper>} />
              <Route path="/:locale/matyti/:slug" element={<LocaleWrapper><AttractionDetailPage /></LocaleWrapper>} />
              <Route path="/:locale/see" element={<LocaleWrapper><SeePage /></LocaleWrapper>} />
              <Route path="/:locale/see/:slug" element={<LocaleWrapper><AttractionDetailPage /></LocaleWrapper>} />
              <Route path="/:locale/dostoprimechatelnosti" element={<LocaleWrapper><SeePage /></LocaleWrapper>} />
              <Route path="/:locale/dostoprimechatelnosti/:slug" element={<LocaleWrapper><AttractionDetailPage /></LocaleWrapper>} />
              <Route path="/:locale/atrakcje" element={<LocaleWrapper><SeePage /></LocaleWrapper>} />
              <Route path="/:locale/atrakcje/:slug" element={<LocaleWrapper><AttractionDetailPage /></LocaleWrapper>} />
              <Route path="/:locale/sehenswuerdigkeiten" element={<LocaleWrapper><SeePage /></LocaleWrapper>} />
              <Route path="/:locale/sehenswuerdigkeiten/:slug" element={<LocaleWrapper><AttractionDetailPage /></LocaleWrapper>} />
              <Route path="/:locale/decouvrir" element={<LocaleWrapper><SeePage /></LocaleWrapper>} />
              <Route path="/:locale/decouvrir/:slug" element={<LocaleWrapper><AttractionDetailPage /></LocaleWrapper>} />

              <Route path="/:locale/pateikti" element={<LocaleWrapper><SubmitListingPage /></LocaleWrapper>} />
              <Route path="/:locale/submit" element={<LocaleWrapper><SubmitListingPage /></LocaleWrapper>} />
              <Route path="/:locale/renginiai" element={<LocaleWrapper><EventsPage /></LocaleWrapper>} />
              <Route path="/:locale/renginiai/pranesti" element={<LocaleWrapper><SubmitEventPage /></LocaleWrapper>} />
              <Route path="/:locale/renginiai/:slug" element={<LocaleWrapper><EventDetailPage /></LocaleWrapper>} />
              <Route path="/:locale/events" element={<LocaleWrapper><EventsPage /></LocaleWrapper>} />
              <Route path="/:locale/events/submit" element={<LocaleWrapper><SubmitEventPage /></LocaleWrapper>} />
              <Route path="/:locale/events/:slug" element={<LocaleWrapper><EventDetailPage /></LocaleWrapper>} />
              <Route path="/:locale/meropriyatiya" element={<LocaleWrapper><EventsPage /></LocaleWrapper>} />
              <Route path="/:locale/meropriyatiya/:slug" element={<LocaleWrapper><EventDetailPage /></LocaleWrapper>} />
              <Route path="/:locale/wydarzenia" element={<LocaleWrapper><EventsPage /></LocaleWrapper>} />
              <Route path="/:locale/wydarzenia/:slug" element={<LocaleWrapper><EventDetailPage /></LocaleWrapper>} />
              <Route path="/:locale/veranstaltungen" element={<LocaleWrapper><EventsPage /></LocaleWrapper>} />
              <Route path="/:locale/veranstaltungen/:slug" element={<LocaleWrapper><EventDetailPage /></LocaleWrapper>} />
              <Route path="/:locale/evenements" element={<LocaleWrapper><EventsPage /></LocaleWrapper>} />
              <Route path="/:locale/evenements/:slug" element={<LocaleWrapper><EventDetailPage /></LocaleWrapper>} />

              <Route path="/:locale/maitinimas" element={<LocaleWrapper><EatPage /></LocaleWrapper>} />
              <Route path="/:locale/maitinimas/:slug" element={<LocaleWrapper><RestaurantDetailPage /></LocaleWrapper>} />
              <Route path="/:locale/eat" element={<LocaleWrapper><EatPage /></LocaleWrapper>} />
              <Route path="/:locale/eat/:slug" element={<LocaleWrapper><RestaurantDetailPage /></LocaleWrapper>} />
              <Route path="/:locale/eda" element={<LocaleWrapper><EatPage /></LocaleWrapper>} />
              <Route path="/:locale/eda/:slug" element={<LocaleWrapper><RestaurantDetailPage /></LocaleWrapper>} />
              <Route path="/:locale/jedzenie" element={<LocaleWrapper><EatPage /></LocaleWrapper>} />
              <Route path="/:locale/jedzenie/:slug" element={<LocaleWrapper><RestaurantDetailPage /></LocaleWrapper>} />
              <Route path="/:locale/essen" element={<LocaleWrapper><EatPage /></LocaleWrapper>} />
              <Route path="/:locale/essen/:slug" element={<LocaleWrapper><RestaurantDetailPage /></LocaleWrapper>} />
              <Route path="/:locale/restaurants" element={<LocaleWrapper><EatPage /></LocaleWrapper>} />
              <Route path="/:locale/restaurants/:slug" element={<LocaleWrapper><RestaurantDetailPage /></LocaleWrapper>} />

              <Route path="/:locale/barai" element={<LocaleWrapper><BarPage /></LocaleWrapper>} />
              <Route path="/:locale/barai/:slug" element={<LocaleWrapper><BarDetailPage /></LocaleWrapper>} />
              <Route path="/:locale/drinks" element={<LocaleWrapper><BarPage /></LocaleWrapper>} />
              <Route path="/:locale/drinks/:slug" element={<LocaleWrapper><BarDetailPage /></LocaleWrapper>} />
              <Route path="/:locale/bary" element={<LocaleWrapper><BarPage /></LocaleWrapper>} />
              <Route path="/:locale/bary/:slug" element={<LocaleWrapper><BarDetailPage /></LocaleWrapper>} />
              <Route path="/:locale/bars" element={<LocaleWrapper><BarPage /></LocaleWrapper>} />
              <Route path="/:locale/bars/:slug" element={<LocaleWrapper><BarDetailPage /></LocaleWrapper>} />

              <Route path="/:locale/apgyvendinimas" element={<LocaleWrapper><StayPage /></LocaleWrapper>} />
              <Route path="/:locale/apgyvendinimas/:slug" element={<LocaleWrapper><HotelDetailPage /></LocaleWrapper>} />
              <Route path="/:locale/stay" element={<LocaleWrapper><StayPage /></LocaleWrapper>} />
              <Route path="/:locale/stay/:slug" element={<LocaleWrapper><HotelDetailPage /></LocaleWrapper>} />
              <Route path="/:locale/prozhivanie" element={<LocaleWrapper><StayPage /></LocaleWrapper>} />
              <Route path="/:locale/prozhivanie/:slug" element={<LocaleWrapper><HotelDetailPage /></LocaleWrapper>} />
              <Route path="/:locale/noclegi" element={<LocaleWrapper><StayPage /></LocaleWrapper>} />
              <Route path="/:locale/noclegi/:slug" element={<LocaleWrapper><HotelDetailPage /></LocaleWrapper>} />
              <Route path="/:locale/unterkunft" element={<LocaleWrapper><StayPage /></LocaleWrapper>} />
              <Route path="/:locale/unterkunft/:slug" element={<LocaleWrapper><HotelDetailPage /></LocaleWrapper>} />
              <Route path="/:locale/hebergement" element={<LocaleWrapper><StayPage /></LocaleWrapper>} />
              <Route path="/:locale/hebergement/:slug" element={<LocaleWrapper><HotelDetailPage /></LocaleWrapper>} />

              <Route path="/:locale/parduotuves" element={<LocaleWrapper><ShopPage /></LocaleWrapper>} />
              <Route path="/:locale/parduotuves/:slug" element={<LocaleWrapper><ShopDetailPage /></LocaleWrapper>} />
              <Route path="/:locale/shop" element={<LocaleWrapper><ShopPage /></LocaleWrapper>} />
              <Route path="/:locale/shop/:slug" element={<LocaleWrapper><ShopDetailPage /></LocaleWrapper>} />
              <Route path="/:locale/magaziny" element={<LocaleWrapper><ShopPage /></LocaleWrapper>} />
              <Route path="/:locale/magaziny/:slug" element={<LocaleWrapper><ShopDetailPage /></LocaleWrapper>} />
              <Route path="/:locale/sklepy" element={<LocaleWrapper><ShopPage /></LocaleWrapper>} />
              <Route path="/:locale/sklepy/:slug" element={<LocaleWrapper><ShopDetailPage /></LocaleWrapper>} />
              <Route path="/:locale/geschaefte" element={<LocaleWrapper><ShopPage /></LocaleWrapper>} />
              <Route path="/:locale/geschaefte/:slug" element={<LocaleWrapper><ShopDetailPage /></LocaleWrapper>} />
              <Route path="/:locale/boutiques" element={<LocaleWrapper><ShopPage /></LocaleWrapper>} />
              <Route path="/:locale/boutiques/:slug" element={<LocaleWrapper><ShopDetailPage /></LocaleWrapper>} />
            </Routes>
            </Suspense>
          </Layout>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;