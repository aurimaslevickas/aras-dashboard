import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Plus, Building2 } from 'lucide-react';
import { normalizeLocale } from '../lib/localeRoutes';

interface PartnerCTAProps {
  accentColor?: string;
}

export default function PartnerCTA({ accentColor = 'blue' }: PartnerCTAProps) {
  const { t, i18n } = useTranslation();
  const locale = normalizeLocale(i18n.language);
  const submitUrl = `/${locale}/${locale === 'lt' ? 'pateikti' : 'submit'}`;

  const colorMap: Record<string, { border: string; icon: string; button: string; bg: string }> = {
    blue: {
      border: 'border-blue-200',
      icon: 'bg-blue-100 text-blue-600',
      button: 'bg-blue-600 hover:bg-blue-700',
      bg: 'bg-blue-50',
    },
    orange: {
      border: 'border-orange-200',
      icon: 'bg-orange-100 text-orange-600',
      button: 'bg-orange-600 hover:bg-orange-700',
      bg: 'bg-orange-50',
    },
    slate: {
      border: 'border-slate-200',
      icon: 'bg-slate-100 text-slate-600',
      button: 'bg-slate-700 hover:bg-slate-800',
      bg: 'bg-slate-50',
    },
    amber: {
      border: 'border-amber-200',
      icon: 'bg-amber-100 text-amber-600',
      button: 'bg-amber-600 hover:bg-amber-700',
      bg: 'bg-amber-50',
    },
    green: {
      border: 'border-green-200',
      icon: 'bg-green-100 text-green-600',
      button: 'bg-green-600 hover:bg-green-700',
      bg: 'bg-green-50',
    },
  };

  const colors = colorMap[accentColor] || colorMap.blue;

  return (
    <section className="py-10 bg-white border-t border-gray-100">
      <div className="container mx-auto px-4">
        <div className={`${colors.bg} ${colors.border} border rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6`}>
          <div className="flex items-center gap-4">
            <div className={`w-12 h-12 ${colors.icon} rounded-xl flex items-center justify-center flex-shrink-0`}>
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">{t('partner.ctaTitle')}</h3>
              <p className="text-gray-600 text-sm mt-0.5">{t('partner.ctaDesc')}</p>
            </div>
          </div>
          <Link
            to={submitUrl}
            className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 ${colors.button} text-white font-semibold rounded-xl transition-colors shadow-sm`}
          >
            <Plus className="w-4 h-4" />
            {t('partner.ctaButton')}
          </Link>
        </div>
      </div>
    </section>
  );
}
