export interface SchemaListing {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  location: string;
  price_range?: string;
  rating?: number;
  image_url: string;
  contact_info?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  opening_hours?: Record<string, string>;
  features?: string[];
}

export const generateRestaurantSchema = (restaurant: SchemaListing) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: restaurant.name,
    description: restaurant.description,
    image: restaurant.image_url,
    address: {
      '@type': 'PostalAddress',
      streetAddress: restaurant.location,
      addressLocality: 'Vilnius',
      addressCountry: 'LT',
    },
    ...(restaurant.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: restaurant.rating,
        bestRating: '5',
        worstRating: '1',
      },
    }),
    ...(restaurant.price_range && {
      priceRange: restaurant.price_range,
    }),
    ...(restaurant.contact_info?.phone && {
      telephone: restaurant.contact_info.phone,
    }),
    ...(restaurant.contact_info?.website && {
      url: restaurant.contact_info.website,
    }),
    ...(restaurant.opening_hours && Object.keys(restaurant.opening_hours).length > 0 && {
      openingHoursSpecification: Object.entries(restaurant.opening_hours).map(([day, hours]) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: translateDayToEnglish(day),
        opens: hours.toString().split('-')[0]?.trim() || '00:00',
        closes: hours.toString().split('-')[1]?.trim() || '23:59',
      })),
    }),
    servesCuisine: 'Lithuanian',
    acceptsReservations: 'True',
  };

  return schema;
};

export const generateHotelSchema = (hotel: SchemaListing) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Hotel',
    name: hotel.name,
    description: hotel.description,
    image: hotel.image_url,
    address: {
      '@type': 'PostalAddress',
      streetAddress: hotel.location,
      addressLocality: 'Vilnius',
      addressCountry: 'LT',
    },
    ...(hotel.rating && {
      starRating: {
        '@type': 'Rating',
        ratingValue: hotel.rating,
      },
    }),
    ...(hotel.price_range && {
      priceRange: hotel.price_range,
    }),
    ...(hotel.contact_info?.phone && {
      telephone: hotel.contact_info.phone,
    }),
    ...(hotel.contact_info?.website && {
      url: hotel.contact_info.website,
    }),
    ...(hotel.features && hotel.features.length > 0 && {
      amenityFeature: hotel.features.map(feature => ({
        '@type': 'LocationFeatureSpecification',
        name: feature,
      })),
    }),
    ...(hotel.opening_hours && Object.keys(hotel.opening_hours).length > 0 && {
      openingHoursSpecification: Object.entries(hotel.opening_hours).map(([day, hours]) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: translateDayToEnglish(day),
        opens: hours.toString().split('-')[0]?.trim() || '00:00',
        closes: hours.toString().split('-')[1]?.trim() || '23:59',
      })),
    }),
  };

  return schema;
};

export const generateAttractionSchema = (attraction: SchemaListing) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'TouristAttraction',
    name: attraction.name,
    description: attraction.description,
    image: attraction.image_url,
    address: {
      '@type': 'PostalAddress',
      streetAddress: attraction.location,
      addressLocality: 'Vilnius',
      addressCountry: 'LT',
    },
    ...(attraction.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: attraction.rating,
        bestRating: '5',
        worstRating: '1',
      },
    }),
    ...(attraction.contact_info?.phone && {
      telephone: attraction.contact_info.phone,
    }),
    ...(attraction.contact_info?.website && {
      url: attraction.contact_info.website,
    }),
    ...(attraction.opening_hours && Object.keys(attraction.opening_hours).length > 0 && {
      openingHoursSpecification: Object.entries(attraction.opening_hours).map(([day, hours]) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: translateDayToEnglish(day),
        opens: hours.toString().split('-')[0]?.trim() || '00:00',
        closes: hours.toString().split('-')[1]?.trim() || '23:59',
      })),
    }),
    touristType: 'International and domestic tourists',
    isAccessibleForFree: attraction.price_range === 'Nemokama' ? 'True' : 'False',
  };

  return schema;
};

export const generateStoreSchema = (store: SchemaListing) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: store.name,
    description: store.description,
    image: store.image_url,
    address: {
      '@type': 'PostalAddress',
      streetAddress: store.location,
      addressLocality: 'Vilnius',
      addressCountry: 'LT',
    },
    ...(store.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: store.rating,
        bestRating: '5',
        worstRating: '1',
      },
    }),
    ...(store.price_range && {
      priceRange: store.price_range,
    }),
    ...(store.contact_info?.phone && {
      telephone: store.contact_info.phone,
    }),
    ...(store.contact_info?.website && {
      url: store.contact_info.website,
    }),
    ...(store.opening_hours && Object.keys(store.opening_hours).length > 0 && {
      openingHoursSpecification: Object.entries(store.opening_hours).map(([day, hours]) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: translateDayToEnglish(day),
        opens: hours.toString().split('-')[0]?.trim() || '00:00',
        closes: hours.toString().split('-')[1]?.trim() || '23:59',
      })),
    }),
  };

  return schema;
};

export const generateBarSchema = (bar: SchemaListing) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BarOrPub',
    name: bar.name,
    description: bar.description,
    image: bar.image_url,
    address: {
      '@type': 'PostalAddress',
      streetAddress: bar.location,
      addressLocality: 'Vilnius',
      addressCountry: 'LT',
    },
    ...(bar.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: bar.rating,
        bestRating: '5',
        worstRating: '1',
      },
    }),
    ...(bar.price_range && {
      priceRange: bar.price_range,
    }),
    ...(bar.contact_info?.phone && {
      telephone: bar.contact_info.phone,
    }),
    ...(bar.contact_info?.website && {
      url: bar.contact_info.website,
    }),
    ...(bar.opening_hours && Object.keys(bar.opening_hours).length > 0 && {
      openingHoursSpecification: Object.entries(bar.opening_hours).map(([day, hours]) => ({
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: translateDayToEnglish(day),
        opens: hours.toString().split('-')[0]?.trim() || '00:00',
        closes: hours.toString().split('-')[1]?.trim() || '23:59',
      })),
    }),
  };

  return schema;
};

const translateDayToEnglish = (lithuanianDay: string): string => {
  const dayMap: Record<string, string> = {
    'Pirmadienis': 'Monday',
    'Antradienis': 'Tuesday',
    'Trečiadienis': 'Wednesday',
    'Ketvirtadienis': 'Thursday',
    'Penktadienis': 'Friday',
    'Šeštadienis': 'Saturday',
    'Sekmadienis': 'Sunday',
  };

  return dayMap[lithuanianDay] || lithuanianDay;
};

export const generateBreadcrumbSchema = (items: Array<{ name: string; url: string }>) => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
};
