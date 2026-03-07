import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Lightbulb, ArrowLeft, ArrowRight } from 'lucide-react';

const DidYouKnowSection = () => {
  const { t } = useTranslation();
  const [currentFactIndex, setCurrentFactIndex] = useState(0);

  const facts = [
    {
      id: 1,
      titleKey: 'didYouKnow.fact1.title',
      factKey: 'didYouKnow.fact1.text',
      image: 'https://images.pexels.com/photos/5412011/pexels-photo-5412011.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
    },
    {
      id: 2,
      titleKey: 'didYouKnow.fact2.title',
      factKey: 'didYouKnow.fact2.text',
      image: 'https://images.pexels.com/photos/13848688/pexels-photo-13848688.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
    },
    {
      id: 3,
      titleKey: 'didYouKnow.fact3.title',
      factKey: 'didYouKnow.fact3.text',
      image: 'https://images.pexels.com/photos/13848685/pexels-photo-13848685.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
    },
    {
      id: 4,
      titleKey: 'didYouKnow.fact4.title',
      factKey: 'didYouKnow.fact4.text',
      image: 'https://images.pexels.com/photos/3844796/pexels-photo-3844796.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
    },
    {
      id: 5,
      titleKey: 'didYouKnow.fact5.title',
      factKey: 'didYouKnow.fact5.text',
      image: 'https://images.pexels.com/photos/2161449/pexels-photo-2161449.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
    }
  ];

  const nextFact = () => {
    setCurrentFactIndex((prev) => (prev + 1) % facts.length);
  };

  const prevFact = () => {
    setCurrentFactIndex((prev) => (prev - 1 + facts.length) % facts.length);
  };

  const currentFact = facts[currentFactIndex];

  return (
    <section className="py-12 bg-gradient-to-br from-yellow-50 to-orange-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-yellow-500 rounded-full">
              <Lightbulb className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
              {t('didYouKnow.title')}
            </h2>
          </div>
          <p className="text-gray-600">
            {t('didYouKnow.subtitle')}
          </p>
        </div>

        <div className="max-w-3xl mx-auto relative">
          <button
            onClick={prevFact}
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <button
            onClick={nextFact}
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-10 w-12 h-12 rounded-full bg-white shadow-lg border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
          >
            <ArrowRight className="w-6 h-6 text-gray-700" />
          </button>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="md:flex">
              <div className="md:w-2/5 relative h-48 md:h-64">
                <img
                  src={currentFact.image}
                  alt={t(currentFact.titleKey)}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
              </div>

              <div className="md:w-3/5 p-6 md:p-8 flex flex-col justify-center">
                <div className="mb-4">
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 mb-3">
                    {t(currentFact.titleKey)}
                  </h3>
                  <p className="text-gray-700 leading-relaxed">
                    {t(currentFact.factKey)}
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-500">
                    {currentFactIndex + 1} / {facts.length}
                  </div>
                  <div className="flex justify-center space-x-1">
                    {facts.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentFactIndex(index)}
                        className={`h-2 rounded-full transition-all ${
                          index === currentFactIndex
                            ? 'bg-yellow-500 w-6'
                            : 'bg-gray-300 hover:bg-gray-400 w-2'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DidYouKnowSection;
