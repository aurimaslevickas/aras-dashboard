import React, { useState, useEffect, useCallback } from 'react';
import { DollarSign, Plus, Search, Filter, CreditCard as Edit2, Trash2, X, Save, Loader2, Calendar, Phone, Mail, User, ChevronDown, ChevronUp, AlertCircle, TrendingUp, Building, ArrowUpDown, ChevronRight, Clock, CheckCircle2, XCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';
import { useAuth } from '../../contexts/AuthContext';

interface RevenuePayment {
  id: string;
  listing_id: string | null;
  listing_name: string;
  listing_category: string;
  payment_type: string;
  amount: number;
  currency: string;
  payment_date: string;
  valid_until: string | null;
  notes: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
  created_at: string;
}

interface Listing {
  id: string;
  name: string;
  category: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
}

interface FormData {
  listing_id: string;
  listing_name: string;
  listing_category: string;
  payment_type: string;
  amount: string;
  currency: string;
  payment_date: string;
  valid_until: string;
  notes: string;
  contact_person: string;
  contact_email: string;
  contact_phone: string;
}

const PAYMENT_TYPES = [
  { value: 'annual_membership', label: 'Metinė narystė' },
  { value: 'event_fee', label: 'Renginio mokestis' },
  { value: 'featured_badge', label: 'Išskirtinis ženkliukas' },
  { value: 'sponsorship', label: 'Rėmėjas / Reklama' },
  { value: 'other', label: 'Kita' },
];

const PAYMENT_TYPE_LABELS: Record<string, string> = {
  annual_membership: 'Metinė narystė',
  event_fee: 'Renginio mokestis',
  featured_badge: 'Išskirtinis ženkliukas',
  sponsorship: 'Rėmėjas / Reklama',
  other: 'Kita',
};

const CATEGORY_LABELS: Record<string, string> = {
  hotel: 'Nakvynė',
  restaurant: 'Restoranai / Kavinės',
  bar: 'Barai',
  shop: 'Parduotuvės',
  attraction: 'Lankytinos vietos',
  event: 'Renginiai',
  '': 'Kita',
};

const PAYMENT_TYPE_COLORS: Record<string, string> = {
  annual_membership: 'bg-blue-100 text-blue-700',
  event_fee: 'bg-green-100 text-green-700',
  featured_badge: 'bg-amber-100 text-amber-700',
  sponsorship: 'bg-rose-100 text-rose-700',
  other: 'bg-gray-100 text-gray-700',
};

const emptyForm: FormData = {
  listing_id: '',
  listing_name: '',
  listing_category: '',
  payment_type: 'annual_membership',
  amount: '',
  currency: 'EUR',
  payment_date: new Date().toISOString().split('T')[0],
  valid_until: '',
  notes: '',
  contact_person: '',
  contact_email: '',
  contact_phone: '',
};

const RevenuePage = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<RevenuePayment[]>([]);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(emptyForm);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterMonth, setFilterMonth] = useState('');
  const [sortBy, setSortBy] = useState<'payment_date' | 'amount' | 'valid_until'>('payment_date');
  const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
  const [expandedRenewal, setExpandedRenewal] = useState<string | null>(null);
  const [listingSearch, setListingSearch] = useState('');
  const [showListingDropdown, setShowListingDropdown] = useState(false);
  const [clientModal, setClientModal] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [paymentsRes, listingsRes] = await Promise.all([
      supabase
        .from('revenue_payments')
        .select('*')
        .order('payment_date', { ascending: false }),
      supabase
        .from('listings')
        .select('id, name, category, contact_person, contact_email, contact_phone')
        .eq('status', 'active')
        .order('name'),
    ]);
    if (paymentsRes.data) setPayments(paymentsRes.data);
    if (listingsRes.data) setListings(listingsRes.data);
    setLoading(false);
  };

  const handleListingSelect = (listing: Listing) => {
    setFormData(prev => ({
      ...prev,
      listing_id: listing.id,
      listing_name: listing.name,
      listing_category: listing.category,
      contact_person: prev.contact_person || listing.contact_person || '',
      contact_email: prev.contact_email || listing.contact_email || '',
      contact_phone: prev.contact_phone || listing.contact_phone || '',
    }));
    setListingSearch(listing.name);
    setShowListingDropdown(false);
  };

  const handleClearListing = () => {
    setFormData(prev => ({ ...prev, listing_id: '', listing_name: '', listing_category: '' }));
    setListingSearch('');
  };

  const filteredListings = listings.filter(l =>
    l.name.toLowerCase().includes(listingSearch.toLowerCase())
  );

  const openNew = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setListingSearch('');
    setShowModal(true);
  };

  const openEdit = (p: RevenuePayment) => {
    setEditingId(p.id);
    setFormData({
      listing_id: p.listing_id || '',
      listing_name: p.listing_name,
      listing_category: p.listing_category,
      payment_type: p.payment_type,
      amount: String(p.amount),
      currency: p.currency,
      payment_date: p.payment_date,
      valid_until: p.valid_until || '',
      notes: p.notes || '',
      contact_person: p.contact_person || '',
      contact_email: p.contact_email || '',
      contact_phone: p.contact_phone || '',
    });
    setListingSearch(p.listing_name);
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!formData.listing_name || !formData.amount || !formData.payment_date) return;
    setSaving(true);
    const payload = {
      listing_id: formData.listing_id || null,
      listing_name: formData.listing_name,
      listing_category: formData.listing_category,
      payment_type: formData.payment_type,
      amount: parseFloat(formData.amount),
      currency: formData.currency,
      payment_date: formData.payment_date,
      valid_until: formData.valid_until || null,
      notes: formData.notes,
      contact_person: formData.contact_person,
      contact_email: formData.contact_email,
      contact_phone: formData.contact_phone,
      created_by: user?.id,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      await supabase.from('revenue_payments').update(payload).eq('id', editingId);
    } else {
      await supabase.from('revenue_payments').insert(payload);
    }

    setSaving(false);
    setShowModal(false);
    loadData();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Ar tikrai norite ištrinti šį mokėjimą?')) return;
    await supabase.from('revenue_payments').delete().eq('id', id);
    setPayments(prev => prev.filter(p => p.id !== id));
  };

  const toggleSort = (col: typeof sortBy) => {
    if (sortBy === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortBy(col); setSortDir('desc'); }
  };

  const filtered = payments
    .filter(p => {
      const matchSearch = !searchTerm ||
        p.listing_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.contact_person.toLowerCase().includes(searchTerm.toLowerCase());
      const matchType = !filterType || p.payment_type === filterType;
      const matchCat = !filterCategory || p.listing_category === filterCategory;
      const matchMonth = !filterMonth || p.payment_date.startsWith(filterMonth);
      return matchSearch && matchType && matchCat && matchMonth;
    })
    .sort((a, b) => {
      let aVal: string | number = a[sortBy] || '';
      let bVal: string | number = b[sortBy] || '';
      if (sortBy === 'amount') { aVal = a.amount; bVal = b.amount; }
      const cmp = aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      return sortDir === 'asc' ? cmp : -cmp;
    });

  const totalFiltered = filtered.reduce((s, p) => s + p.amount, 0);

  const now = new Date();
  const in30days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const upcomingRenewals = payments.filter(p => {
    if (!p.valid_until) return false;
    const d = new Date(p.valid_until);
    return d >= now && d <= in30days;
  }).sort((a, b) => (a.valid_until! < b.valid_until! ? -1 : 1));

  const expiredPayments = payments.filter(p => {
    if (!p.valid_until) return false;
    return new Date(p.valid_until) < now;
  });

  const thisMonth = now.toISOString().slice(0, 7);
  const thisYear = now.getFullYear().toString();
  const monthRevenue = payments
    .filter(p => p.payment_date.startsWith(thisMonth))
    .reduce((s, p) => s + p.amount, 0);
  const yearRevenue = payments
    .filter(p => p.payment_date.startsWith(thisYear))
    .reduce((s, p) => s + p.amount, 0);

  const byCategory = payments.reduce((acc, p) => {
    const cat = p.listing_category || '';
    acc[cat] = (acc[cat] || 0) + p.amount;
    return acc;
  }, {} as Record<string, number>);

  const topPayers = Object.values(
    payments.reduce((acc, p) => {
      const key = p.listing_name;
      if (!acc[key]) acc[key] = { name: key, category: p.listing_category, total: 0, contact_person: p.contact_person, contact_email: p.contact_email, contact_phone: p.contact_phone };
      acc[key].total += p.amount;
      return acc;
    }, {} as Record<string, { name: string; category: string; total: number; contact_person: string; contact_email: string; contact_phone: string }>)
  ).sort((a, b) => b.total - a.total).slice(0, 5);

  const fmt = (n: number) => n.toLocaleString('lt-LT', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const SortBtn = ({ col, label }: { col: typeof sortBy; label: string }) => (
    <button onClick={() => toggleSort(col)} className="flex items-center gap-1 hover:text-blue-600">
      {label}
      <ArrowUpDown className={`w-3 h-3 ${sortBy === col ? 'text-blue-500' : 'text-gray-400'}`} />
    </button>
  );

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Pajamos</h1>
            <p className="text-gray-500 text-sm mt-1">Mokėjimų ir narysčių apskaita</p>
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Naujas mokėjimas
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-blue-50 rounded-lg"><DollarSign className="w-5 h-5 text-blue-600" /></div>
              <span className="text-xs text-gray-400 font-medium">Šis mėnuo</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{fmt(monthRevenue)} €</p>
            <p className="text-xs text-gray-500 mt-1">Gauta šį mėnesį</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-green-50 rounded-lg"><TrendingUp className="w-5 h-5 text-green-600" /></div>
              <span className="text-xs text-gray-400 font-medium">{thisYear}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{fmt(yearRevenue)} €</p>
            <p className="text-xs text-gray-500 mt-1">Gauta šiais metais</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-amber-50 rounded-lg"><Calendar className="w-5 h-5 text-amber-600" /></div>
              <span className="text-xs text-amber-500 font-medium">{upcomingRenewals.length > 0 ? `${upcomingRenewals.length} laukia` : 'Nėra'}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{upcomingRenewals.length}</p>
            <p className="text-xs text-gray-500 mt-1">Artimiausi atnaujinimai (30d.)</p>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 bg-rose-50 rounded-lg"><AlertCircle className="w-5 h-5 text-rose-600" /></div>
              <span className="text-xs text-rose-500 font-medium">{expiredPayments.length > 0 ? 'Reikia dėmesio' : 'Viskas gerai'}</span>
            </div>
            <p className="text-2xl font-bold text-gray-900">{expiredPayments.length}</p>
            <p className="text-xs text-gray-500 mt-1">Pasibaigusios narystės</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Building className="w-4 h-4 text-gray-500" />
              Pajamos pagal kategoriją
            </h3>
            <div className="space-y-3">
              {Object.entries(byCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, total]) => {
                  const max = Math.max(...Object.values(byCategory));
                  const pct = max > 0 ? (total / max) * 100 : 0;
                  return (
                    <div key={cat}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{CATEGORY_LABELS[cat] || cat || 'Kita'}</span>
                        <span className="font-semibold text-gray-900">{fmt(total)} €</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              {Object.keys(byCategory).length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Nėra duomenų</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-gray-500" />
              Top 5 mokėtojai
            </h3>
            <div className="space-y-3">
              {topPayers.map((p, i) => (
                <div key={p.name} className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400">{CATEGORY_LABELS[p.category] || 'Kita'}</p>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 flex-shrink-0">{fmt(p.total)} €</span>
                </div>
              ))}
              {topPayers.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Nėra duomenų</p>
              )}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
            <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500" />
              Artimiausi atnaujinimai
              {upcomingRenewals.length > 0 && (
                <span className="ml-auto px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                  {upcomingRenewals.length}
                </span>
              )}
            </h3>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {upcomingRenewals.map(p => {
                const daysLeft = Math.ceil((new Date(p.valid_until!).getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                const isExpanded = expandedRenewal === p.id;
                return (
                  <div key={p.id} className="border border-amber-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedRenewal(isExpanded ? null : p.id)}
                      className="w-full flex items-center justify-between p-3 hover:bg-amber-50 transition-colors text-left"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-gray-900 truncate">{p.listing_name}</p>
                        <p className="text-xs text-gray-500">{PAYMENT_TYPE_LABELS[p.payment_type]}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${daysLeft <= 7 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                          {daysLeft}d.
                        </span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="px-3 pb-3 bg-amber-50 border-t border-amber-100 space-y-1.5">
                        <p className="text-xs text-gray-500">Galioja iki: <span className="font-medium text-gray-700">{p.valid_until}</span></p>
                        <p className="text-xs text-gray-500">Suma: <span className="font-semibold text-gray-700">{fmt(p.amount)} €</span></p>
                        {p.contact_person && (
                          <div className="flex items-center gap-1.5 text-xs text-gray-600">
                            <User className="w-3 h-3 text-gray-400" />
                            <span>{p.contact_person}</span>
                          </div>
                        )}
                        {p.contact_email && (
                          <div className="flex items-center gap-1.5 text-xs text-blue-600">
                            <Mail className="w-3 h-3" />
                            <a href={`mailto:${p.contact_email}`} className="hover:underline">{p.contact_email}</a>
                          </div>
                        )}
                        {p.contact_phone && (
                          <div className="flex items-center gap-1.5 text-xs text-green-600">
                            <Phone className="w-3 h-3" />
                            <a href={`tel:${p.contact_phone}`} className="hover:underline">{p.contact_phone}</a>
                          </div>
                        )}
                        {!p.contact_person && !p.contact_email && !p.contact_phone && (
                          <p className="text-xs text-gray-400 italic">Kontaktai nenurodyti</p>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {upcomingRenewals.length === 0 && (
                <p className="text-sm text-gray-400 text-center py-4">Nėra artimų atnaujinimų</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-5 border-b border-gray-100">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Ieškoti pagal pavadinimą ar kontaktą..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                <select
                  value={filterType}
                  onChange={e => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Visi tipai</option>
                  {PAYMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
                <select
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Visos kategorijos</option>
                  {Object.entries(CATEGORY_LABELS).filter(([k]) => k).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
                <input
                  type="month"
                  value={filterMonth}
                  onChange={e => setFilterMonth(e.target.value)}
                  className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            {(searchTerm || filterType || filterCategory || filterMonth) && (
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                <span className="text-sm text-gray-500">{filtered.length} įrašų · Suma: <span className="font-semibold text-gray-800">{fmt(totalFiltered)} €</span></span>
                <button onClick={() => { setSearchTerm(''); setFilterType(''); setFilterCategory(''); setFilterMonth(''); }} className="text-sm text-blue-600 hover:underline flex items-center gap-1">
                  <X className="w-3 h-3" /> Išvalyti filtrus
                </button>
              </div>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="px-5 py-3 text-left font-medium"><SortBtn col="payment_date" label="Data" /></th>
                  <th className="px-5 py-3 text-left font-medium">Pavadinimas</th>
                  <th className="px-5 py-3 text-left font-medium">Tipas</th>
                  <th className="px-5 py-3 text-right font-medium"><SortBtn col="amount" label="Suma" /></th>
                  <th className="px-5 py-3 text-left font-medium"><SortBtn col="valid_until" label="Galioja iki" /></th>
                  <th className="px-5 py-3 text-center font-medium">Veiksmai</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map(p => {
                  const isExpiredRow = p.valid_until && new Date(p.valid_until) < now;
                  const isNearExpiry = p.valid_until && !isExpiredRow && new Date(p.valid_until) <= in30days;
                  return (
                    <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${isExpiredRow ? 'bg-rose-50/30' : ''}`}>
                      <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{p.payment_date}</td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => setClientModal(p.listing_name)}
                          className="font-medium text-gray-900 hover:text-blue-600 transition-colors text-left group flex items-center gap-1"
                        >
                          {p.listing_name}
                          <ChevronRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-400 transition-colors" />
                        </button>
                        {p.listing_category && (
                          <p className="text-xs text-gray-400">{CATEGORY_LABELS[p.listing_category] || p.listing_category}</p>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${PAYMENT_TYPE_COLORS[p.payment_type] || 'bg-gray-100 text-gray-700'}`}>
                          {PAYMENT_TYPE_LABELS[p.payment_type] || p.payment_type}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-gray-900 whitespace-nowrap">{fmt(p.amount)} €</td>
                      <td className="px-5 py-3 whitespace-nowrap">
                        {p.valid_until ? (
                          <span className={`text-xs font-medium ${isExpiredRow ? 'text-rose-600' : isNearExpiry ? 'text-amber-600' : 'text-gray-600'}`}>
                            {p.valid_until}
                            {isExpiredRow && ' (baigėsi)'}
                            {isNearExpiry && ' (!!)'}
                          </span>
                        ) : (
                          <span className="text-gray-300 text-xs">—</span>
                        )}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors text-blue-600">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(p.id)} className="p-1.5 hover:bg-rose-100 rounded-lg transition-colors text-rose-500">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-12 text-center text-gray-400">
                      Mokėjimų nerasta
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? 'Redaguoti mokėjimą' : 'Naujas mokėjimas'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Listing'as</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Ieškoti listing'o arba įvesti rankiniu būdu..."
                    value={listingSearch}
                    onChange={e => { setListingSearch(e.target.value); setFormData(prev => ({ ...prev, listing_name: e.target.value, listing_id: '' })); setShowListingDropdown(true); }}
                    onFocus={() => setShowListingDropdown(true)}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {formData.listing_id && (
                    <button onClick={handleClearListing} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {showListingDropdown && listingSearch && filteredListings.length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                      {filteredListings.slice(0, 8).map(l => (
                        <button
                          key={l.id}
                          onClick={() => handleListingSelect(l)}
                          className="w-full px-4 py-2.5 text-left hover:bg-blue-50 transition-colors text-sm"
                        >
                          <span className="font-medium text-gray-900">{l.name}</span>
                          <span className="ml-2 text-xs text-gray-400">{CATEGORY_LABELS[l.category] || l.category}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {formData.listing_id && (
                  <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                    Susieta su listing'u
                  </p>
                )}
              </div>


              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mokėjimo tipas</label>
                  <select
                    value={formData.payment_type}
                    onChange={e => setFormData(prev => ({ ...prev, payment_type: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {PAYMENT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Suma (€)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={e => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Mokėjimo data</label>
                  <input
                    type="date"
                    value={formData.payment_date}
                    onChange={e => setFormData(prev => ({ ...prev, payment_date: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Galioja iki</label>
                  <input
                    type="date"
                    value={formData.valid_until}
                    onChange={e => setFormData(prev => ({ ...prev, valid_until: e.target.value }))}
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Pastabos</label>
                <textarea
                  rows={3}
                  placeholder="Papildoma informacija..."
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>
            </div>

            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex gap-3 rounded-b-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
              >
                Atšaukti
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !formData.listing_name || !formData.amount}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors font-medium text-sm"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {saving ? 'Saugoma...' : 'Išsaugoti'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showListingDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowListingDropdown(false)} />
      )}

      {clientModal && (() => {
        const clientPayments = payments.filter(p => p.listing_name === clientModal).sort((a, b) => b.payment_date.localeCompare(a.payment_date));
        const totalSpent = clientPayments.reduce((s, p) => s + p.amount, 0);
        const activeServices = clientPayments.filter(p => p.valid_until && new Date(p.valid_until) >= now);
        const expiredServices = clientPayments.filter(p => p.valid_until && new Date(p.valid_until) < now);
        const noExpiryServices = clientPayments.filter(p => !p.valid_until);
        const latestPayment = clientPayments[0];
        const contact = {
          person: latestPayment?.contact_person || '',
          email: latestPayment?.contact_email || '',
          phone: latestPayment?.contact_phone || '',
        };
        const category = latestPayment?.listing_category || '';
        return (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-end" onClick={() => setClientModal(null)}>
            <div
              className="bg-white h-full w-full max-w-md shadow-2xl overflow-y-auto flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-start justify-between z-10">
                <div>
                  <h2 className="text-lg font-bold text-gray-900 leading-tight">{clientModal}</h2>
                  {category && <p className="text-sm text-gray-400 mt-0.5">{CATEGORY_LABELS[category] || category}</p>}
                </div>
                <button onClick={() => setClientModal(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-0.5">
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6 space-y-6 flex-1">
                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-blue-700">{fmt(totalSpent)} €</p>
                    <p className="text-xs text-blue-500 mt-1">Iš viso išleista</p>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-gray-700">{clientPayments.length}</p>
                    <p className="text-xs text-gray-500 mt-1">Mokėjimų</p>
                  </div>
                  <div className="bg-green-50 rounded-xl p-4 text-center">
                    <p className="text-2xl font-bold text-green-700">{activeServices.length}</p>
                    <p className="text-xs text-green-500 mt-1">Aktyvios paslaugos</p>
                  </div>
                </div>

                {(contact.person || contact.email || contact.phone) && (
                  <div className="bg-gray-50 rounded-xl p-4 space-y-2.5">
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Kontaktai</h3>
                    {contact.person && (
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                          <User className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                        <span className="text-sm font-medium text-gray-800">{contact.person}</span>
                      </div>
                    )}
                    {contact.email && (
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                          <Mail className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                        <a href={`mailto:${contact.email}`} className="text-sm text-blue-600 hover:underline truncate">{contact.email}</a>
                      </div>
                    )}
                    {contact.phone && (
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 bg-white rounded-lg flex items-center justify-center shadow-sm flex-shrink-0">
                          <Phone className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                        <a href={`tel:${contact.phone}`} className="text-sm text-green-700 hover:underline">{contact.phone}</a>
                      </div>
                    )}
                  </div>
                )}

                {activeServices.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                      Aktyvios paslaugos
                    </h3>
                    <div className="space-y-2">
                      {activeServices.map(p => {
                        const daysLeft = Math.ceil((new Date(p.valid_until!).getTime() - now.getTime()) / 86400000);
                        const nearExpiry = daysLeft <= 30;
                        return (
                          <div key={p.id} className={`flex items-center justify-between p-3 rounded-lg border ${nearExpiry ? 'border-amber-200 bg-amber-50' : 'border-green-100 bg-green-50'}`}>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium text-gray-900">{PAYMENT_TYPE_LABELS[p.payment_type] || p.payment_type}</p>
                              <p className="text-xs text-gray-500 mt-0.5">Iki {p.valid_until}</p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0 ml-3">
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${nearExpiry ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
                                {daysLeft}d.
                              </span>
                              <span className="text-sm font-bold text-gray-800">{fmt(p.amount)} €</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {noExpiryServices.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      Vienkartiniai mokėjimai
                    </h3>
                    <div className="space-y-2">
                      {noExpiryServices.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-gray-100 bg-gray-50">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900">{PAYMENT_TYPE_LABELS[p.payment_type] || p.payment_type}</p>
                            <p className="text-xs text-gray-400 mt-0.5">{p.payment_date}</p>
                          </div>
                          <span className="text-sm font-bold text-gray-800 ml-3">{fmt(p.amount)} €</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {expiredServices.length > 0 && (
                  <div>
                    <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      Pasibaigusios paslaugos
                    </h3>
                    <div className="space-y-2">
                      {expiredServices.map(p => (
                        <div key={p.id} className="flex items-center justify-between p-3 rounded-lg border border-rose-100 bg-rose-50/40">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-600">{PAYMENT_TYPE_LABELS[p.payment_type] || p.payment_type}</p>
                            <p className="text-xs text-rose-400 mt-0.5">Baigėsi {p.valid_until}</p>
                          </div>
                          <span className="text-sm font-bold text-gray-500 ml-3">{fmt(p.amount)} €</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}
    </AdminLayout>
  );
};

export default RevenuePage;
