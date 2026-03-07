import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Eye, Calendar, Utensils, Bed, ShoppingBag, Wine } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const MobileNavigation = () => {
  const location = useLocation();
  const { t } = useTranslation();

  const tabs = [
    { id: 'see', labelKey: 'nav.see', icon: Eye, path: '/see' },
    { id: 'events', labelKey: 'nav.events', icon: Calendar, path: '/events' },
    { id: 'eat', labelKey: 'nav.eat', icon: Utensils, path: '/eat' },
    { id: 'bar', labelKey: 'nav.bar', icon: Wine, path: '/bar' },
    { id: 'stay', labelKey: 'nav.stay', icon: Bed, path: '/stay' },
    { id: 'shop', labelKey: 'nav.shop', icon: ShoppingBag, path: '/shop' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-200 shadow-lg md:hidden">
      <div className="flex">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = location.pathname === tab.path || location.pathname.startsWith(tab.path + '/');
          const label = t(tab.labelKey);
          return (
            <Link
              key={tab.id}
              to={tab.path}
              title={label}
              className={`flex-1 py-2 px-1 flex flex-col items-center gap-0.5 transition-colors min-w-0 ${
                isActive
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-[10px] font-medium leading-tight max-w-full overflow-hidden text-ellipsis whitespace-nowrap px-0.5">
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default MobileNavigation;
