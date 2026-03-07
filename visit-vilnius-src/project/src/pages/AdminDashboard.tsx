import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  BarChart3,
  Users,
  Calendar,
  TrendingUp,
  Building,
  Eye,
  Plus,
  RefreshCw,
  Activity,
  BookOpen,
  LogIn
} from 'lucide-react';

interface DashboardStats {
  totalEvents: number;
  activeEvents: number;
  totalListings: number;
  activeListings: number;
  totalUsers: number;
  listingsByCategory: Record<string, number>;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    totalEvents: 0,
    activeEvents: 0,
    totalListings: 0,
    activeListings: 0,
    totalUsers: 0,
    listingsByCategory: {}
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);

      const [
        eventsResult,
        listingsResult,
        usersResult
      ] = await Promise.all([
        supabase.from('events').select('id, status', { count: 'exact' }),
        supabase.from('listings').select('id, category, status', { count: 'exact' }),
        supabase.from('users').select('id', { count: 'exact' })
      ]);

      const events = eventsResult.data || [];
      const listings = listingsResult.data || [];
      const users = usersResult.data || [];

      const listingsByCategory: Record<string, number> = {};
      listings.forEach((listing: any) => {
        listingsByCategory[listing.category] = (listingsByCategory[listing.category] || 0) + 1;
      });

      setStats({
        totalEvents: events.length,
        activeEvents: events.filter((e: any) => e.status === 'active').length,
        totalListings: listings.length,
        activeListings: listings.filter((l: any) => l.status === 'active').length,
        totalUsers: users.length,
        listingsByCategory
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };


  const statCards = [
    {
      title: 'Renginiai',
      value: stats.totalEvents,
      subtitle: `${stats.activeEvents} aktyvūs`,
      icon: Calendar,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Listing\'ai',
      value: stats.totalListings,
      subtitle: `${stats.activeListings} aktyvūs`,
      icon: Building,
      color: 'bg-green-500',
      bgColor: 'bg-green-50'
    },
    {
      title: 'Vartotojai',
      value: stats.totalUsers,
      subtitle: 'Iš viso',
      icon: Users,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50'
    },
    {
      title: 'Kategorijos',
      value: Object.keys(stats.listingsByCategory).length,
      subtitle: 'Skirtingų tipų',
      icon: Activity,
      color: 'bg-orange-500',
      bgColor: 'bg-orange-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin valdymo skydas</h1>
            <p className="text-gray-600 mt-2">Sveiki, Administrator</p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={loadDashboardStats}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Atnaujinti</span>
            </button>

            <button
              onClick={() => navigate('/admin/events/new')}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Naujas renginys</span>
            </button>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {statCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <div key={index} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-4">
                      <div className={`p-3 rounded-full ${card.bgColor}`}>
                        <Icon className={`w-6 h-6 text-white ${card.color.replace('bg-', 'text-')}`} />
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-600 text-sm mb-1">{card.title}</p>
                      <p className="text-3xl font-bold text-gray-900 mb-1">{card.value}</p>
                      <p className="text-sm text-gray-500">{card.subtitle}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Listing'ai pagal kategoriją</h2>
                <div className="space-y-4">
                  {Object.entries(stats.listingsByCategory).length > 0 ? (
                    Object.entries(stats.listingsByCategory).map(([category, count]) => {
                      const percentage = stats.totalListings > 0
                        ? Math.round((count / stats.totalListings) * 100)
                        : 0;

                      const categoryLabels: Record<string, string> = {
                        restaurant: 'Restoranai',
                        hotel: 'Viešbučiai',
                        attraction: 'Atrakcijos',
                        shop: 'Parduotuvės'
                      };

                      return (
                        <div key={category}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gray-700 font-medium">{categoryLabels[category] || category}</span>
                            <span className="text-gray-900 font-semibold">{count}</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-gray-500 text-center py-8">Nėra duomenų</p>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Greitos nuorodos</h2>
                <div className="space-y-3">
                  <button
                    onClick={() => navigate('/admin/events')}
                    className="w-full p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Valdyti renginius</p>
                        <p className="text-sm text-gray-600">{stats.totalEvents} renginių</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate('/admin/listings')}
                    className="w-full p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Building className="w-5 h-5 text-green-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Valdyti listing'us</p>
                        <p className="text-sm text-gray-600">{stats.totalListings} listing'ų</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate('/admin/users')}
                    className="w-full p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Users className="w-5 h-5 text-purple-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Valdyti vartotojus</p>
                        <p className="text-sm text-gray-600">{stats.totalUsers} vartotojų</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate('/admin/articles')}
                    className="w-full p-4 bg-orange-50 hover:bg-orange-100 rounded-lg text-left transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <BookOpen className="w-5 h-5 text-orange-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Valdyti straipsnius</p>
                        <p className="text-sm text-gray-600">Gidai ir tiniaraščiai</p>
                      </div>
                    </div>
                  </button>

                  <button
                    onClick={() => navigate('/admin/logins')}
                    className="w-full p-4 bg-teal-50 hover:bg-teal-100 rounded-lg text-left transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <LogIn className="w-5 h-5 text-teal-600" />
                      <div>
                        <p className="font-semibold text-gray-900">Admin prisijungimai</p>
                        <p className="text-sm text-gray-600">Prisijungimų istorija</p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

          </>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
