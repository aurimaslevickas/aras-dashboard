import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Calendar,
  BookOpen,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Image,
  FileText,
  MapPin,
  UtensilsCrossed,
  Wine,
  ShoppingBag,
  Hotel,
  Layers,
  Type,
  DollarSign,
  ChevronDown,
  ChevronRight,
  Globe,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [pagesOpen, setPagesOpen] = useState(false);
  const isAdmin = user?.role === 'admin';

  const pagesSubPaths = [
    '/admin/hero-images',
    '/admin/category-texts',
    '/admin/pages',
    '/admin/settings',
  ];

  const isPagesActive = pagesSubPaths.some(p => location.pathname.startsWith(p));

  React.useEffect(() => {
    if (isPagesActive) setPagesOpen(true);
  }, [isPagesActive]);

  const isActive = (path: string, exact?: boolean) => {
    if (exact) return location.pathname === path;
    return location.pathname.startsWith(path);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/admin/login');
  };

  const mainNavItems = [
    { path: '/admin', icon: LayoutDashboard, label: 'Apžvalga', exact: true },
    { path: '/admin/events', icon: Calendar, label: 'Renginiai' },
    { path: '/admin/attractions', icon: MapPin, label: 'Lankytinos vietos' },
    { path: '/admin/restaurants', icon: UtensilsCrossed, label: 'Restoranai ir kavinės' },
    { path: '/admin/bars', icon: Wine, label: 'Barai ir vyninės' },
    { path: '/admin/shops', icon: ShoppingBag, label: 'Parduotuvės' },
    { path: '/admin/hotels', icon: Hotel, label: 'Nakvynė' },
    { path: '/admin/articles', icon: BookOpen, label: 'Straipsniai' },
    { path: '/admin/media', icon: Image, label: 'Medijų biblioteka' },
  ];

  const pagesSubItems = [
    { path: '/admin/hero-images', icon: Layers, label: 'Titulinis puslapis' },
    { path: '/admin/category-texts', icon: Type, label: 'Sekcijų tekstai' },
    { path: '/admin/pages', icon: FileText, label: 'Statiniai puslapiai' },
    ...(isAdmin ? [{ path: '/admin/settings', icon: Settings, label: 'Nustatymai' }] : []),
  ];

  const adminOnlyItems = [
    { path: '/admin/revenue', icon: DollarSign, label: 'Pajamos' },
    { path: '/admin/users', icon: Users, label: 'Vartotojai' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-40">
        <div className="flex items-center justify-between h-full px-4">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <Link to="/admin" className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
              Visit Vilnius Admin
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:block text-right">
              <p className="text-sm font-medium text-gray-900">{user?.email}</p>
              <p className="text-xs text-gray-500">{user?.role === 'admin' ? 'Administratorius' : 'Redaktorius'}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Atsijungti</span>
            </button>
          </div>
        </div>
      </div>

      <div className={`fixed top-16 left-0 bottom-0 w-64 bg-white border-r border-gray-200 z-30 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        <nav className="p-4 space-y-0.5 overflow-y-auto h-full pb-8">
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                  isActive(item.path, item.exact) ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium text-sm">{item.label}</span>
              </Link>
            );
          })}

          <div>
            <button
              onClick={() => setPagesOpen(o => !o)}
              className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg transition-colors ${
                isPagesActive ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Globe className="w-4 h-4 flex-shrink-0" />
                <span className="font-medium text-sm">Puslapiai</span>
              </div>
              {pagesOpen ? (
                <ChevronDown className="w-3.5 h-3.5" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5" />
              )}
            </button>

            {pagesOpen && (
              <div className="mt-0.5 ml-3 pl-4 border-l-2 border-gray-100 space-y-0.5">
                {pagesSubItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive(item.path) ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {isAdmin && (
            <>
              <div className="pt-2 pb-1">
                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">Administravimas</p>
              </div>
              {adminOnlyItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center space-x-3 px-4 py-2.5 rounded-lg transition-colors ${
                      isActive(item.path) ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="font-medium text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </>
          )}
        </nav>
      </div>

      <div className={`pt-16 transition-all duration-300 ${sidebarOpen ? 'lg:pl-64' : ''}`}>
        <div className="p-6">
          {children}
        </div>
      </div>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default AdminLayout;
