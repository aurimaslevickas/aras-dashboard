import React, { useState } from 'react';
import { Brain, Clock, Heart, Utensils, TreePine, Music, ShoppingBag, Sparkles } from 'lucide-react';

const AITripPlanner = () => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const interests = [
    { id: 'culture', name: 'Culture & History', icon: Heart, color: 'bg-red-500' },
    { id: 'food', name: 'Food & Drinks', icon: Utensils, color: 'bg-orange-500' },
    { id: 'nature', name: 'Nature & Parks', icon: TreePine, color: 'bg-green-500' },
    { id: 'nightlife', name: 'Nightlife', icon: Music, color: 'bg-purple-500' },
    { id: 'shopping', name: 'Shopping', icon: ShoppingBag, color: 'bg-blue-500' }
  ];

  const durations = ['1 day', '2 days', '3–5 days', '+5 days'];

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev => 
      prev.includes(interestId) 
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const generateItinerary = async () => {
    setIsGenerating(true);
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    
    // In a real app, this would trigger itinerary generation
    alert(`Generating personalized ${selectedDuration} itinerary with interests: ${selectedInterests.join(', ')}`);
  };

  return (
    <section className="py-16 bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <div className="p-3 bg-blue-600 rounded-full">
                <Brain className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                AI Trip Planner
              </h2>
            </div>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Tell us your interests and travel duration, and our AI will create a personalized Vilnius itinerary just for you
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            {/* Interests Selection */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                <Heart className="w-5 h-5 text-red-500" />
                <span>What interests you most?</span>
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {interests.map((interest) => {
                  const Icon = interest.icon;
                  const isSelected = selectedInterests.includes(interest.id);
                  
                  return (
                    <button
                      key={interest.id}
                      onClick={() => toggleInterest(interest.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50 shadow-md' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex flex-col items-center space-y-2">
                        <div className={`p-3 rounded-full ${interest.color} ${isSelected ? 'scale-110' : ''} transition-transform`}>
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <span className={`font-medium ${isSelected ? 'text-blue-900' : 'text-gray-700'}`}>
                          {interest.name}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Duration Selection */}
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                <Clock className="w-5 h-5 text-blue-500" />
                <span>How long is your visit?</span>
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {durations.map((duration) => (
                  <button
                    key={duration}
                    onClick={() => setSelectedDuration(duration)}
                    className={`p-4 rounded-xl border-2 font-medium transition-all duration-300 hover:scale-105 ${
                      selectedDuration === duration 
                        ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md' 
                        : 'border-gray-200 text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {duration}
                  </button>
                ))}
              </div>
            </div>

            {/* Generate Button */}
            <div className="text-center">
              <button
                onClick={generateItinerary}
                disabled={selectedInterests.length === 0 || !selectedDuration || isGenerating}
                className={`px-12 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 flex items-center space-x-3 mx-auto ${
                  selectedInterests.length > 0 && selectedDuration && !isGenerating
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                    <span>Generating Magic...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" />
                    <span>Create My Itinerary</span>
                  </>
                )}
              </button>
              
              {(selectedInterests.length === 0 || !selectedDuration) && !isGenerating && (
                <p className="text-sm text-gray-500 mt-3">
                  Please select your interests and trip duration to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AITripPlanner;