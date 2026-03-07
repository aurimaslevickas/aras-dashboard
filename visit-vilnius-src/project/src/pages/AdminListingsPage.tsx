import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AdminLayout from '../components/admin/AdminLayout';
import { Plus, Search, Pencil, Trash2, Eye, EyeOff, Building, X, AlertTriangle, BarChart2 } from 'lucide-react';

interface Listing {
  id: string;
  name: string;
  category: string;
  location: string;
  status: string;
  badge: string;
  created_at: string;
}

const categoryLabels: Record<string, string> = {
  restaurant: 'Restoranas',
  hotel: 'Viešbutis',
  attraction: 'Atrakcija',
  shop: 'Parduotuvė',
  bar: 'Baras',
  event: 'Renginys',
};

const categoryColors: Record<string, string> = {
  restaurant: 'bg-orange-100 text-orange-800 border border-orange-200',
  hotel: 'bg-blue-100 text-blue-800 border border-blue-200',
  attraction: 'bg-teal-100 text-teal-800 border border-teal-200',
  shop: 'bg-pink-100 text-pink-800 border border-pink-200',
  bar: 'bg-amber-100 text-amber-800 border border-amber-200',
  event: 'bg-green-100 text-green-800 border border-green-200',
};

const AdminListingsPage = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deleteTarget, setDeleteTarget] = useState<Listing | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchListings();
  }, [categoryFilter, statusFilter]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('listings')
        .select('*')
        .not('category', 'eq', 'event')
        .order('created_at', { ascending: false });

      if (categoryFilter !== 'all') {
        query = supabase
          .from('listings')
          .select('*')
          .eq('category', categoryFilter)
          .order('created_at', { ascending: false });
      }

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setListings(data || []);
    } catch (error) {
      console.error('Error fetching listings:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const { error } = await supabase
      .from('listings')
      .update({ status: newStatus })
      .eq('id', id);

    if (!error) {
      setListings((prev) =>
        prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
      );
    }
  };

  const deleteStorageImages = async (imageUrl: string | null, galleryImages: string[] | null) => {
    const extractPath = (url: string) => {
      const match = url.match(/\/storage\/v1\/object\/public\/media\/(.+)/);
      return match ? match[1] : null;
    };

    const paths: string[] = [];
    if (imageUrl) {
      const p = extractPath(imageUrl);
      if (p) paths.push(p);
    }
    if (galleryImages?.length) {
      galleryImages.forEach(url => {
        const p = extractPath(url);
        if (p) paths.push(p);
      });
    }
    if (paths.length > 0) {
      await supabase.storage.from('media').remove(paths);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { data: record } = await supabase
        .from('listings')
        .select('image_url, gallery_images')
        .eq('id', deleteTarget.id)
        .maybeSingle();

      if (record) {
        await deleteStorageImages(record.image_url, record.gallery_images);
      }

      const { error } = await supabase
        .from('listings')
        .delete()
        .eq('id', deleteTarget.id);

      if (error) throw error;
      setListings((prev) => prev.filter((l) => l.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting listing:', error);
    } finally {
      setDeleting(false);
    }
  };

  const filteredListings = listings.filter(
    (listing) =>
      listing.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vietos ir verslas</h1>
            <p className="text-gray-600 mt-1">Valdykite visus listing'us sistemoje</p>
          </div>
          <button
            onClick={() => navigate('/admin/listings/new')}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Naujas listing'as</span>
          </button>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Ieškoti pagal pavadinimą arba vietą..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Visos kategorijos</option>
              <option value="restaurant">Restoranai</option>
              <option value="bar">Barai</option>
              <option value="hotel">Viešbučiai</option>
              <option value="attraction">Atrakcijos</option>
              <option value="shop">Parduotuvės</option>
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Visi statusai</option>
              <option value="active">Aktyvūs</option>
              <option value="inactive">Neaktyvūs</option>
              <option value="pending">Laukiantys patvirtinimo</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Listing'ų nerasta</h3>
            <p className="text-gray-600">Sukurkite naują listing'ą arba pakeiskite filtrus</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Pavadinimas</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Kategorija</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Vieta</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Statusas</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Veiksmai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredListings.map((listing) => (
                  <tr key={listing.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{listing.name}</p>
                      {listing.badge && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full mt-1">
                          {listing.badge}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColors[listing.category] || 'bg-gray-100 text-gray-700 border border-gray-200'}`}>
                        {categoryLabels[listing.category] || listing.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{listing.location}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${
                          listing.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : listing.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {listing.status === 'active'
                          ? 'Aktyvus'
                          : listing.status === 'pending'
                          ? 'Laukia'
                          : 'Neaktyvus'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => toggleStatus(listing.id, listing.status)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title={listing.status === 'active' ? 'Deaktyvuoti' : 'Aktyvuoti'}
                        >
                          {listing.status === 'active' ? (
                            <EyeOff className="w-4 h-4 text-gray-500" />
                          ) : (
                            <Eye className="w-4 h-4 text-gray-500" />
                          )}
                        </button>

                        <button
                          onClick={() => navigate(`/admin/listings/${listing.id}`)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Redaguoti"
                        >
                          <Pencil className="w-4 h-4 text-blue-600" />
                        </button>

                        <button
                          onClick={() => navigate(`/admin/listings/${listing.id}/analytics`)}
                          className="p-2 hover:bg-emerald-50 rounded-lg transition-colors"
                          title="Statistika"
                        >
                          <BarChart2 className="w-4 h-4 text-emerald-600" />
                        </button>

                        <button
                          onClick={() => setDeleteTarget(listing)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                          title="Ištrinti"
                        >
                          <Trash2 className="w-4 h-4 text-red-600" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="text-center text-sm text-gray-600">
          Rodoma {filteredListings.length} listing'ų iš {listings.length}
        </div>
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start space-x-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Ištrinti listing'ą?</h3>
                <p className="text-gray-600 text-sm">
                  Ar tikrai norite ištrinti <span className="font-semibold text-gray-900">"{deleteTarget.name}"</span>?
                  Šis veiksmas negrįžtamas.
                </p>
              </div>
            </div>
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Atšaukti
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              >
                {deleting ? 'Trinama...' : 'Ištrinti'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminListingsPage;
