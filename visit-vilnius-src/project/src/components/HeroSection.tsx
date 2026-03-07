import React from 'react';
import { MapPin } from 'lucide-react';
import AITripPlannerModal from './AITripPlannerModal';

const HeroSection = () => {
  const [isPlanningModalOpen, setIsPlanningModalOpen] = React.useState(false);

  return (
    <>
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/13848685/pexels-photo-13848685.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280&fit=crop)'
        }}
      />

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
          Welcome to
          <span className="block text-yellow-400">Vilnius</span>
        </h1>

        <p className="text-xl md:text-2xl mb-10 text-gray-100 max-w-3xl mx-auto leading-relaxed">
          Let AI create your perfect itinerary for Lithuania's historic capital
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => setIsPlanningModalOpen(true)}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 rounded-full text-xl font-bold transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-3 shadow-2xl"
          >
            <MapPin className="w-6 h-6" />
            <span>Plan a Trip</span>
          </button>
        </div>
      </div>
      </section>

      <AITripPlannerModal
        isOpen={isPlanningModalOpen}
        onClose={() => setIsPlanningModalOpen(false)}
      />
    </>
  );
};

export default HeroSection;