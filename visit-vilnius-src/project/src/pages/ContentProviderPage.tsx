import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Save, Upload, ArrowUp, ArrowDown, Trash2, Plus, Image, Calendar, User, Building } from 'lucide-react';

const ContentProviderPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [userRole, setUserRole] = useState('');
  const [businessName, setBusinessName] = useState('');

  // Mock content providers
  const contentProviders = {
    'lokys': {
      password: 'lokys2024',
      role: 'restaurant',
      businessName: 'Lokys Restaurant',
      permissions: ['restaurant-1']
    },
    'kempinski': {
      password: 'kempinski2024', 
      role: 'hotel',
      businessName: 'Grand Hotel Kempinski',
      permissions: ['hotel-1']
    },
    'gediminas': {
      password: 'gediminas2024',
      role: 'attraction',
      businessName: 'Gedimino pilies bokštas',
      permissions: ['attraction-1']
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const provider = contentProviders[username as keyof typeof contentProviders];
    
    if (provider && password === provider.password) {
      setIsLoggedIn(true);
      setUserRole(provider.role);
      setBusinessName(provider.businessName);
      setLoginError('');
      localStorage.setItem('providerLoggedIn', username);
    } else {
      setLoginError('Neteisingi prisijungimo duomenys');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole('');
    setBusinessName('');
    localStorage.removeItem('providerLoggedIn');
    setUsername('');
    setPassword('');
  };

  useEffect(() => {
    const savedLogin = localStorage.getItem('providerLoggedIn');
    if (savedLogin && contentProviders[savedLogin as keyof typeof contentProviders]) {
      const provider = contentProviders[savedLogin as keyof typeof contentProviders];
      setIsLoggedIn(true);
      setUsername(savedLogin);
      setUserRole(provider.role);
      setBusinessName(provider.businessName);
    }
  }, []);

  // Mock business data based on role
  const [businessData, setBusinessData] = useState({
    name: '',
    description: '',
    images: [''],
    location: '',
    phone: '',
    website: '',
    openingHours: {},
    features: [''],
    specialties: ['']
  });

  useEffect(() => {
    if (isLoggedIn) {
      // Load business data based on role
      if (userRole === 'restaurant') {
        setBusinessData({
          name: 'Lokys Restaurant',
          description: 'Istorinis rūsio restoranas, teikiantis autentišką lietuvišką virtuvę nuo 1975 m.',
          images: [
            'https://images.pexels.com/photos/262978/pexels-photo-262978.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
            'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
          ],
          location: 'Stiklių g. 8, Vilnius',
          phone: '+370 5 262 9046',
          website: 'www.lokys.lt',
          openingHours: {
            'Pirmadienis-Ketvirtadienis': '12:00-23:00',
            'Penktadienis-Šeštadienis': '12:00-24:00'
          },
          features: ['Gotikinis rūsio interjeras', 'Žvėrienos specialybės'],
          specialties: ['Elnienai su spanguolių padažu', 'Cepelinai su spirgučiais']
        });
      }
    }
  }, [isLoggedIn, userRole]);

  const updateField = (field: string, value: any) => {
    setBusinessData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addArrayItem = (field: string) => {
    setBusinessData(prev => ({
      ...prev,
      [field]: [...prev[field as keyof typeof prev] as string[], '']
    }));
  };

  const updateArrayItem = (field: string, index: number, value: string) => {
    setBusinessData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).map((item, i) => 
        i === index ? value : item
      )
    }));
  };

  const removeArrayItem = (field: string, index: number) => {
    setBusinessData(prev => ({
      ...prev,
      [field]: (prev[field as keyof typeof prev] as string[]).filter((_, i) => i !== index)
    }));
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="p-4 bg-green-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Building className="w-8 h-8 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Turinio tiekėjo prisijungimas</h1>
            <p className="text-gray-600">Valdykite savo verslo informaciją</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Vartotojo vardas
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                placeholder="Įveskite vartotojo vardą"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Slaptažodis
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500 pr-12"
                  placeholder="Įveskite slaptažodį"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {loginError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Prisijungti
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center mb-2">
              Demo prisijungimo duomenys:
            </p>
            <div className="text-xs text-gray-600 space-y-1">
              <div><strong>Restoranas:</strong> lokys / lokys2024</div>
              <div><strong>Viešbutis:</strong> kempinski / kempinski2024</div>
              <div><strong>Atrakcija:</strong> gediminas / gediminas2024</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-full">
                <Building className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">{businessName}</h1>
                <p className="text-sm text-gray-600 capitalize">{userRole} valdymo skydas</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Atsijungti
            </button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Verslo informacijos redagavimas</h2>

          <div className="space-y-8">
            {/* Basic Info */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Pagrindinė informacija</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Pavadinimas
                  </label>
                  <input
                    type="text"
                    value={businessData.name}
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vieta
                  </label>
                  <input
                    type="text"
                    value={businessData.location}
                    onChange={(e) => updateField('location', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Telefonas
                  </label>
                  <input
                    type="text"
                    value={businessData.phone}
                    onChange={(e) => updateField('phone', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Svetainė
                  </label>
                  <input
                    type="text"
                    value={businessData.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aprašymas
                </label>
                <textarea
                  value={businessData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                />
              </div>
            </div>

            {/* Images */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Nuotraukos</h3>
                <button
                  onClick={() => addArrayItem('images')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Pridėti nuotrauką</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {businessData.images.map((image, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="url"
                      value={image}
                      onChange={(e) => updateArrayItem('images', index, e.target.value)}
                      placeholder="Nuotraukos URL"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                    />
                    {image && (
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                    )}
                    <button
                      onClick={() => removeArrayItem('images', index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Ypatybės</h3>
                <button
                  onClick={() => addArrayItem('features')}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Pridėti ypatybę</span>
                </button>
              </div>
              
              <div className="space-y-3">
                {businessData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateArrayItem('features', index, e.target.value)}
                      placeholder="Ypatybė"
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                    />
                    <button
                      onClick={() => removeArrayItem('features', index)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Specialties (for restaurants) */}
            {userRole === 'restaurant' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Specialybės</h3>
                  <button
                    onClick={() => addArrayItem('specialties')}
                    className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Pridėti specialybę</span>
                  </button>
                </div>
                
                <div className="space-y-3">
                  {businessData.specialties.map((specialty, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <input
                        type="text"
                        value={specialty}
                        onChange={(e) => updateArrayItem('specialties', index, e.target.value)}
                        placeholder="Specialybė"
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-green-500"
                      />
                      <button
                        onClick={() => removeArrayItem('specialties', index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save Button */}
            <div className="flex justify-end pt-6 border-t">
              <button className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2">
                <Save className="w-5 h-5" />
                <span>Išsaugoti pakeitimus</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContentProviderPage;