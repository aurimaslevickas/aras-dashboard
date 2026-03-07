import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Instagram, Facebook, Mail, Phone, MapPin, Heart } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SocialLinks {
  facebook_enabled: boolean;
  facebook_url: string;
  instagram_enabled: boolean;
  instagram_url: string;
  tiktok_enabled: boolean;
  tiktok_url: string;
  x_enabled: boolean;
  x_url: string;
}

const XIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.63L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
  </svg>
);

const TikTokIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.93a8.16 8.16 0 0 0 4.77 1.52V7a4.85 4.85 0 0 1-1-.31z" />
  </svg>
);

const Footer = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  const [social, setSocial] = useState<SocialLinks>({
    facebook_enabled: false, facebook_url: '',
    instagram_enabled: false, instagram_url: '',
    tiktok_enabled: false, tiktok_url: '',
    x_enabled: false, x_url: '',
  });

  useEffect(() => {
    const loadSocial = async () => {
      const { data } = await supabase
        .from('site_settings')
        .select('key, value_lt')
        .in('key', [
          'social_facebook_enabled', 'social_facebook_url',
          'social_instagram_enabled', 'social_instagram_url',
          'social_tiktok_enabled', 'social_tiktok_url',
          'social_x_enabled', 'social_x_url',
        ]);
      if (data) {
        const map: Record<string, string> = {};
        data.forEach((s) => { map[s.key] = s.value_lt || ''; });
        setSocial({
          facebook_enabled: map['social_facebook_enabled'] === 'true',
          facebook_url: map['social_facebook_url'] || '',
          instagram_enabled: map['social_instagram_enabled'] === 'true',
          instagram_url: map['social_instagram_url'] || '',
          tiktok_enabled: map['social_tiktok_enabled'] === 'true',
          tiktok_url: map['social_tiktok_url'] || '',
          x_enabled: map['social_x_enabled'] === 'true',
          x_url: map['social_x_url'] || '',
        });
      }
    };
    loadSocial();
  }, []);

  const quickLinks = [
    { key: 'footer.aboutUs', to: '/about' },
    { key: 'footer.contact', to: '/contact' },
  ];

  const legalLinks = [
    { key: 'footer.privacy', to: '/privacy' },
    { key: 'footer.terms', to: '/terms' },
    { key: 'footer.cookiePolicy', to: '/cookies' },
  ];

  const activeSocials = [
    social.facebook_enabled && {
      href: social.facebook_url,
      icon: <Facebook className="w-5 h-5" />,
      hover: 'hover:bg-blue-600',
    },
    social.instagram_enabled && {
      href: social.instagram_url,
      icon: <Instagram className="w-5 h-5" />,
      hover: 'hover:bg-pink-600',
    },
    social.tiktok_enabled && {
      href: social.tiktok_url,
      icon: <TikTokIcon />,
      hover: 'hover:bg-gray-600',
    },
    social.x_enabled && {
      href: social.x_url,
      icon: <XIcon />,
      hover: 'hover:bg-gray-600',
    },
  ].filter(Boolean) as { href: string; icon: React.ReactNode; hover: string }[];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          <div className="lg:col-span-1">
            <div className="flex items-center mb-4">
              <h3 className="text-2xl font-bold text-white">VisitVilnius</h3>
              <span className="ml-1 text-sm text-gray-400">.lt</span>
            </div>
            <p className="text-gray-400 mb-6 leading-relaxed">
              {t('footer.tagline')}
            </p>
            {activeSocials.length > 0 && (
              <div className="flex space-x-3">
                {activeSocials.map((s, i) =>
                  s.href ? (
                    <a
                      key={i}
                      href={s.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`p-2 bg-gray-800 ${s.hover} rounded-full transition-colors`}
                    >
                      {s.icon}
                    </a>
                  ) : (
                    <span
                      key={i}
                      className="p-2 bg-gray-800 rounded-full opacity-50 cursor-default"
                    >
                      {s.icon}
                    </span>
                  )
                )}
              </div>
            )}
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.key}>
                  <Link to={link.to} className="text-gray-400 hover:text-white transition-colors">
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.legalPrivacy')}</h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.key}>
                  <Link to={link.to} className="text-gray-400 hover:text-white transition-colors">
                    {t(link.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.contactSupport')}</h4>
            <div className="space-y-4">
              <div className="flex items-center space-x-3 text-gray-400">
                <Mail className="w-5 h-5 text-blue-400" />
                <span>hello@visitvilnius.lt</span>
              </div>
              <div className="flex items-center space-x-3 text-gray-400">
                <Phone className="w-5 h-5 text-green-400" />
                <span>+370 123 45678</span>
              </div>
              <div className="flex items-start space-x-3 text-gray-400">
                <MapPin className="w-5 h-5 text-red-400 mt-0.5" />
                <span>Gedimino pr. 9<br />Vilnius, Lithuania</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              © {currentYear} VisitVilnius.lt. {t('footer.allRightsReserved')}
            </p>
            <div className="flex items-center space-x-1 text-gray-400 text-sm">
              <span>{t('footer.madeWith')}</span>
              <Heart className="w-4 h-4 text-red-500 fill-current" />
              <span>{t('footer.inVilnius')}</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
