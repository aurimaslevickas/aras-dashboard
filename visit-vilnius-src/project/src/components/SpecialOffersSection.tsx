import React from 'react';
import { Tag, Clock, Users, Gift } from 'lucide-react';

const SpecialOffersSection = () => {
  const offers = [
    {
      id: 1,
      title: '2-for-1 Cocktails Tonight',
      business: 'Skybar Vilnius',
      discount: '50% OFF',
      validUntil: 'Tonight Only',
      description: 'Premium cocktails with panoramic city views',
      image: 'https://images.pexels.com/photos/338713/pexels-photo-338713.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
      category: 'Nightlife',
      urgent: true
    },
    {
      id: 2,
      title: 'Discounted Spa Day',
      business: 'Wellness Center',
      discount: '30% OFF',
      validUntil: 'This Weekend',
      description: 'Full body massage and wellness treatments',
      image: 'https://images.pexels.com/photos/3757952/pexels-photo-3757952.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
      category: 'Wellness',
      urgent: false
    },
    {
      id: 3,
      title: 'Old Town Walking Tour',
      business: 'Vilnius Tours',
      discount: 'FREE Guide',
      validUntil: 'All Week',
      description: 'Professional guide included with any tour booking',
      image: 'https://images.pexels.com/photos/13848681/pexels-photo-13848681.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
      category: 'Tours',
      urgent: false
    },
    {
      id: 4,
      title: 'Lithuanian Cooking Class',
      business: 'Culinary Studio',
      discount: '25% OFF',
      validUntil: 'Limited Spots',
      description: 'Learn traditional recipes with local chef',
      image: 'https://images.pexels.com/photos/4259140/pexels-photo-4259140.jpeg?auto=compress&cs=tinysrgb&w=600&h=400&fit=crop',
      category: 'Experience',
      urgent: true
    }
  ];

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Nightlife': return '🍹';
      case 'Wellness': return '🧘';
      case 'Tours': return '🚶';
      case 'Experience': return '👨‍🍳';
      default: return '🎁';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Nightlife': return 'bg-purple-100 text-purple-800';
      case 'Wellness': return 'bg-green-100 text-green-800';
      case 'Tours': return 'bg-blue-100 text-blue-800';
      case 'Experience': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <section className="py-16 bg-gradient-to-br from-red-50 to-pink-50">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="p-3 bg-red-500 rounded-full">
              <Gift className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              Special Offers
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Exclusive deals and promotions available only to VisitVilnius.lt visitors
          </p>
        </div>

        {/* Offers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {offers.map((offer) => (
            <div 
              key={offer.id}
              className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group cursor-pointer relative"
            >
              {/* Urgent Badge */}
              {offer.urgent && (
                <div className="absolute top-4 left-4 z-10 bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                  LIMITED TIME
                </div>
              )}

              {/* Discount Badge */}
              <div className="absolute top-4 right-4 z-10 bg-yellow-400 text-yellow-900 px-3 py-2 rounded-full font-bold text-lg shadow-lg">
                {offer.discount}
              </div>

              {/* Image */}
              <div className="relative h-40 overflow-hidden">
                <img
                  src={offer.image}
                  alt={offer.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold ${getCategoryColor(offer.category)}`}>
                    <span className="mr-1">{getCategoryIcon(offer.category)}</span>
                    {offer.category}
                  </span>
                  
                  <div className="flex items-center text-red-600 text-sm font-semibold">
                    <Clock className="w-3 h-3 mr-1" />
                    <span>{offer.validUntil}</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-red-600 transition-colors">
                  {offer.title}
                </h3>
                
                <p className="text-sm text-gray-500 mb-2">{offer.business}</p>
                
                <p className="text-gray-600 text-sm mb-4 leading-relaxed">
                  {offer.description}
                </p>

                <button className="w-full bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white py-3 rounded-full font-semibold transition-all duration-300 flex items-center justify-center space-x-2">
                  <Tag className="w-4 h-4" />
                  <span>Claim Offer</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Business Partnership CTA */}
        <div className="bg-gradient-to-r from-red-600 to-pink-600 rounded-2xl p-8 text-center text-white">
          <h3 className="text-2xl font-bold mb-4">Boost Your Business with Special Offers</h3>
          <p className="text-red-100 mb-6 max-w-2xl mx-auto">
            Attract more customers by featuring your exclusive deals on VisitVilnius.lt and reaching thousands of potential visitors
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-red-600 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center space-x-2">
              <Users className="w-4 h-4" />
              <span>List Your Offer</span>
            </button>
            <button className="bg-red-700 text-white px-8 py-3 rounded-full font-semibold hover:bg-red-800 transition-colors">
              Learn More
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default SpecialOffersSection;