import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, Save, Upload, ArrowUp, ArrowDown, Trash2, Plus, Image, Calendar } from 'lucide-react';

const AdminPage = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('hero');
  const [loginError, setLoginError] = useState('');

  // Mock admin credentials (in real app, this would be handled by backend)
  const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'visitvilnius2024'
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
      setIsLoggedIn(true);
      setLoginError('');
      localStorage.setItem('adminLoggedIn', 'true');
    } else {
      setLoginError('Neteisingi prisijungimo duomenys');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    localStorage.removeItem('adminLoggedIn');
    setUsername('');
    setPassword('');
  };

  useEffect(() => {
    const savedLogin = localStorage.getItem('adminLoggedIn');
    if (savedLogin === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  // Seasonal hero images
  const [heroImages, setHeroImages] = useState([
    {
      id: 1,
      season: 'Pavasaris',
      title: 'Pavasaris Vilniuje',
      description: 'Žydintys medžiai ir Gedimino kalnas',
      image: 'https://images.pexels.com/photos/3844796/pexels-photo-3844796.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&fit=crop',
      months: [3, 4, 5],
      active: false
    },
    {
      id: 2,
      season: 'Vasara',
      title: 'Vasara Vilniuje',
      description: 'Neris upė ir laivai',
      image: 'https://images.pexels.com/photos/13848685/pexels-photo-13848685.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&fit=crop',
      months: [6, 7, 8],
      active: true
    },
    {
      id: 3,
      season: 'Ruduo',
      title: 'Ruduo Vilniuje',
      description: 'Auksiniai lapai ir Senamiestis',
      image: 'https://images.pexels.com/photos/1190298/pexels-photo-1190298.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&fit=crop',
      months: [9, 10, 11],
      active: false
    },
    {
      id: 4,
      season: 'Žiema',
      title: 'Žiema Vilniuje',
      description: 'Sniego dengtas Senamiestis',
      image: 'https://images.pexels.com/photos/13848688/pexels-photo-13848688.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&fit=crop',
      months: [12, 1, 2],
      active: false
    }
  ]);

  // Sample content data
  const [attractions, setAttractions] = useState([
    {
      id: 1,
      name: 'Gedimino pilies bokštas',
      description: 'Vilniaus simbolis su panoraminiais miesto vaizdais',
      image: 'https://images.pexels.com/photos/13848685/pexels-photo-13848685.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      order: 1,
      featured: true
    },
    {
      id: 2,
      name: 'Vilniaus katedra',
      description: 'Neoklasicistinė katedra Senamiesčio širdyje',
      image: 'https://images.pexels.com/photos/13848688/pexels-photo-13848688.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      order: 2,
      featured: true
    },
    {
      id: 3,
      name: 'Užupis',
      description: 'Bohemiška respublika su sava konstitucija',
      image: 'https://images.pexels.com/photos/13848681/pexels-photo-13848681.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
      order: 3,
      featured: false
    }
  ]);

  const getCurrentSeason = () => {
    const month = new Date().getMonth() + 1;
    return heroImages.find(img => img.months.includes(month)) || heroImages[1];
  };

  const setActiveHeroImage = (imageId: number) => {
    setHeroImages(prev => prev.map(img => ({
      ...img,
      active: img.id === imageId
    })));
  };

  const moveItem = (items: any[], setItems: any, id: number, direction: 'up' | 'down') => {
    const currentIndex = items.findIndex(item => item.id === id);
    if (
      (direction === 'up' && currentIndex === 0) ||
      (direction === 'down' && currentIndex === items.length - 1)
    ) {
      return;
    }

    const newItems = [...items];
    const targetIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    [newItems[currentIndex], newItems[targetIndex]] = [newItems[targetIndex], newItems[currentIndex]];
    
    // Update order values
    newItems.forEach((item, index) => {
      item.order = index + 1;
    });
    
    setItems(newItems);
  };

  const updateItem = (items: any[], setItems: any, id: number, field: string, value: any) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
          <div className="text-center mb-8">
            <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Lock className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Admin prisijungimas</h1>
            <p className="text-gray-600">Prisijunkite prie turinio valdymo sistemos</p>
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
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
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 pr-12"
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
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold transition-colors"
            >
              Prisijungti
            </button>
          </form>

          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              Demo prisijungimo duomenys:<br />
              <strong>Vartotojas:</strong> admin<br />
              <strong>Slaptažodis:</strong> visitvilnius2024
            </p>
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
            <h1 className="text-2xl font-bold text-gray-900">Admin valdymo skydas</h1>
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
        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-8">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'hero', label: 'Hero sekcija', icon: Image },
                { id: 'attractions', label: 'Lankytinos vietos', icon: Eye },
                { id: 'events', label: 'Renginiai', icon: Calendar }
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Hero Images Management */}
        {activeTab === 'hero' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Sezoniniai hero paveikslėliai</h2>
              <div className="text-sm text-gray-600">
                Dabartinis sezonas: <strong>{getCurrentSeason().season}</strong>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {heroImages.map((heroImage) => (
                <div key={heroImage.id} className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="relative h-48">
                    <img
                      src={heroImage.image}
                      alt={heroImage.title}
                      className="w-full h-full object-cover"
                    />
                    {heroImage.active && (
                      <div className="absolute top-4 right-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                        Aktyvus
                      </div>
                    )}
                  </div>
                  
                  <div className="p-4">
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Pavadinimas
                      </label>
                      <input
                        type="text"
                        value={heroImage.title}
                        onChange={(e) => updateItem(heroImages, setHeroImages, heroImage.id, 'title', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Aprašymas
                      </label>
                      <textarea
                        value={heroImage.description}
                        onChange={(e) => updateItem(heroImages, setHeroImages, heroImage.id, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                        rows={2}
                      />
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Paveikslėlio URL
                      </label>
                      <input
                        type="url"
                        value={heroImage.image}
                        onChange={(e) => updateItem(heroImages, setHeroImages, heroImage.id, 'image', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="text-sm text-gray-600">
                        Mėnesiai: {heroImage.months.join(', ')}
                      </div>
                      <button
                        onClick={() => setActiveHeroImage(heroImage.id)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                          heroImage.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-blue-600 hover:bg-blue-700 text-white'
                        }`}
                        disabled={heroImage.active}
                      >
                        {heroImage.active ? 'Aktyvus' : 'Aktyvuoti'}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Išsaugoti pakeitimus</span>
              </button>
            </div>
          </div>
        )}

        {/* Attractions Management */}
        {activeTab === 'attractions' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Lankytinos vietos</h2>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Pridėti naują</span>
              </button>
            </div>

            <div className="space-y-4">
              {attractions.map((attraction, index) => (
                <div key={attraction.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start space-x-4">
                    <img
                      src={attraction.image}
                      alt={attraction.name}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    
                    <div className="flex-1 space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Pavadinimas
                          </label>
                          <input
                            type="text"
                            value={attraction.name}
                            onChange={(e) => updateItem(attractions, setAttractions, attraction.id, 'name', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Paveikslėlio URL
                          </label>
                          <input
                            type="url"
                            value={attraction.image}
                            onChange={(e) => updateItem(attractions, setAttractions, attraction.id, 'image', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          />
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Aprašymas
                        </label>
                        <textarea
                          value={attraction.description}
                          onChange={(e) => updateItem(attractions, setAttractions, attraction.id, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                          rows={2}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col space-y-2">
                      <button
                        onClick={() => moveItem(attractions, setAttractions, attraction.id, 'up')}
                        disabled={index === 0}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => moveItem(attractions, setAttractions, attraction.id, 'down')}
                        disabled={index === attractions.length - 1}
                        className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      
                      <button className="p-2 text-red-400 hover:text-red-600">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between">
                    <label className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={attraction.featured}
                        onChange={(e) => updateItem(attractions, setAttractions, attraction.id, 'featured', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Rekomenduojama</span>
                    </label>
                    
                    <div className="text-sm text-gray-500">
                      Pozicija: {attraction.order}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex justify-end">
              <button className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2">
                <Save className="w-4 h-4" />
                <span>Išsaugoti pakeitimus</span>
              </button>
            </div>
          </div>
        )}

        {/* Events tab placeholder */}
        {activeTab === 'events' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Renginių valdymas</h2>
            <p className="text-gray-600">Renginių valdymo funkcionalumas bus pridėtas netrukus...</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPage;