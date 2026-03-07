import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Globe, LogOut, User, Plus } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { getLocalizedUrl, getCategoryUrl, normalizeLocale, type SupportedLocale } from '../lib/localeRoutes';


const Header = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { user, signOut, isAdmin, isProvider } = useAuth();

  const languages = [
    { code: 'lt', name: 'Lietuvių' },
    { code: 'en', name: 'English' },
    { code: 'pl', name: 'Polski' },
    { code: 'de', name: 'Deutsch' },
    { code: 'ru', name: 'Русский' },
    { code: 'fr', name: 'Français' },
  ];

  const changeLanguage = (lng: string) => {
    const newLocale = lng as SupportedLocale;
    i18n.changeLanguage(newLocale);
    const newUrl = getLocalizedUrl(location.pathname, newLocale);
    if (newUrl !== location.pathname) {
      navigate(newUrl);
    }
  };

  const currentLangName = languages.find(l => l.code === i18n.language)?.code.toUpperCase() ?? i18n.language.toUpperCase();

  const locale = normalizeLocale(i18n.language);

  const navigationItems = [
    { label: t('nav.see'), href: getCategoryUrl(locale, 'see') },
    { label: t('nav.events'), href: getCategoryUrl(locale, 'events') },
    { label: t('nav.eat'), href: getCategoryUrl(locale, 'eat') },
    { label: t('nav.bar'), href: getCategoryUrl(locale, 'bar') },
    { label: t('nav.stay'), href: getCategoryUrl(locale, 'stay') },
    { label: t('nav.shop'), href: getCategoryUrl(locale, 'shop') },
    { label: t('nav.plan'), href: '/plan' },
  ];

  return (
    <div>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <h1 className="text-2xl font-bold text-blue-900">VisitVilnius</h1>
              </Link>
              <span className="ml-1 text-sm text-gray-500">.lt</span>
            </div>

            <nav className="hidden lg:flex items-center space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center space-x-3">
              <Link
                to={`/${locale}/${locale === 'lt' ? 'pateikti' : 'submit'}`}
                className="hidden lg:flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-blue-700 border border-blue-300 bg-white hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                {t('nav.submitListing')}
              </Link>

              <div className="relative group">
                <button className="flex items-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-900 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <Globe className="w-4 h-4" />
                  <span>{currentLangName}</span>
                </button>

                <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => changeLanguage(lang.code)}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg ${
                        i18n.language === lang.code ? 'text-blue-600 font-semibold' : 'text-gray-700'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              </div>

              {user ? (
                <div className="relative group">
                  <button className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 hover:text-blue-900 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                    <User className="w-4 h-4" />
                    <span className="hidden md:inline">{user?.email}</span>
                  </button>

                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Admin Dashboard
                      </Link>
                    )}
                    {isProvider && (
                      <Link
                        to="/provider"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Partner Dashboard
                      </Link>
                    )}
                    <button
                      onClick={signOut}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 rounded-b-lg flex items-center space-x-2"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>{t('auth.logout')}</span>
                    </button>
                  </div>
                </div>
              ) : null}

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-gray-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-gray-100">
              <nav className="flex flex-col space-y-2">
                {navigationItems.map((item) => (
                  <Link
                    key={item.href}
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="px-4 py-2 text-left text-gray-700 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
                <div className="pt-2 mt-2 border-t border-gray-100">
                  <Link
                    to={`/${locale}/${locale === 'lt' ? 'pateikti' : 'submit'}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 text-left text-white font-semibold bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {t('nav.submitListing')}
                  </Link>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>
    </div>
  );
};

export default Header;
