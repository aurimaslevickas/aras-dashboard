import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase, adminGet } from '../lib/supabase';
import { LogIn, ArrowLeft, RefreshCw, User, Shield, Clock } from 'lucide-react';

interface AdminUser {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  status: string;
  last_sign_in_at: string | null;
  created_at: string;
}

export default function AdminLoginHistoryPage() {
  const navigate = useNavigate();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminUsers();
  }, []);

  const fetchAdminUsers = async () => {
    try {
      setLoading(true);

      const data = await adminGet('get-admin-logins');
      setAdmins(data.admins || []);
    } catch (error) {
      console.error('Error fetching admin users:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Niekada';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('lt-LT', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(date);
  };

  const getTimeSince = (dateString: string | null) => {
    if (!dateString) return 'Niekada';

    const now = new Date();
    const past = new Date(dateString);
    const diffMs = now.getTime() - past.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `Prieš ${diffMins} min.`;
    if (diffHours < 24) return `Prieš ${diffHours} val.`;
    if (diffDays < 30) return `Prieš ${diffDays} d.`;
    return formatDate(dateString);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Atgal į valdymo skydą
          </button>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <LogIn className="w-8 h-8 text-orange-600" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin prisijungimai</h1>
                <p className="text-gray-600 mt-1">Administratorių prisijungimų istorija</p>
              </div>
            </div>
            <button
              onClick={fetchAdminUsers}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Atnaujinti
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : admins.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <LogIn className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nerasta administratorių</h3>
            <p className="text-gray-600">Sistemoje nėra registruotų administratorių</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <p className="text-sm text-gray-600">
                Rasta <span className="font-semibold text-gray-900">{admins.length}</span> administratorių
              </p>
            </div>

            <div className="divide-y divide-gray-200">
              {admins.map((admin) => (
                <div key={admin.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <div className="p-3 bg-orange-100 rounded-full">
                        <Shield className="w-6 h-6 text-orange-600" />
                      </div>

                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {admin.full_name || 'Be vardo'}
                          </h3>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            admin.status === 'active'
                              ? 'bg-green-100 text-green-800'
                              : admin.status === 'blocked'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {admin.status === 'active' ? 'Aktyvus' :
                             admin.status === 'blocked' ? 'Užblokuotas' : 'Laukiantis'}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <User className="w-4 h-4" />
                            <span>{admin.email}</span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>Paskutinis prisijungimas: </span>
                            <span className="font-medium text-gray-900">
                              {getTimeSince(admin.last_sign_in_at)}
                            </span>
                          </div>

                          {admin.last_sign_in_at && (
                            <div className="text-xs text-gray-500 ml-6">
                              {formatDate(admin.last_sign_in_at)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-gray-500">Sukurta</p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(admin.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-bold">i</span>
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-blue-900 mb-1">Pastaba</h4>
              <p className="text-sm text-blue-800">
                Šiame puslapyje rodomi tik vartotojai su administratoriaus teisėmis.
                Prisijungimų informacija gaunama iš Supabase autentifikacijos sistemos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
