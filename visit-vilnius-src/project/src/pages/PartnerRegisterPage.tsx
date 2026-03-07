import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, User, Mail, Phone, MapPin, FileText, CheckCircle, Clock, AlertCircle, ArrowLeft, Lock } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Step = 'form' | 'pending';

const businessTypes = [
  { value: 'restaurant', label: 'Restoranas / Kavinė' },
  { value: 'hotel', label: 'Viešbutis / Apgyvendinimas' },
  { value: 'attraction', label: 'Lankytina vieta / Muziejus' },
  { value: 'shop', label: 'Parduotuvė / Galerija' },
  { value: 'event_organizer', label: 'Renginių organizatorius' },
  { value: 'other', label: 'Kita' },
];

const PartnerRegisterPage = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    business_name: '',
    business_type: '',
    contact_name: '',
    contact_email: '',
    contact_phone: '',
    address: '',
    description: '',
    password: '',
    confirmPassword: '',
  });

  const update = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Slaptažodžiai nesutampa');
      return;
    }
    if (form.password.length < 8) {
      setError('Slaptažodis turi būti bent 8 simbolių');
      return;
    }
    if (!form.business_type) {
      setError('Pasirinkite verslo tipą');
      return;
    }

    setLoading(true);
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: form.contact_email,
        password: form.password,
        options: {
          data: {
            full_name: form.contact_name,
            role: 'provider',
          },
        },
      });

      if (authError) throw authError;

      const userId = authData.user?.id;
      if (!userId) throw new Error('Nepavyko sukurti paskyros');

      const { error: partnerError } = await supabase
        .from('partners')
        .insert({
          user_id: userId,
          business_name: form.business_name,
          business_type: form.business_type,
          contact_name: form.contact_name,
          contact_email: form.contact_email,
          contact_phone: form.contact_phone || null,
          address: form.address || null,
          description: form.description || null,
          status: 'pending',
        });

      if (partnerError) throw partnerError;

      setStep('pending');
    } catch (err: any) {
      if (err.message?.includes('already registered')) {
        setError('Šis el. paštas jau užregistruotas. Prisijunkite prie savo paskyros.');
      } else {
        setError(err.message || 'Klaida registruojant. Bandykite dar kartą.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (step === 'pending') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-yellow-100 rounded-full mb-6">
              <Clock className="w-10 h-10 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Anketa pateikta!</h2>
            <p className="text-gray-600 mb-6 leading-relaxed">
              Jūsų partnerio anketa sėkmingai pateikta. Mūsų komanda peržiūrės ją per <strong>1–3 darbo dienas</strong> ir susisieks el. paštu.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-left">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">Kas toliau?</p>
                  <ol className="list-decimal ml-4 space-y-1 text-blue-700">
                    <li>Gausite patvirtinimo el. laišką</li>
                    <li>Mūsų komanda peržiūrės anketą</li>
                    <li>Gavę patvirtinimą, galėsite prisijungti</li>
                  </ol>
                </div>
              </div>
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Grįžti į pagrindinį
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-sky-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <Link to="/login" className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-6">
            <ArrowLeft className="w-4 h-4" />
            Grįžti į prisijungimą
          </Link>
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center">
              <Building2 className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Tapti partneriu</h1>
              <p className="text-gray-600 mt-1">Užregistruokite savo verslą Visit Vilnius platformoje</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-8">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              Jūsų anketa bus peržiūrėta mūsų komandos. Patvirtinimas užtrunka <strong>1–3 darbo dienas</strong>. Gavę patvirtinimą, galėsite prisijungti prie partnerio portalo.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              Verslo informacija
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verslo pavadinimas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={form.business_name}
                  onChange={e => update('business_name', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="pvz. Restoranas Lokys"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Verslo tipas <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={form.business_type}
                  onChange={e => update('business_type', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Pasirinkite...</option>
                  {businessTypes.map(bt => (
                    <option key={bt.value} value={bt.value}>{bt.label}</option>
                  ))}
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Adresas
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={form.address}
                    onChange={e => update('address', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="pvz. Pilies g. 40, Vilnius"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Trumpas aprašymas
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <textarea
                    value={form.description}
                    onChange={e => update('description', e.target.value)}
                    rows={3}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Papasakokite apie savo verslą..."
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-blue-600" />
              Kontaktinė informacija
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kontaktinis asmuo <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    required
                    value={form.contact_name}
                    onChange={e => update('contact_name', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Vardenis Pavardenis"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  El. paštas <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={form.contact_email}
                    onChange={e => update('contact_email', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="info@verslas.lt"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefono numeris
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="tel"
                    value={form.contact_phone}
                    onChange={e => update('contact_phone', e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="+370 600 00000"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-blue-600" />
              Paskyros slaptažodis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Slaptažodis <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={form.password}
                  onChange={e => update('password', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Min. 8 simboliai"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pakartoti slaptažodį <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  required
                  value={form.confirmPassword}
                  onChange={e => update('confirmPassword', e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Pakartokite slaptažodį"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-lg shadow-lg"
          >
            {loading ? 'Registruojama...' : 'Pateikti anketą'}
          </button>

          <p className="text-center text-sm text-gray-600">
            Jau turite paskyrą?{' '}
            <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Prisijungti
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default PartnerRegisterPage;
