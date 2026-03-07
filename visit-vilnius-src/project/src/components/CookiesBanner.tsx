import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Cookie, X } from 'lucide-react';

const COOKIE_KEY = 'vv_cookies_accepted';
const COOKIE_DAYS = 30;

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
}

function grantGA4Consent() {
  if (typeof window.gtag === 'function') {
    window.gtag('consent', 'update', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
    });
  }
}

const CookiesBanner = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const accepted = localStorage.getItem(COOKIE_KEY);
    if (accepted) {
      grantGA4Consent();
    } else {
      const timer = setTimeout(() => setVisible(true), 800);
      return () => clearTimeout(timer);
    }
  }, []);

  const accept = () => {
    const expires = new Date();
    expires.setDate(expires.getDate() + COOKIE_DAYS);
    localStorage.setItem(COOKIE_KEY, expires.toISOString());
    grantGA4Consent();
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 md:bottom-6 md:left-6 md:right-auto">
      <div className="bg-white border border-gray-200 shadow-2xl md:rounded-2xl p-5 md:max-w-sm w-full">
        <div className="flex items-start gap-3 mb-4">
          <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0">
            <Cookie className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm mb-1">Slapukai</h3>
            <p className="text-xs text-gray-600 leading-relaxed">
              Naudojame slapukus svetainės veikimui gerinti ir analizei (Google Analytics). Sutikdami leidžiate rinkti anoniminius lankomumo duomenis.
            </p>
          </div>
          <button
            onClick={() => setVisible(false)}
            className="text-gray-400 hover:text-gray-600 ml-auto flex-shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={accept}
            className="flex-1 py-2.5 px-4 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Sutinku
          </button>
          <Link
            to="/cookies"
            className="flex-1 py-2.5 px-4 border border-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50 transition-colors text-center"
          >
            Sužinoti daugiau
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CookiesBanner;
