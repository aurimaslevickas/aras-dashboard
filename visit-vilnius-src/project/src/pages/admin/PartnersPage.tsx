import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  UserCheck,
  Clock,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  Eye,
  Mail,
  Phone,
  MapPin
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import AdminLayout from '../../components/admin/AdminLayout';

interface Partner {
  id: string;
  user_id: string;
  business_name: string;
  business_type: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  address: string | null;
  description: string | null;
  status: 'pending' | 'approved' | 'rejected';
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

const PartnersPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>(searchParams.get('status') || 'all');
  const [selectedPartner, setSelectedPartner] = useState<Partner | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    loadPartners();
  }, [statusFilter]);

  const loadPartners = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('partners')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setPartners(data || []);
    } catch (error) {
      console.error('Error loading partners:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (partner: Partner) => {
    try {
      setActionLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('partners')
        .update({
          status: 'approved',
          approved_by: user.id,
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', partner.id);

      if (error) throw error;

      await supabase
        .from('audit_log')
        .insert({
          user_id: user.id,
          action: 'approve',
          table_name: 'partners',
          record_id: partner.id,
          new_data: { status: 'approved' }
        });

      setShowModal(false);
      setSelectedPartner(null);
      loadPartners();
    } catch (error) {
      console.error('Error approving partner:', error);
      alert('Klaida tvirtinant partnerį');
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (partner: Partner) => {
    if (!rejectionReason.trim()) {
      alert('Prašome įvesti atmetimo priežastį');
      return;
    }

    try {
      setActionLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('partners')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason,
          updated_at: new Date().toISOString()
        })
        .eq('id', partner.id);

      if (error) throw error;

      await supabase
        .from('audit_log')
        .insert({
          user_id: user.id,
          action: 'reject',
          table_name: 'partners',
          record_id: partner.id,
          new_data: { status: 'rejected', rejection_reason: rejectionReason }
        });

      setShowModal(false);
      setSelectedPartner(null);
      setRejectionReason('');
      loadPartners();
    } catch (error) {
      console.error('Error rejecting partner:', error);
      alert('Klaida atmetant partnerį');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredPartners = partners.filter(partner =>
    partner.business_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    partner.contact_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    partner.contact_email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Laukia
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Patvirtinta
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Atmesta
          </span>
        );
    }
  };

  const businessTypeLabels: Record<string, string> = {
    restaurant: 'Restoranas',
    hotel: 'Viešbutis',
    attraction: 'Lankytina vieta',
    shop: 'Parduotuvė',
    event_organizer: 'Renginių organizatorius',
    other: 'Kita'
  };

  const pendingCount = partners.filter(p => p.status === 'pending').length;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Partneriai</h1>
            <p className="text-gray-600 mt-1">
              Valdykite partnerių anketų užklausas
              {pendingCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-orange-100 text-orange-800 rounded-full text-sm font-medium">
                  {pendingCount} laukia
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Ieškoti pagal pavadinimą, kontaktą..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-3">
              <Filter className="w-5 h-5 text-gray-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Visi statusai</option>
                <option value="pending">Laukia patvirtinimo</option>
                <option value="approved">Patvirtinti</option>
                <option value="rejected">Atmesti</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
            </div>
          ) : filteredPartners.length === 0 ? (
            <div className="text-center py-12">
              <UserCheck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Partnerių nerasta</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Pavadinimas</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tipas</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Kontaktas</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Statusas</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Data</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Veiksmai</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredPartners.map((partner) => (
                    <tr key={partner.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <p className={`font-medium ${partner.status === 'pending' ? 'font-bold' : ''}`}>
                          {partner.business_name}
                        </p>
                        <p className="text-sm text-gray-500">{partner.contact_name}</p>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {businessTypeLabels[partner.business_type] || partner.business_type}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4" />
                          <span>{partner.contact_email}</span>
                        </div>
                        {partner.contact_phone && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600 mt-1">
                            <Phone className="w-4 h-4" />
                            <span>{partner.contact_phone}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        {getStatusBadge(partner.status)}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(partner.created_at).toLocaleDateString('lt-LT')}
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => {
                            setSelectedPartner(partner);
                            setShowModal(true);
                          }}
                          className="flex items-center space-x-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Peržiūrėti</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {showModal && selectedPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Partnerio peržiūra</h2>
                <button
                  onClick={() => {
                    setShowModal(false);
                    setSelectedPartner(null);
                    setRejectionReason('');
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verslo pavadinimas</label>
                  <p className="text-gray-900">{selectedPartner.business_name}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Verslo tipas</label>
                  <p className="text-gray-900">{businessTypeLabels[selectedPartner.business_type]}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Kontaktinis asmuo</label>
                    <p className="text-gray-900">{selectedPartner.contact_name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Statusas</label>
                    {getStatusBadge(selectedPartner.status)}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">El. paštas</label>
                  <p className="text-gray-900">{selectedPartner.contact_email}</p>
                </div>

                {selectedPartner.contact_phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Telefonas</label>
                    <p className="text-gray-900">{selectedPartner.contact_phone}</p>
                  </div>
                )}

                {selectedPartner.address && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Adresas</label>
                    <p className="text-gray-900">{selectedPartner.address}</p>
                  </div>
                )}

                {selectedPartner.description && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aprašymas</label>
                    <p className="text-gray-900">{selectedPartner.description}</p>
                  </div>
                )}

                {selectedPartner.status === 'rejected' && selectedPartner.rejection_reason && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <label className="block text-sm font-medium text-red-800 mb-1">Atmetimo priežastis</label>
                    <p className="text-red-900">{selectedPartner.rejection_reason}</p>
                  </div>
                )}

                {selectedPartner.status === 'pending' && (
                  <div className="space-y-3 pt-4 border-t">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Atmetimo priežastis (nebūtina jei tvirtinate)
                      </label>
                      <textarea
                        value={rejectionReason}
                        onChange={(e) => setRejectionReason(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Įveskite atmetimo priežastį..."
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleReject(selectedPartner)}
                        disabled={actionLoading}
                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading ? 'Atmetama...' : 'Atmesti'}
                      </button>
                      <button
                        onClick={() => handleApprove(selectedPartner)}
                        disabled={actionLoading}
                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {actionLoading ? 'Tvirtinama...' : 'Patvirtinti'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default PartnersPage;
