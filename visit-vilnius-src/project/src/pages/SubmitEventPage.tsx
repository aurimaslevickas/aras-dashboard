import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, MapPin, Phone, Globe, Mail, Tag, Clock, CheckCircle, AlertCircle, ChevronLeft } from 'lucide-react';
import Header from '../components/Header';
import Footer from '../components/Footer';

interface FormData {
  name: string;
  description: string;
  location: string;
  event_start_date: string;
  event_start_time: string;
  event_end_date: string;
  event_end_time: string;
  price_range: string;
  contact_email: string;
  contact_phone: string;
  contact_website: string;
  organizer_name: string;
  features: string[];
  honeypot: string;
}

const SUGGESTED_TAGS = [
  'Festivalis', 'Koncertas', 'Teatras', 'Parodas', 'Sportas',
  'Maistas', 'Kultūra', 'Muzika', 'Šeima', 'Nemokama',
  'Lauke', 'Viduje', 'Vaikams', 'Suaugusiems', 'Naktinis'
];

const SubmitEventPage = () => {
  const navigate = useNavigate();
  const { locale } = useParams<{ locale: string }>();
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');

  const [form, setForm] = useState<FormData>({
    name: '',
    description: '',
    location: '',
    event_start_date: '',
    event_start_time: '',
    event_end_date: '',
    event_end_time: '',
    price_range: '',
    contact_email: '',
    contact_phone: '',
    contact_website: '',
    organizer_name: '',
    features: [],
    honeypot: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !form.features.includes(trimmed) && form.features.length < 10) {
      setForm(prev => ({ ...prev, features: [...prev.features, trimmed] }));
    }
    setTagInput('');
  };

  const removeTag = (tag: string) => {
    setForm(prev => ({ ...prev, features: prev.features.filter(t => t !== tag) }));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(tagInput);
    }
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/ą/g, 'a').replace(/č/g, 'c').replace(/ę/g, 'e')
      .replace(/ė/g, 'e').replace(/į/g, 'i').replace(/š/g, 's')
      .replace(/ų/g, 'u').replace(/ū/g, 'u').replace(/ž/g, 'z')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const ensureUniqueSlug = async (base: string): Promise<string> => {
    let slug = base;
    let counter = 1;
    while (true) {
      const { data } = await supabase
        .from('listings')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();
      if (!data) break;
      slug = `${base}-${counter++}`;
    }
    return slug;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.honeypot) return;

    if (!form.name.trim() || !form.description.trim() || !form.location.trim() || !form.event_start_date) {
      setError('Prašome užpildyti visus privalomus laukus.');
      return;
    }

    if (!form.event_end_date) {
      setError('Prašome nurodyti pabaigos datą. Vienos dienos renginiui nurodykite tą pačią dieną kaip pradžia.');
      return;
    }

    if (!form.contact_email.trim() && !form.contact_phone.trim()) {
      setError('Prašome nurodyti bent vieną kontaktą (el. paštas arba telefono numeris).');
      return;
    }

    setSubmitting(true);
    try {
      const baseSlug = generateSlug(form.name) + '-' + Date.now();
      const slug = await ensureUniqueSlug(baseSlug);

      let startDatetime: string | null = null;
      if (form.event_start_date) {
        const time = form.event_start_time || '00:00';
        startDatetime = new Date(`${form.event_start_date}T${time}:00`).toISOString();
      }

      let endDatetime: string | null = null;
      if (form.event_end_date) {
        const time = form.event_end_time || '23:59';
        endDatetime = new Date(`${form.event_end_date}T${time}:00`).toISOString();
      }

      const contactInfo: Record<string, string> = {};
      if (form.contact_email.trim()) contactInfo.email = form.contact_email.trim();
      if (form.contact_phone.trim()) contactInfo.phone = form.contact_phone.trim();
      if (form.contact_website.trim()) {
        let website = form.contact_website.trim();
        if (!website.startsWith('http://') && !website.startsWith('https://')) {
          website = 'https://' + website;
        }
        contactInfo.website = website;
      }

      const { error: insertError } = await supabase
        .from('listings')
        .insert({
          category: 'event',
          status: 'pending',
          name: form.name.trim(),
          slug,
          description: form.description.trim(),
          location: form.location.trim(),
          organizer: form.organizer_name.trim() || null,
          event_start_date: startDatetime,
          event_end_date: endDatetime,
          price_range: form.price_range.trim() || null,
          contact_info: contactInfo,
          features: form.features.length > 0 ? form.features : null,
          rating: 0,
        });

      if (insertError) throw insertError;

      setStep('success');
    } catch (err: any) {
      console.error('Submit error:', err);
      setError('Įvyko klaida siunčiant formą. Bandykite dar kartą.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentLocale = locale || 'lt';
  const eventsPath = currentLocale === 'lt' ? `/${currentLocale}/renginiai` : `/${currentLocale}/events`;

  if (step === 'success') {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-20">
          <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm p-10 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-3">Renginys pateiktas!</h1>
            <p className="text-gray-600 mb-2">
              Jūsų renginys sėkmingai išsiųstas. Mūsų komanda jį peržiūrės ir patvirtins per 1–2 darbo dienas.
            </p>
            <p className="text-gray-500 text-sm mb-8">
              Jei turite klausimų, susisiekite su mumis el. paštu.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => { setStep('form'); setForm({ name: '', description: '', location: '', event_start_date: '', event_start_time: '', event_end_date: '', event_end_time: '', price_range: '', contact_email: '', contact_phone: '', contact_website: '', organizer_name: '', features: [], honeypot: '' }); }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Pateikti kitą renginį
              </button>
              <button
                onClick={() => navigate(eventsPath)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Visi renginiai
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-br from-blue-700 to-blue-900 text-white py-16 px-4">
          <div className="max-w-3xl mx-auto">
            <button
              onClick={() => navigate(eventsPath)}
              className="flex items-center gap-2 text-blue-200 hover:text-white mb-6 transition-colors text-sm"
            >
              <ChevronLeft className="w-4 h-4" />
              Grįžti į renginius
            </button>
            <div className="flex items-center gap-4 mb-4">
              <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center">
                <Calendar className="w-7 h-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Pranešti apie renginį</h1>
                <p className="text-blue-200 mt-1">Jūsų renginys pasieks tūkstančius Vilniaus lankytojų</p>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-6 bg-white/10 rounded-xl px-4 py-3 text-sm text-blue-100">
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>Renginiai peržiūrimi ir patvirtinami per 1–2 darbo dienas. Patvirtinus renginys bus rodomas viešai.</span>
            </div>
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-10">
          <form onSubmit={handleSubmit} className="space-y-8">
            <input
              type="text"
              name="honeypot"
              value={form.honeypot}
              onChange={handleChange}
              className="hidden"
              tabIndex={-1}
              autoComplete="off"
            />

            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</span>
                Pagrindinė informacija
              </h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Renginio pavadinimas <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="pvz. Vilniaus Jazz Festivalis 2025"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Aprašymas <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Aprašykite renginį – kas vyksta, kas laukia lankytojų, kodėl verta atvykti..."
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400 resize-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Vieta <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    placeholder="pvz. Katedros aikštė, Vilnius"
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                    required
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Nurodykite vietos pavadinimą ir miestą, pvz. <span className="text-gray-500">Katedros aikštė, Vilnius</span> arba <span className="text-gray-500">Žalgirio arena, Kaunas</span></p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Kaina
                </label>
                <input
                  type="text"
                  name="price_range"
                  value={form.price_range}
                  onChange={handleChange}
                  placeholder="pvz. Nemokama, €5, €10–€30"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                />
                <p className="text-xs text-gray-400 mt-1">Palikite tuščią jei kaina nežinoma. Pvz.: <span className="text-gray-500">Nemokama</span>, <span className="text-gray-500">€10</span>, <span className="text-gray-500">€5–€15</span> (kainų ribos)</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</span>
                Data ir laikas
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Pradžios data <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="event_start_date"
                    value={form.event_start_date}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Pradžios laikas
                  </label>
                  <input
                    type="time"
                    name="event_start_time"
                    value={form.event_start_time}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Pabaigos data <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="event_end_date"
                    value={form.event_end_date}
                    onChange={handleChange}
                    min={form.event_start_date}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                  <p className="text-xs text-gray-400 mt-1">Vienos dienos renginiui – ta pati data kaip pradžia</p>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Pabaigos laikas
                  </label>
                  <input
                    type="time"
                    name="event_end_time"
                    value={form.event_end_time}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</span>
                Kontaktinė informacija
              </h2>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Organizatoriaus vardas / organizacija
                </label>
                <input
                  type="text"
                  name="organizer_name"
                  value={form.organizer_name}
                  onChange={handleChange}
                  placeholder="pvz. Vilniaus miesto savivaldybė"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    El. paštas <span className="text-gray-400 font-normal">(arba telefono numeris)</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                    <input
                      type="email"
                      name="contact_email"
                      value={form.contact_email}
                      onChange={handleChange}
                      placeholder="info@renginys.lt"
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Telefono numeris
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                    <input
                      type="tel"
                      name="contact_phone"
                      value={form.contact_phone}
                      onChange={handleChange}
                      placeholder="+370 600 00000"
                      className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Svetainė
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4.5 h-4.5" />
                  <input
                    type="text"
                    name="contact_website"
                    value={form.contact_website}
                    onChange={handleChange}
                    placeholder="pvz. www.renginys.lt arba https://renginys.lt"
                    className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-400"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">https:// bus pridėta automatiškai</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm p-6 space-y-5">
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <span className="w-7 h-7 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">4</span>
                Žymės (neprivaloma)
              </h2>
              <p className="text-sm text-gray-500">Pasirinkite kategorijas kurios geriausiai apibūdina renginį (iki 10)</p>

              <div className="flex flex-wrap gap-2">
                {SUGGESTED_TAGS.map(tag => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => form.features.includes(tag) ? removeTag(tag) : addTag(tag)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      form.features.includes(tag)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    value={tagInput}
                    onChange={e => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Kita žymė..."
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => addTag(tagInput)}
                  className="px-4 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                  Pridėti
                </button>
              </div>

              {form.features.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {form.features.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="ml-1 hover:text-blue-900 text-lg leading-none">&times;</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => navigate(eventsPath)}
                className="flex-1 sm:flex-none px-6 py-3.5 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
              >
                Atšaukti
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 px-8 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-semibold disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Siunčiama...
                  </span>
                ) : (
                  'Pateikti renginį'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default SubmitEventPage;
