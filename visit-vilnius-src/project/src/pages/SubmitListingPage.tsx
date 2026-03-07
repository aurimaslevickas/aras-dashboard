import React, { useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { compressImage } from '../utils/imageUtils';
import {
  Calendar, MapPin, Phone, Globe, Mail, Tag, Clock,
  CheckCircle, AlertCircle, ChevronLeft, Upload, Image as ImageIcon,
  X, Loader2, UtensilsCrossed, Beer, Bed, ShoppingBag, Landmark, Ticket,
  ChevronRight, Building2, Info, Plus
} from 'lucide-react';

type Category = 'event' | 'restaurant' | 'bar' | 'hotel' | 'shop' | 'attraction';

interface CategoryConfig {
  value: Category;
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  tags: string[];
  showDates: boolean;
  showHours: boolean;
}

const DAYS = ['Pirmadienis', 'Antradienis', 'Trečiadienis', 'Ketvirtadienis', 'Penktadienis', 'Šeštadienis', 'Sekmadienis'];
const DAY_KEYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'];

interface DayHours {
  open: boolean;
  from: string;
  to: string;
}

type OpeningHoursMap = Record<string, DayHours>;

const DEFAULT_HOURS: OpeningHoursMap = {
  mon: { open: false, from: '09:00', to: '22:00' },
  tue: { open: false, from: '09:00', to: '22:00' },
  wed: { open: false, from: '09:00', to: '22:00' },
  thu: { open: false, from: '09:00', to: '22:00' },
  fri: { open: false, from: '09:00', to: '22:00' },
  sat: { open: false, from: '10:00', to: '23:00' },
  sun: { open: false, from: '10:00', to: '22:00' },
};

const PRICE_OPTIONS_PLACE = [
  { value: 'budget', label: 'Ekonomiška (€)', symbol: '€' },
  { value: 'mid', label: 'Vidutinė (€€)', symbol: '€€' },
  { value: 'upscale', label: 'Brangesnė (€€€)', symbol: '€€€' },
  { value: 'luxury', label: 'Prabanga (€€€€)', symbol: '€€€€' },
];

const PRICE_TIERS_EVENT = [
  { value: 'free', label: 'Nemokamas', symbol: '' },
  { value: 'budget', label: 'Pigus (iki €15)', symbol: '€' },
  { value: 'mid', label: 'Vidutinis (€15–€40)', symbol: '€€' },
  { value: 'premium', label: 'Brangus (€40–€100)', symbol: '€€€' },
  { value: 'luxury', label: 'Premium (€100+)', symbol: '€€€€' },
];

const CATEGORIES: CategoryConfig[] = [
  {
    value: 'event',
    label: 'Renginys',
    description: 'Festivalis, koncertas, paroda, sporto varžybos',
    icon: Ticket,
    color: 'blue',
    tags: ['Festivalis', 'Koncertas', 'Teatras', 'Paroda', 'Sportas', 'Muzika', 'Šeimoms', 'Nemokama', 'Lauke', 'Vaikams', 'Maistas', 'Menas', 'Edukacija', 'Kinas'],
    showDates: true,
    showHours: false,
  },
  {
    value: 'restaurant',
    label: 'Restoranas / Kavinė',
    description: 'Restoranas, kavinė, picerija, greito maisto',
    icon: UtensilsCrossed,
    color: 'orange',
    tags: ['Lietuviška virtuvė', 'Itališka virtuvė', 'Azijietiška virtuvė', 'Vegetariška', 'Veganiška', 'Terasa', 'Šeimoms', 'Romantiška', 'Greitas maistas', 'Fine dining', 'Brunch', 'Vaikų žaidimų zona', 'Tinkamas su vaikais', 'Gluten free', 'Alkoholis', 'Privatus kambarys', 'Wi-Fi', 'Parking'],
    showDates: false,
    showHours: true,
  },
  {
    value: 'bar',
    label: 'Baras / Vyninė',
    description: 'Baras, vyninė, alaus darykla, kokteilių baras',
    icon: Beer,
    color: 'amber',
    tags: ['Kokteiliai', 'Vietinis alus', 'Vynas', 'Gyvoji muzika', 'Sportas', 'Žaidimų vakaras', 'Lauko terasa', 'Biliardas', 'Karaoke', 'Šokiai', 'DJ', 'Craft alus', 'Spirits', 'Wi-Fi'],
    showDates: false,
    showHours: true,
  },
  {
    value: 'hotel',
    label: 'Nakvynė',
    description: 'Viešbutis, apartamentai, nakvynės namai, vila',
    icon: Bed,
    color: 'teal',
    tags: ['SPA', 'Baseinas', 'Restoranas', 'Konferencijų salė', 'Parking', 'Wi-Fi', 'Augintiniai', 'Tinkamas su vaikais', 'Romantiška', 'Prabangus', 'Boutique', 'Pusryčiai įskaičiuoti', '24/7 registratūra', 'Kambario aptarnavimas', 'Sporto salė'],
    showDates: false,
    showHours: false,
  },
  {
    value: 'shop',
    label: 'Parduotuvė',
    description: 'Parduotuvė, galerija, turgus, rankdarbiai',
    icon: ShoppingBag,
    color: 'rose',
    tags: ['Suvenyrai', 'Rankų darbo', 'Pagaminta Lietuvoje', 'Maistas ir gėrimai', 'Menas', 'Mada', 'Antikvaras', 'Knygos', 'Sportas', 'Prekės vaikams', 'Elektronika', 'Dizainas', 'Turgus', 'Ekologiška'],
    showDates: false,
    showHours: true,
  },
  {
    value: 'attraction',
    label: 'Lankytina vieta',
    description: 'Muziejus, pilis, gamtos objektas, pramoga',
    icon: Landmark,
    color: 'green',
    tags: ['Muziejus', 'Pilis', 'Gamta', 'Istorija', 'Šeimoms', 'Vaikams', 'Nemokama', 'Pramogos', 'Ekskursija', 'Lauke', 'UNESCO', 'Bažnyčia', 'Parkas', 'Apžvalgos aikštelė'],
    showDates: false,
    showHours: true,
  },
];

const COLOR_MAP: Record<string, { bg: string; border: string; text: string; button: string; tag: string; tagSelected: string; checkOn: string }> = {
  blue:   { bg: 'bg-blue-50',   border: 'border-blue-500',   text: 'text-blue-700',   button: 'bg-blue-600 hover:bg-blue-700',   tag: 'bg-blue-50 text-blue-700 border-blue-200',   tagSelected: 'bg-blue-600 text-white border-blue-600',   checkOn: 'bg-blue-600' },
  orange: { bg: 'bg-orange-50', border: 'border-orange-500', text: 'text-orange-700', button: 'bg-orange-600 hover:bg-orange-700', tag: 'bg-orange-50 text-orange-700 border-orange-200', tagSelected: 'bg-orange-600 text-white border-orange-600', checkOn: 'bg-orange-600' },
  amber:  { bg: 'bg-amber-50',  border: 'border-amber-500',  text: 'text-amber-700',  button: 'bg-amber-600 hover:bg-amber-700',  tag: 'bg-amber-50 text-amber-700 border-amber-200',  tagSelected: 'bg-amber-600 text-white border-amber-600',  checkOn: 'bg-amber-600' },
  teal:   { bg: 'bg-teal-50',   border: 'border-teal-500',   text: 'text-teal-700',   button: 'bg-teal-600 hover:bg-teal-700',   tag: 'bg-teal-50 text-teal-700 border-teal-200',   tagSelected: 'bg-teal-600 text-white border-teal-600',   checkOn: 'bg-teal-600' },
  rose:   { bg: 'bg-rose-50',   border: 'border-rose-500',   text: 'text-rose-700',   button: 'bg-rose-600 hover:bg-rose-700',   tag: 'bg-rose-50 text-rose-700 border-rose-200',   tagSelected: 'bg-rose-600 text-white border-rose-600',   checkOn: 'bg-rose-600' },
  green:  { bg: 'bg-green-50',  border: 'border-green-500',  text: 'text-green-700',  button: 'bg-green-600 hover:bg-green-700',  tag: 'bg-green-50 text-green-700 border-green-200',  tagSelected: 'bg-green-600 text-white border-green-600',  checkOn: 'bg-green-600' },
};

interface FormData {
  name: string;
  description: string;
  location: string;
  price_value: string;
  contact_email: string;
  contact_phone: string;
  contact_website: string;
  submitter_name: string;
  submitter_email: string;
  submitter_phone: string;
  organizer_name: string;
  features: string[];
  images: string[];
  event_start_date: string;
  event_start_time: string;
  event_end_date: string;
  event_end_time: string;
  opening_hours: OpeningHoursMap;
  honeypot: string;
}

const generateSlug = (name: string): string =>
  name
    .toLowerCase()
    .replace(/ą/g, 'a').replace(/č/g, 'c').replace(/ę/g, 'e')
    .replace(/ė/g, 'e').replace(/į/g, 'i').replace(/š/g, 's')
    .replace(/ų/g, 'u').replace(/ū/g, 'u').replace(/ž/g, 'z')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();

const formatHoursForStorage = (hours: OpeningHoursMap): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  DAY_KEYS.forEach(key => {
    const d = hours[key];
    if (d.open) {
      result[key] = { from: d.from, to: d.to };
    }
  });
  return result;
};

