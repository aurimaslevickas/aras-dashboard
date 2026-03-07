import React, { useState } from 'react';
import { Brain, Clock, Heart, Utensils, TreePine, Music, ShoppingBag, Sparkles, X } from 'lucide-react';

interface AITripPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AITripPlannerModal: React.FC<AITripPlannerModalProps> = ({ isOpen, onClose }) => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);
  const [selectedDuration, setSelectedDuration] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);

  const interests = [
    { id: 'culture', name: 'Culture', icon: Heart, color: 'bg-red-500' },
    { id: 'food', name: 'Food', icon: Utensils, color: 'bg-orange-500' },
    { id: 'nature', name: 'Nature', icon: TreePine, color: 'bg-green-500' },
    { id: 'nightlife', name: 'Nightlife', icon: Music, color: 'bg-purple-500' },
    { id: 'shopping', name: 'Shopping', icon: ShoppingBag, color: 'bg-blue-500' }
  ];

  const durations = ['1 day', '2 days', '3 days', '5+ days'];

  const toggleInterest = (interestId: string) => {
    setSelectedInterests(prev =>
      prev.includes(interestId)
        ? prev.filter(id => id !== interestId)
        : [...prev, interestId]
    );
  };

  const generateItinerary = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsGenerating(false);
    alert(`Creating ${selectedDuration} itinerary with: ${selectedInterests.join(', ')}`);
    handleClose();
  };

  const handleClose = () => {
    setSelectedInterests([]);
    setSelectedDuration('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={handleClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-purple-600 p-4 flex items-center justify-between z-10 rounded-t-2xl">
          <div className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-white" />
            <h2 className="text-lg font-bold text-white">AI Trip Planner</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-gray-600 text-sm mb-6">
            Select your interests and trip duration for a personalized itinerary
          </p>

          {/* Interests */}
          <div className="mb-6">
            <h3 className="text-base font-semibold mb-3 flex items-center space-x-2">
              <Heart className="w-4 h-4 text-red-500" />
              <span>What interests you?</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {interests.map((interest) => {
                const Icon = interest.icon;
                const isSelected = selectedInterests.includes(interest.id);

                return (
                  <button
                    key={interest.id}
                    onClick={() => toggleInterest(interest.id)}
                    className={`p-2.5 rounded-lg border-2 transition-all text-xs ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50 shadow'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex flex-col items-center space-y-1.5">
                      <div className={`p-1.5 rounded-full ${interest.color}`}>
                        <Icon className="w-3.5 h-3.5 text-white" />
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

          {/* Duration */}
          <div className="mb-6">
            <h3 className="text-base font-semibold mb-3 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>How long?</span>
            </h3>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {durations.map((duration) => (
                <button
                  key={duration}
                  onClick={() => setSelectedDuration(duration)}
                  className={`p-2.5 rounded-lg border-2 font-medium transition-all text-xs ${
                    selectedDuration === duration
                      ? 'border-blue-500 bg-blue-50 text-blue-900 shadow'
                      : 'border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {duration}
                </button>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={generateItinerary}
              disabled={selectedInterests.length === 0 || !selectedDuration || isGenerating}
              className={`flex-1 px-4 py-2.5 rounded-lg font-semibold transition-all flex items-center justify-center space-x-2 text-sm ${
                selectedInterests.length > 0 && selectedDuration && !isGenerating
                  ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Create Plan</span>
                </>
              )}
            </button>

            <button
              onClick={handleClose}
              className="px-4 py-2.5 rounded-lg font-semibold border border-gray-200 hover:bg-gray-50 transition-colors text-sm"
            >
              Cancel
            </button>
          </div>

          {(selectedInterests.length === 0 || !selectedDuration) && !isGenerating && (
            <p className="text-xs text-gray-500 mt-3 text-center">
              Select interests and duration to continue
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AITripPlannerModal;
