import React, { useState, useEffect } from 'react';
import { supabase, adminFetch } from '../lib/supabase';
import AdminLayout from '../components/admin/AdminLayout';
import { useAuth } from '../contexts/AuthContext';
import {
  Users,
  Search,
  Shield,
  ShieldCheck,
  Mail,
  Calendar,
  Plus,
  X,
  Loader2,
  AlertTriangle,
  Eye,
  EyeOff,
  CheckCircle,
} from 'lucide-react';

interface User {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
}

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administratorius',
  editor: 'Redaktorius',
};

const ROLE_DESCRIPTIONS: Record<string, string> = {
  admin: 'Pilna prieiga — valdo vartotojus, nustatymus, visą turinį',
  editor: 'Redaguoja turinį (renginiai, objektai, straipsniai), bet nemato vartotojų valdymo',
};

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createForm, setCreateForm] = useState({ email: '', password: '', full_name: '', role: 'editor' });
  const [showPassword, setShowPassword] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  const [roleChangeTarget, setRoleChangeTarget] = useState<{ user: User; newRole: string } | null>(null);
  const [updatingRole, setUpdatingRole] = useState<string | null>(null);

  useEffect(() => {
    loadUsers();
  }, [roleFilter]);

  const loadUsers = async () => {
    try {
      setLoading(true);
      let query = supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (roleFilter !== 'all') {
        query = query.eq('role', roleFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setUsers(data || []);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setCreateError(null);

    try {
      await adminFetch('create-admin-user', createForm);

      setCreateSuccess(true);
      setCreateForm({ email: '', password: '', full_name: '', role: 'editor' });
      loadUsers();
      setTimeout(() => {
        setCreateSuccess(false);
        setShowCreateModal(false);
      }, 2000);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Klaida kuriant vartotoją');
    } finally {
      setCreating(false);
    }
  };

  const confirmRoleChange = async () => {
    if (!roleChangeTarget) return;
    const { user, newRole } = roleChangeTarget;
    setUpdatingRole(user.id);
    try {
      const { error } = await supabase
        .from('users')
        .update({ role: newRole })
        .eq('id', user.id);
      if (error) throw error;
      loadUsers();
    } catch (error) {
      console.error('Error updating role:', error);
    } finally {
      setUpdatingRole(null);
      setRoleChangeTarget(null);
    }
  };

  const handleRoleChange = (user: User, newRole: string) => {
    if (user.id === currentUser?.id) return;
    if (user.role === 'admin' && newRole !== 'admin') {
      setRoleChangeTarget({ user, newRole });
    } else {
      setUpdatingRole(user.id);
      supabase.from('users').update({ role: newRole }).eq('id', user.id).then(({ error }) => {
        if (!error) loadUsers();
        setUpdatingRole(null);
      });
    }
  };

  const filteredUsers = users.filter(user =>
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (user.full_name && user.full_name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('lt-LT', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Vartotojų valdymas</h1>
            <p className="text-gray-600 mt-1">Kurkite ir valdykite sistemos naudotojus</p>
          </div>
          <button
            onClick={() => { setShowCreateModal(true); setCreateError(null); setCreateSuccess(false); }}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4" />
            Naujas vartotojas
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <ShieldCheck className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Administratoriai</p>
              <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'admin').length}</p>
              <p className="text-xs text-gray-400 mt-0.5">{ROLE_DESCRIPTIONS.admin}</p>
            </div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-5 flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Shield className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wide">Redaktoriai</p>
              <p className="text-2xl font-bold text-gray-900">{users.filter(u => u.role === 'editor').length}</p>
              <p className="text-xs text-gray-400 mt-0.5">{ROLE_DESCRIPTIONS.editor}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Ieškoti pagal el. paštą arba vardą..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">Visos rolės</option>
              <option value="admin">Administratoriai</option>
              <option value="editor">Redaktoriai</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Vartotojų nerasta</h3>
            <p className="text-gray-600">Pakeiskite paieškos kriterijus arba sukurkite naują vartotoją</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Vartotojas</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">El. paštas</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Rolė</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Registracija</th>
                  <th className="text-left px-6 py-4 text-sm font-semibold text-gray-900">Keisti rolę</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user) => {
                  const isSelf = user.id === currentUser?.id;
                  return (
                    <tr key={user.id} className={`hover:bg-gray-50 transition-colors ${isSelf ? 'bg-blue-50/40' : ''}`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${
                            user.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                          }`}>
                            {(user.full_name || user.email).charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">
                              {user.full_name || <span className="text-gray-400 font-normal">Nenurodytas</span>}
                            </p>
                            {isSelf && <p className="text-xs text-blue-600 font-medium">Tai jūs</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>{user.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-block text-xs font-semibold px-2.5 py-1 rounded-full ${
                          user.role === 'admin'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {ROLE_LABELS[user.role] || user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span>{formatDate(user.created_at)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {isSelf ? (
                          <span className="text-xs text-gray-400 italic">Savo rolės keisti negalima</span>
                        ) : updatingRole === user.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                        ) : (
                          <select
                            value={user.role}
                            onChange={(e) => handleRoleChange(user, e.target.value)}
                            className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 bg-white"
                          >
                            <option value="editor">Redaktorius</option>
                            <option value="admin">Administratorius</option>
                          </select>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <p className="text-center text-sm text-gray-500">
          Rodoma {filteredUsers.length} iš {users.length} vartotojų
        </p>
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Naujas vartotojas</h2>
              <button onClick={() => setShowCreateModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {createSuccess ? (
              <div className="flex flex-col items-center py-8 gap-3">
                <CheckCircle className="w-12 h-12 text-green-500" />
                <p className="font-semibold text-gray-900">Vartotojas sukurtas</p>
              </div>
            ) : (
              <form onSubmit={handleCreateUser} className="space-y-4">
                {createError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    {createError}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Vardas Pavardė</label>
                  <input
                    type="text"
                    value={createForm.full_name}
                    onChange={e => setCreateForm(p => ({ ...p, full_name: e.target.value }))}
                    placeholder="pvz. Jonas Jonaitis"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">El. paštas *</label>
                  <input
                    type="email"
                    value={createForm.email}
                    onChange={e => setCreateForm(p => ({ ...p, email: e.target.value }))}
                    required
                    placeholder="vardas@domenai.lt"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Slaptažodis *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={createForm.password}
                      onChange={e => setCreateForm(p => ({ ...p, password: e.target.value }))}
                      required
                      minLength={8}
                      placeholder="min. 8 simboliai"
                      className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Rolė *</label>
                  <div className="space-y-2">
                    {(['editor', 'admin'] as const).map(r => (
                      <label
                        key={r}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                          createForm.role === r
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-200'
                        }`}
                      >
                        <input
                          type="radio"
                          name="role"
                          value={r}
                          checked={createForm.role === r}
                          onChange={() => setCreateForm(p => ({ ...p, role: r }))}
                          className="mt-0.5 accent-blue-600"
                        />
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{ROLE_LABELS[r]}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{ROLE_DESCRIPTIONS[r]}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors text-sm font-medium"
                  >
                    Atšaukti
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-semibold disabled:opacity-50"
                  >
                    {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    {creating ? 'Kuriama...' : 'Sukurti'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {roleChangeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-1">Pakeisti administratoriaus rolę?</h3>
                <p className="text-gray-600 text-sm">
                  Vartotojas <span className="font-semibold">{roleChangeTarget.user.email}</span> praras administratoriaus prieigą ir taps <span className="font-semibold">{ROLE_LABELS[roleChangeTarget.newRole]}</span>.
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setRoleChangeTarget(null)}
                className="flex-1 px-4 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium text-sm"
              >
                Atšaukti
              </button>
              <button
                onClick={confirmRoleChange}
                className="flex-1 px-4 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 font-semibold text-sm"
              >
                Patvirtinti
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsersPage;