const getPriceSymbol = (value: string, isEvent: boolean): string => {
  const options = isEvent ? PRICE_TIERS_EVENT : PRICE_OPTIONS_PLACE;
  const found = options.find(o => o.value === value);
  if (!found) return '';
  if (found.value === 'free') return 'Nemokama';
  return found.symbol;
};

const SubmitListingPage = () => {
  const { locale } = useParams<{ locale: string }>();
  const navigate = useNavigate();

  const [step, setStep] = useState<'category' | 'form' | 'success'>('category');
  const [selectedCategory, setSelectedCategory] = useState<CategoryConfig | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const extraFileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormData>({
    name: '',
    description: '',
    location: '',
    price_value: '',
    contact_email: '',
    contact_phone: '',
    contact_website: '',
    submitter_name: '',
    submitter_email: '',
    submitter_phone: '',
    organizer_name: '',
    features: [],
    images: [],
    event_start_date: '',
    event_start_time: '',
    event_end_date: '',
    event_end_time: '',
    opening_hours: { ...DEFAULT_HOURS },
    honeypot: '',
  });

  const colors = selectedCategory ? COLOR_MAP[selectedCategory.color] : COLOR_MAP.blue;
  const isEvent = selectedCategory?.value === 'event';
  const priceOptions = isEvent ? PRICE_TIERS_EVENT : PRICE_OPTIONS_PLACE;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (trimmed && !form.features.includes(trimmed) && form.features.length < 15) {
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

  const toggleDay = (key: string) => {
    setForm(prev => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [key]: { ...prev.opening_hours[key], open: !prev.opening_hours[key].open },
      },
    }));
  };

  const updateDayTime = (key: string, field: 'from' | 'to', value: string) => {
    setForm(prev => ({
      ...prev,
      opening_hours: {
        ...prev.opening_hours,
        [key]: { ...prev.opening_hours[key], [field]: value },
      },
    }));
  };

  const selectAllDays = () => {
    setForm(prev => {
      const updated = { ...prev.opening_hours };
      DAY_KEYS.forEach(k => { updated[k] = { ...updated[k], open: true }; });
      return { ...prev, opening_hours: updated };
    });
  };

  const clearAllDays = () => {
    setForm(prev => {
      const updated = { ...prev.opening_hours };
      DAY_KEYS.forEach(k => { updated[k] = { ...updated[k], open: false }; });
      return { ...prev, opening_hours: updated };
    });
  };

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const compressed = await compressImage(file);
      const filename = `submissions/${Date.now()}_${Math.random().toString(36).slice(2)}_${compressed.name}`;
      const { error: uploadError } = await supabase.storage.from('media').upload(filename, compressed);
      if (uploadError) throw uploadError;
      const { data: urlData } = supabase.storage.from('media').getPublicUrl(filename);
      await supabase.from('media_library').insert({
        filename: file.name,
        url: urlData.publicUrl,
        type: 'image',
        size: compressed.size,
      });
      return urlData.publicUrl;
    } catch (err) {
      console.error('Upload error:', err);
      return null;
    }
  };

  const handleMainImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const url = await uploadImage(file);
    if (url) {
      setForm(prev => {
        const imgs = [...prev.images];
        imgs[0] = url;
        return { ...prev, images: imgs };
      });
    } else {
      setError('Nepavyko įkelti nuotraukos.');
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleExtraImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;
    setUploading(true);
    const urls: string[] = [];
    for (const file of files) {
      const url = await uploadImage(file);
      if (url) urls.push(url);
    }
    setForm(prev => ({ ...prev, images: [...prev.images, ...urls] }));
    setUploading(false);
    if (extraFileInputRef.current) extraFileInputRef.current.value = '';
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    const url = await uploadImage(file);
    if (url) {
      setForm(prev => {
        const imgs = [...prev.images];
        if (imgs.length === 0) imgs[0] = url;
        else imgs.push(url);
        return { ...prev, images: imgs };
      });
    }
    setUploading(false);
  };

  const removeImage = (idx: number) => {
    setForm(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
  };

  const ensureUniqueSlug = async (base: string): Promise<string> => {
    let slug = base;
    let counter = 1;
    while (true) {
      const { data } = await supabase.from('listings').select('id').eq('slug', slug).maybeSingle();
      if (!data) break;
      slug = `${base}-${counter++}`;
    }
    return slug;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.honeypot) return;
    if (!selectedCategory) return;

    if (!form.name.trim() || !form.description.trim() || !form.location.trim()) {
      setError('Prašome užpildyti visus privalomus laukus (pavadinimas, aprašymas, adresas).');
      return;
    }

    if (selectedCategory.showDates && !form.event_start_date) {
      setError('Prašome nurodyti renginio pradžios datą.');
      return;
    }

    if (selectedCategory.showDates && !form.event_end_date) {
      setError('Prašome nurodyti renginio pabaigos datą.');
      return;
    }

    if (form.images.length === 0) {
      setError('Prašome pridėti bent vieną nuotrauką.');
      return;
    }

    if (!form.submitter_email.trim() && !form.submitter_phone.trim()) {
      setError('Prašome nurodyti savo kontaktą (el. paštas arba telefonas), kad galėtume su Jumis susisiekti.');
      return;
    }

    setSubmitting(true);
    try {
      const baseSlug = generateSlug(form.name) + '-' + Date.now();
      const slug = await ensureUniqueSlug(baseSlug);

      const contactInfo: Record<string, unknown> = {};
      if (form.contact_email.trim()) contactInfo.email = form.contact_email.trim();
      if (form.contact_phone.trim()) contactInfo.phone = form.contact_phone.trim();
      if (form.contact_website.trim()) {
        let website = form.contact_website.trim();
        if (!website.startsWith('http://') && !website.startsWith('https://')) website = 'https://' + website;
        contactInfo.website = website;
      }
      const submitterInfo: Record<string, string> = {};
      if (form.submitter_name.trim()) submitterInfo.name = form.submitter_name.trim();
      if (form.submitter_email.trim()) submitterInfo.email = form.submitter_email.trim();
      if (form.submitter_phone.trim()) submitterInfo.phone = form.submitter_phone.trim();
      if (Object.keys(submitterInfo).length > 0) contactInfo._submitter = submitterInfo as unknown as string;

      const priceSymbol = form.price_value ? getPriceSymbol(form.price_value, isEvent) : null;
      const allFeatures = [...form.features];
      if (form.price_value === 'free' && !allFeatures.includes('Nemokama')) {
        allFeatures.push('Nemokama');
      }

      const payload: Record<string, unknown> = {
        category: selectedCategory.value,
        status: 'pending',
        name: form.name.trim(),
        slug,
        description: form.description.trim(),
        location: form.location.trim(),
        price_range: priceSymbol,
        contact_info: contactInfo,
        features: allFeatures.length > 0 ? allFeatures : null,
        image_url: form.images[0] || null,
        gallery_images: form.images.length > 1 ? form.images.slice(1) : null,
        image_alt_lt: form.name.trim(),
        rating: 0,
      };

      if (form.organizer_name.trim()) payload.organizer = form.organizer_name.trim();

      if (selectedCategory.showDates) {
        if (form.event_start_date) {
          const t = form.event_start_time || '00:00';
          payload.event_start_date = new Date(`${form.event_start_date}T${t}:00`).toISOString();
        }
        if (form.event_end_date) {
          const t = form.event_end_time || '23:59';
          payload.event_end_date = new Date(`${form.event_end_date}T${t}:00`).toISOString();
        }
      }

      if (selectedCategory.showHours) {
        const hoursData = formatHoursForStorage(form.opening_hours);
        if (Object.keys(hoursData).length > 0) {
          payload.opening_hours = hoursData;
        }
      }

      const { error: insertError } = await supabase.from('listings').insert(payload);
      if (insertError) throw insertError;

      setStep('success');
    } catch (err: unknown) {
      console.error('Submit error:', err);
      setError('Įvyko klaida siunčiant formą. Bandykite dar kartą.');
    } finally {
      setSubmitting(false);
    }
  };

  const currentLocale = locale || 'lt';

  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-xl w-full text-center py-16">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Pateikta sėkmingai!</h1>
          <p className="text-gray-600 mb-2">
            Jūsų <strong>{selectedCategory?.label.toLowerCase()}</strong> pateikta peržiūrai.
          </p>
          <p className="text-gray-500 text-sm mb-8">
            Moderatorius patikrins ir patvirtins pateiktą informaciją. Paprastai tai užtrunka 1–2 darbo dienas.
          </p>
          <button
            onClick={() => navigate(`/${currentLocale}`)}
            className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-colors"
          >
            Grįžti į pradžią
          </button>
        </div>
      </div>
    );
  }

  if (step === 'category') {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-12">
          <button
            onClick={() => navigate(`/${currentLocale}`)}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-8 text-sm"
          >
            <ChevronLeft className="w-4 h-4" />
            Grįžti
          </button>

          <div className="text-center mb-10">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-900 rounded-2xl mb-4">
              <Building2 className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">Pridėkite savo vietą</h1>
            <p className="text-gray-500 max-w-md mx-auto">
              Pasirinkite kategoriją ir užpildykite formą. Jūsų pateikimas bus peržiūrėtas ir patvirtintas.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {CATEGORIES.map((cat) => {
              const Icon = cat.icon;
              const c = COLOR_MAP[cat.color];
              return (
                <button
                  key={cat.value}
                  onClick={() => { setSelectedCategory(cat); setForm(prev => ({ ...prev, images: [], features: [], opening_hours: { ...DEFAULT_HOURS }, contact_email: '', contact_phone: '', contact_website: '' })); setStep('form'); }}
                  className={`group flex items-start gap-4 p-5 bg-white border-2 border-transparent rounded-2xl text-left hover:${c.border} hover:${c.bg} transition-all duration-200 shadow-sm hover:shadow-md`}
                >
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center ${c.bg} group-hover:scale-110 transition-transform`}>
                    <Icon className={`w-6 h-6 ${c.text}`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-gray-900">{cat.label}</h3>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{cat.description}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <p className="text-center text-xs text-gray-400 mt-8">
            Visi pateikimai yra nemokami ir peržiūrimi prieš publikuojant.
          </p>
        </div>
      </div>
    );
  }

  if (!selectedCategory) return null;
  const Icon = selectedCategory.icon;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10">
        <button
          onClick={() => setStep('category')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-8 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          Keisti kategoriją
        </button>

        <div className={`flex items-center gap-3 p-4 ${colors.bg} rounded-2xl mb-8`}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white">
            <Icon className={`w-5 h-5 ${colors.text}`} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{selectedCategory.label} pateikimas</h1>
            <p className="text-sm text-gray-500">{selectedCategory.description}</p>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm">
            <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* Photos */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="font-semibold text-gray-900 mb-1 flex items-center gap-2">
              <ImageIcon className="w-4 h-4 text-gray-400" />
              Nuotraukos <span className="text-red-500">*</span>
            </h2>
            <p className="text-xs text-gray-400 mb-4">Bent viena nuotrauka yra privaloma. Pirmoji nuotrauka bus pagrindinė.</p>

            {form.images.length === 0 ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                  dragOver ? 'border-gray-400 bg-gray-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                {uploading ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-3">
                    <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
                    <p className="text-sm text-gray-500">Keliama...</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 gap-2">
                    <Upload className="w-8 h-8 text-gray-300" />
                    <p className="text-sm font-medium text-gray-500">Spustelėkite arba tempkite nuotrauką</p>
                    <p className="text-xs text-gray-400">JPG, PNG, WebP — automatiškai optimizuojama</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {form.images.map((img, idx) => (
                    <div key={idx} className="relative group rounded-xl overflow-hidden border border-gray-200 aspect-video">
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      {idx === 0 && (
                        <div className="absolute top-1.5 left-1.5 px-2 py-0.5 bg-gray-900/80 text-white text-xs rounded-full font-medium">
                          Pagrindinė
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1.5 right-1.5 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={() => uploading ? null : extraFileInputRef.current?.click()}
                    disabled={uploading}
                    className="aspect-video border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-1 hover:border-gray-300 hover:bg-gray-50 transition-all disabled:opacity-50"
                  >
                    {uploading ? (
                      <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                    ) : (
                      <>
                        <Plus className="w-5 h-5 text-gray-400" />
                        <span className="text-xs text-gray-400">Pridėti</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" onChange={handleMainImageChange} className="hidden" />
            <input ref={extraFileInputRef} type="file" accept="image/jpeg,image/png,image/webp,image/heic,image/heif" multiple onChange={handleExtraImageChange} className="hidden" />
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-gray-400" />
              Pagrindinė informacija
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Pavadinimas <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder={`${selectedCategory.label} pavadinimas`}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Aprašymas <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                placeholder="Papasakokite apie savo vietą — ką siūlote, kuo esate ypatingi..."
                rows={4}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                Adresas / Vieta <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="Gatvė 1, Vilnius"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                required
              />
            </div>

            {/* Price selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {isEvent ? 'Bilietų kaina' : 'Kainų kategorija'}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {priceOptions.map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, price_value: prev.price_value === opt.value ? '' : opt.value }))}
                    className={`flex flex-col items-center justify-center px-3 py-3 rounded-xl border-2 text-sm font-medium transition-all ${
                      form.price_value === opt.value
                        ? `${colors.border} ${colors.bg} ${colors.text}`
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-base font-bold">{opt.symbol || '✓'}</span>
                    <span className="text-xs mt-0.5 text-center leading-tight">{opt.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Event Dates */}
          {selectedCategory.showDates && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                Data ir laikas
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Pradžia <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="event_start_date"
                    value={form.event_start_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Pradžios laikas
                  </label>
                  <input
                    type="time"
                    name="event_start_time"
                    value={form.event_start_time}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Pabaiga <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="event_end_date"
                    value={form.event_end_date}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> Pabaigos laikas
                  </label>
                  <input
                    type="time"
                    name="event_end_time"
                    value={form.event_end_time}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Opening Hours */}
          {selectedCategory.showHours && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-gray-400" />
                  Darbo laikas
                </h2>
                <div className="flex gap-2">
                  <button type="button" onClick={selectAllDays} className="text-xs text-gray-500 hover:text-gray-700 underline">
                    Visos dienos
                  </button>
                  <span className="text-gray-300">|</span>
                  <button type="button" onClick={clearAllDays} className="text-xs text-gray-500 hover:text-gray-700 underline">
                    Išvalyti
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {DAY_KEYS.map((key, idx) => {
                  const day = form.opening_hours[key];
                  return (
                    <div key={key} className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${day.open ? colors.bg : 'bg-gray-50'}`}>
                      <button
                        type="button"
                        onClick={() => toggleDay(key)}
                        className={`flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          day.open ? `${colors.checkOn} border-transparent` : 'border-gray-300 bg-white'
                        }`}
                      >
                        {day.open && <CheckCircle className="w-3 h-3 text-white" />}
                      </button>
                      <span className={`w-28 text-sm font-medium ${day.open ? colors.text : 'text-gray-500'}`}>
                        {DAYS[idx]}
                      </span>
                      {day.open ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="time"
                            value={day.from}
                            onChange={(e) => updateDayTime(key, 'from', e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 w-28"
                          />
                          <span className="text-gray-400 text-sm">–</span>
                          <input
                            type="time"
                            value={day.to}
                            onChange={(e) => updateDayTime(key, 'to', e.target.value)}
                            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-1 focus:ring-gray-400 w-28"
                          />
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400 italic">Nedirbame</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Public contact info for the place */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Globe className="w-4 h-4 text-gray-400" />
              {selectedCategory.value === 'event' ? 'Renginio kontaktai' : 'Vietos kontaktai'}
            </h2>
            <p className="text-xs text-gray-500">
              {selectedCategory.value === 'event'
                ? 'Renginio viešieji kontaktai — bus matomi lankytojams.'
                : 'Vietos viešieji kontaktai (pvz. info@restoranas.lt, +370 600 12345) — bus matomi lankytojams skelbime.'}
            </p>

            {selectedCategory.value === 'event' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Organizatorius / Įstaiga
                </label>
                <input
                  type="text"
                  name="organizer_name"
                  value={form.organizer_name}
                  onChange={handleChange}
                  placeholder="Organizatoriaus pavadinimas"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                />
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> El. paštas (viešas)
                </label>
                <input
                  type="email"
                  name="contact_email"
                  value={form.contact_email}
                  onChange={handleChange}
                  placeholder="info@example.lt"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Telefonas (viešas)
                </label>
                <input
                  type="tel"
                  name="contact_phone"
                  value={form.contact_phone}
                  onChange={handleChange}
                  placeholder="+370 600 00000"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5" /> Svetainė
              </label>
              <input
                type="text"
                name="contact_website"
                value={form.contact_website}
                onChange={handleChange}
                placeholder="www.example.lt"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
              />
            </div>
          </div>

          {/* Submitter contact — private, only for admin */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Phone className="w-4 h-4 text-gray-400" />
              Jūsų kontaktai
            </h2>
            <div className="flex items-start gap-2 p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-600">
              <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
              <span>
                Šie kontaktai <strong>nebus matomi lankytojams</strong> — naudojami tik susisiekti su Jumis dėl pateikto skelbimo (papildomų klausimų ar patvirtinimo).
              </span>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Vardas (neprivaloma)
              </label>
              <input
                type="text"
                name="submitter_name"
                value={form.submitter_name}
                onChange={handleChange}
                placeholder="Jūsų vardas"
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5" /> El. paštas <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="submitter_email"
                  value={form.submitter_email}
                  onChange={handleChange}
                  placeholder="jusu@pastas.lt"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5" /> Telefonas <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="submitter_phone"
                  value={form.submitter_phone}
                  onChange={handleChange}
                  placeholder="+370 600 00000"
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-amber-600 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Reikalingas bent el. paštas arba telefonas
            </p>
          </div>

          {/* Tags */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-4">
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <Tag className="w-4 h-4 text-gray-400" />
              Žymos ir savybės
            </h2>
            <p className="text-xs text-gray-400">Pasirinkite tinkamas žymas — jos padeda lankytojams rasti jūsų vietą. Galite pasirinkti iki 15.</p>

            <div className="flex flex-wrap gap-2">
              {selectedCategory.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => form.features.includes(tag) ? removeTag(tag) : addTag(tag)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    form.features.includes(tag) ? colors.tagSelected : colors.tag
                  }`}
                >
                  {tag}
                </button>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagKeyDown}
                placeholder="Pridėti savo žymą..."
                className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
              />
              <button
                type="button"
                onClick={() => addTag(tagInput)}
                disabled={!tagInput.trim()}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-medium transition-colors disabled:opacity-40"
              >
                Pridėti
              </button>
            </div>

            {form.features.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-100">
                <span className="text-xs text-gray-400 w-full">Pasirinkta:</span>
                {form.features.map((tag) => (
                  <span
                    key={tag}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${colors.tagSelected}`}
                  >
                    {tag}
                    <button type="button" onClick={() => removeTag(tag)} className="hover:opacity-70">
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Honeypot */}
          <input type="text" name="honeypot" value={form.honeypot} onChange={handleChange} className="hidden" tabIndex={-1} autoComplete="off" />

          <button
            type="submit"
            disabled={submitting || uploading}
            className={`w-full py-4 rounded-2xl font-semibold text-white text-base transition-all ${colors.button} disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3`}
          >
            {submitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Siunčiama...
              </>
            ) : (
              <>
                <CheckCircle className="w-5 h-5" />
                Pateikti peržiūrai
              </>
            )}
          </button>

          <p className="text-center text-xs text-gray-400 pb-4">
            Pateikę formą sutinkate, kad informacija bus peržiūrėta ir gali būti paskelbta platformoje.
          </p>
        </form>
      </div>
    </div>
  );
};

export default SubmitListingPage;
