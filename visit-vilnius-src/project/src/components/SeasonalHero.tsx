import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

const SEASON_BY_MONTH: Record<number, string> = {
  3: 'spring', 4: 'spring', 5: 'spring',
  6: 'summer', 7: 'summer', 8: 'summer',
  9: 'autumn', 10: 'autumn', 11: 'autumn',
  12: 'winter', 1: 'winter', 2: 'winter',
};

const FALLBACK_BY_SEASON: Record<string, string> = {
  spring: 'https://images.pexels.com/photos/3844796/pexels-photo-3844796.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&fit=crop',
  summer: 'https://images.pexels.com/photos/13848685/pexels-photo-13848685.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&fit=crop',
  autumn: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&fit=crop',
  winter: 'https://images.pexels.com/photos/13848688/pexels-photo-13848688.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&fit=crop',
};

const ROTATE_INTERVAL = 6000;

const LANG_COL: Record<string, string> = {
  lt: 'value_lt',
  en: 'value_en',
  pl: 'value_pl',
  de: 'value_de',
  ru: 'value_ru',
  fr: 'value_fr',
};

interface HeroImageData {
  image_url: string;
  sort_order: number;
  photographer_name: string;
  photographer_url: string;
}

const SeasonalHero: React.FC = () => {
  const { t, i18n } = useTranslation();
  const [imageData, setImageData] = useState<HeroImageData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [welcomePrefix, setWelcomePrefix] = useState('');
  const [heroTitle, setHeroTitle] = useState('');
  const [heroDescription, setHeroDescription] = useState('');

  const currentSeason = SEASON_BY_MONTH[new Date().getMonth() + 1] || 'summer';

  const images = imageData.length > 0
    ? imageData.map(d => d.image_url)
    : [FALLBACK_BY_SEASON[currentSeason]];

  const currentAttribution = imageData[currentIndex];

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from('hero_season_images')
        .select('image_url, sort_order, photographer_name, photographer_url')
        .eq('season', currentSeason)
        .order('sort_order');

      if (data && data.length > 0) {
        setImageData(data as HeroImageData[]);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const loadTexts = async () => {
      const lang = i18n.language?.split('-')[0] || 'en';
      const col = LANG_COL[lang] || 'value_en';

      const { data } = await supabase
        .from('site_settings')
        .select(`key, ${col}`)
        .in('key', ['hero_welcome_prefix', 'hero_title', 'hero_description']);

      if (data) {
        const map: Record<string, string> = {};
        data.forEach((row: Record<string, string>) => {
          map[row.key] = row[col] || '';
        });
        setWelcomePrefix(map['hero_welcome_prefix'] || t('hero.subtitle', 'Welcome to'));
        setHeroTitle(map['hero_title'] || 'Vilnius');
        setHeroDescription(map['hero_description'] || t('hero.description', "Explore the capital's beauty, flavors and culture"));
      }
    };
    loadTexts();
  }, [i18n.language]);

  useEffect(() => {
    if (images.length <= 1) return;
    timerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, ROTATE_INTERVAL);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [images]);

  const handleDotClick = (i: number) => {
    setCurrentIndex(i);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % images.length);
    }, ROTATE_INTERVAL);
  };

  return (
    <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
      {images.map((img, i) => (
        <div
          key={img}
          className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-opacity duration-1000"
          style={{
            backgroundImage: `url(${img})`,
            opacity: i === currentIndex ? 1 : 0,
          }}
        />
      ))}

      <div className="absolute inset-0 bg-black/50" />

      {currentAttribution?.photographer_name && (
        <div className="absolute bottom-12 right-4 z-20 pointer-events-none">
          {currentAttribution.photographer_url ? (
            <a
              href={currentAttribution.photographer_url}
              target="_blank"
              rel="noopener noreferrer"
              className="pointer-events-auto inline-flex items-center gap-1 px-2 py-1 rounded bg-black/40 backdrop-blur-sm text-white/80 text-xs hover:text-white transition-colors"
            >
              <span className="opacity-60">&#169;</span>
              <span>{currentAttribution.photographer_name}</span>
            </a>
          ) : (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded bg-black/40 backdrop-blur-sm text-white/80 text-xs">
              <span className="opacity-60">&#169;</span>
              <span>{currentAttribution.photographer_name}</span>
            </span>
          )}
        </div>
      )}

      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          {welcomePrefix || t('hero.subtitle', 'Welcome to')}
          <span className="block text-yellow-400">{heroTitle || 'Vilnius'}</span>
        </h1>

        <p className="text-xl md:text-2xl mb-10 text-gray-100 max-w-3xl mx-auto leading-relaxed">
          {heroDescription || t('hero.description', "Explore the capital's beauty, flavors and culture")}
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/plan"
            className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-8 py-4 rounded-full text-xl font-bold transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3 shadow-2xl"
          >
            <MapPin className="w-6 h-6" />
            <span>{t('nav.plan', 'Plan a Trip')}</span>
          </Link>
        </div>
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {images.map((_, i) => (
            <button
              key={i}
              onClick={() => handleDotClick(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === currentIndex ? 'bg-white w-6' : 'bg-white/50 w-2 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      )}
    </section>
  );
};

export default SeasonalHero;
