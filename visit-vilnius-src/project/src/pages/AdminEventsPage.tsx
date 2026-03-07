import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import AdminLayout from '../components/admin/AdminLayout';
import { Calendar, Plus, Pencil, Trash2, Eye, EyeOff, Search, Filter, Clock, MapPin, AlertTriangle, CheckCircle, XCircle, Info, Users, BarChart2, ChevronDown, ChevronUp } from 'lucide-react';

interface Event {
  id: string;
  name: string;
  description: string;
  organizer: string | null;
  event_start_date: string | null;
  event_end_date: string | null;
  location: string;
  price_range: string;
  status: string;
  badge: string;
  views_count: number;
  contact_info: { email?: string; phone?: string; website?: string } | null;
  created_at: string;
}

const AdminEventsPage = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [organizerFilter, setOrganizerFilter] = useState<string>('all');
  const [deleteTarget, setDeleteTarget] = useState<Event | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [detailEvent, setDetailEvent] = useState<Event | null>(null);
  const [approving, setApproving] = useState<string | null>(null);
  const [showOrgStats, setShowOrgStats] = useState(false);

  useEffect(() => {
    loadEvents();
    loadPendingCount();
  }, [statusFilter]);

  const loadPendingCount = async () => {
    const { count } = await supabase
      .from('listings')
      .select('id', { count: 'exact' })
      .eq('category', 'event')
      .eq('status', 'pending');
    setPendingCount(count || 0);
  };

  const loadEvents = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('listings')
        .select('*')
        .eq('category', 'event')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error loading events:', error);
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
      setEvents(prev => prev.map(e => e.id === id ? { ...e, status: newStatus } : e));
      loadPendingCount();
    }
  };

  const approveEvent = async (id: string) => {
    setApproving(id);
    const { error } = await supabase
      .from('listings')
      .update({ status: 'active' })
      .eq('id', id);

    if (!error) {
      setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'active' } : e));
      if (statusFilter === 'pending') {
        setEvents(prev => prev.filter(e => e.id !== id));
      }
      loadPendingCount();
      setDetailEvent(null);
    }
    setApproving(null);
  };

  const rejectEvent = async (id: string) => {
    setApproving(id);
    const { error } = await supabase
      .from('listings')
      .update({ status: 'inactive' })
      .eq('id', id);

    if (!error) {
      setEvents(prev => prev.map(e => e.id === id ? { ...e, status: 'inactive' } : e));
      if (statusFilter === 'pending') {
        setEvents(prev => prev.filter(e => e.id !== id));
      }
      loadPendingCount();
      setDetailEvent(null);
    }
    setApproving(null);
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
    setDeleteError(null);
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
      setEvents(prev => prev.filter(e => e.id !== deleteTarget.id));
      setDeleteTarget(null);
      loadPendingCount();
    } catch (error: any) {
      console.error('Error deleting event:', error);
      setDeleteError(error?.message || 'Nepavyko ištrinti. Bandykite dar kartą.');
    } finally {
      setDeleting(false);
    }
  };

  const organizerList = useMemo(() => {
    const map = new Map<string, { count: number; views: number; active: number }>();
    events.forEach(e => {
      const key = e.organizer?.trim() || '';
      if (!key) return;
      const existing = map.get(key) || { count: 0, views: 0, active: 0 };
      map.set(key, {
        count: existing.count + 1,
        views: existing.views + (e.views_count || 0),
        active: existing.active + (e.status === 'active' ? 1 : 0),
      });
    });
    return Array.from(map.entries())
      .map(([name, stats]) => ({ name, ...stats }))
      .sort((a, b) => b.count - a.count);
  }, [events]);

  const filteredEvents = events.filter(event => {
    const matchesSearch =
      event.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.organizer?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesOrganizer =
      organizerFilter === 'all' || event.organizer === organizerFilter;
    return matchesSearch && matchesOrganizer;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString('lt-LT', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleString('lt-LT', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Renginių valdymas</h1>
            <p className="text-gray-600 mt-1">Valdykite visus renginius ir tvirtinkite pateiktus pasiūlymus</p>
          </div>
          <button
            onClick={() => navigate('/admin/events/new')}
            className="flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Naujas renginys</span>
          </button>
        </div>

        {pendingCount > 0 && statusFilter !== 'pending' && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-amber-900">
                  {pendingCount} {pendingCount === 1 ? 'renginys laukia' : 'renginiai laukia'} patvirtinimo
                </p>
                <p className="text-amber-700 text-sm">Renginiai pateikti per viešą formą</p>
              </div>
            </div>
            <button
              onClick={() => setStatusFilter('pending')}
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-sm font-medium"
            >
              Peržiūrėti
            </button>
          </div>
        )}

        {organizerList.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <button
              onClick={() => setShowOrgStats(v => !v)}
              className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                  <BarChart2 className="w-4 h-4 text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">Organizatorių statistika</p>
                  <p className="text-xs text-gray-500">{organizerList.length} organizatorių</p>
                </div>
              </div>
              {showOrgStats ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
            </button>
            {showOrgStats && (
              <div className="border-t border-gray-100 px-6 pb-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4">
                  {organizerList.map(org => (
                    <button
                      key={org.name}
                      onClick={() => setOrganizerFilter(organizerFilter === org.name ? 'all' : org.name)}
                      className={`text-left p-3 rounded-xl border transition-colors ${
                        organizerFilter === org.name
                          ? 'border-blue-400 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <Users className="w-3 h-3 text-gray-600" />
                        </div>
                        <p className="font-semibold text-gray-900 text-sm truncate">{org.name}</p>
                      </div>
                      <div className="flex gap-3 text-xs text-gray-500">
                        <span><span className="font-medium text-gray-700">{org.count}</span> renginiai</span>
                        <span><span className="font-medium text-green-700">{org.active}</span> aktyvūs</span>
                        <span><span className="font-medium text-gray-700">{org.views}</span> peržiūros</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Ieškoti renginių..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Visi renginiai</option>
                <option value="active">Aktyvūs</option>
                <option value="inactive">Neaktyvūs</option>
                <option value="pending">
                  Laukiantys{pendingCount > 0 ? ` (${pendingCount})` : ''}
                </option>
              </select>
              {organizerList.length > 0 && (
                <select
                  value={organizerFilter}
                  onChange={e => setOrganizerFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">Visi organizatoriai</option>
                  {organizerList.map(org => (
                    <option key={org.name} value={org.name}>{org.name} ({org.count})</option>
                  ))}
                </select>
              )}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : filteredEvents.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              {statusFilter === 'pending' ? 'Nėra laukiančių renginių' : 'Renginių nerasta'}
            </h3>
            <p className="text-gray-600 mb-6">
              {statusFilter === 'pending' ? 'Visi pateikti renginiai jau peržiūrėti' : 'Pradėkite kurdami pirmą renginį'}
            </p>
            {statusFilter !== 'pending' && (
              <button
                onClick={() => navigate('/admin/events/new')}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-5 h-5" />
                <span>Sukurti renginį</span>
              </button>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Pavadinimas</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Organizatorius</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Vieta</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Data</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Kaina</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Statusas</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Veiksmai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEvents.map(event => (
                  <tr
                    key={event.id}
                    className={`hover:bg-gray-50 transition-colors ${event.status === 'pending' ? 'bg-amber-50/40' : ''}`}
                  >
                    <td className="px-6 py-4">
                      <p className="font-semibold text-gray-900">{event.name}</p>
                      {event.badge && (
                        <span className="inline-block bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full mt-1">
                          {event.badge}
                        </span>
                      )}
                      {event.status === 'pending' && (
                        <span className="inline-block bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full mt-1 ml-1">
                          pateiktas per formą
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {event.organizer ? (
                        <button
                          onClick={() => setOrganizerFilter(organizerFilter === event.organizer ? 'all' : (event.organizer || 'all'))}
                          className={`flex items-center gap-1 px-2 py-1 rounded-lg transition-colors text-xs font-medium ${
                            organizerFilter === event.organizer
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-600 hover:bg-blue-50 hover:text-blue-600'
                          }`}
                        >
                          <Users className="w-3 h-3 flex-shrink-0" />
                          {event.organizer}
                        </button>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {event.location && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{event.location}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {event.event_start_date ? (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 flex-shrink-0" />
                          <span>{formatDate(event.event_start_date) ?? '—'}</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">Nenurodyta</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-blue-600">
                      {event.price_range || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-block text-xs font-semibold px-2 py-1 rounded-full ${
                          event.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : event.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {event.status === 'active' ? 'Aktyvus' : event.status === 'pending' ? 'Laukia' : 'Neaktyvus'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-1">
                        {event.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => setDetailEvent(event)}
                              className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Peržiūrėti"
                            >
                              <Info className="w-4 h-4 text-blue-600" />
                            </button>
                            <button
                              onClick={() => approveEvent(event.id)}
                              disabled={approving === event.id}
                              className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                              title="Patvirtinti"
                            >
                              <CheckCircle className="w-4 h-4 text-green-600" />
                            </button>
                            <button
                              onClick={() => rejectEvent(event.id)}
                              disabled={approving === event.id}
                              className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                              title="Atmesti"
                            >
                              <XCircle className="w-4 h-4 text-red-500" />
                            </button>
                            <button
                              onClick={() => navigate(`/admin/events/${event.id}`)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Redaguoti"
                            >
                              <Pencil className="w-4 h-4 text-blue-600" />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => toggleStatus(event.id, event.status)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title={event.status === 'active' ? 'Deaktyvuoti' : 'Aktyvuoti'}
                            >
                              {event.status === 'active' ? (
                                <EyeOff className="w-4 h-4 text-gray-500" />
                              ) : (
                                <Eye className="w-4 h-4 text-gray-500" />
                              )}
                            </button>
                            <button
                              onClick={() => navigate(`/admin/events/${event.id}`)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              title="Redaguoti"
                            >
                              <Pencil className="w-4 h-4 text-blue-600" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => setDeleteTarget(event)}
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
          Rodoma {filteredEvents.length} iš {events.length} renginių
        </div>
      </div>

      {detailEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="text-lg font-bold text-gray-900">{detailEvent.name}</h3>
                <span className="inline-block bg-amber-100 text-amber-700 text-xs font-medium px-2 py-0.5 rounded-full mt-1">Laukia patvirtinimo</span>
              </div>
              <button onClick={() => setDetailEvent(null)} className="text-gray-400 hover:text-gray-600 text-2xl leading-none ml-4">&times;</button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="font-semibold text-gray-700 mb-1">Aprašymas</p>
                <p className="text-gray-600">{detailEvent.description}</p>
              </div>
              {detailEvent.location && (
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">{detailEvent.location}</span>
                </div>
              )}
              {detailEvent.event_start_date && (
                <div className="flex items-start gap-2">
                  <Calendar className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="text-gray-700">Pradžia: {formatDateTime(detailEvent.event_start_date)}</span>
                    {detailEvent.event_end_date && (
                      <p className="text-gray-700">Pabaiga: {formatDateTime(detailEvent.event_end_date)}</p>
                    )}
                  </div>
                </div>
              )}
              {detailEvent.price_range && (
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-700">Kaina:</span>
                  <span className="text-gray-600">{detailEvent.price_range}</span>
                </div>
              )}
              {detailEvent.contact_info && Object.keys(detailEvent.contact_info).length > 0 && (
                <div>
                  <p className="font-semibold text-gray-700 mb-2">Kontaktai</p>
                  <div className="space-y-1 bg-gray-50 rounded-lg px-3 py-2">
                    {detailEvent.contact_info.email && (
                      <p className="text-gray-600">El. paštas: <a href={`mailto:${detailEvent.contact_info.email}`} className="text-blue-600 hover:underline">{detailEvent.contact_info.email}</a></p>
                    )}
                    {detailEvent.contact_info.phone && (
                      <p className="text-gray-600">Telefonas: {detailEvent.contact_info.phone}</p>
                    )}
                    {detailEvent.contact_info.website && (
                      <p className="text-gray-600">Svetainė: <a href={detailEvent.contact_info.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{detailEvent.contact_info.website}</a></p>
                    )}
                  </div>
                </div>
              )}
              <p className="text-gray-400 text-xs">Pateikta: {formatDateTime(detailEvent.created_at)}</p>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => rejectEvent(detailEvent.id)}
                disabled={approving === detailEvent.id}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border border-red-200 text-red-600 rounded-xl hover:bg-red-50 transition-colors font-medium disabled:opacity-50"
              >
                <XCircle className="w-5 h-5" />
                Atmesti
              </button>
              <button
                onClick={() => navigate(`/admin/events/${detailEvent.id}`)}
                className="px-4 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                <Pencil className="w-5 h-5" />
              </button>
              <button
                onClick={() => approveEvent(detailEvent.id)}
                disabled={approving === detailEvent.id}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-semibold disabled:opacity-50"
              >
                <CheckCircle className="w-5 h-5" />
                Patvirtinti
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start space-x-4 mb-6">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Ištrinti renginį?</h3>
                <p className="text-gray-600 text-sm">
                  Ar tikrai norite ištrinti <span className="font-semibold text-gray-900">"{deleteTarget.name}"</span>?
                  Šis veiksmas negrįžtamas.
                </p>
              </div>
            </div>
            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {deleteError}
              </div>
            )}
            <div className="flex space-x-3 justify-end">
              <button
                onClick={() => { setDeleteTarget(null); setDeleteError(null); }}
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

export default AdminEventsPage;
