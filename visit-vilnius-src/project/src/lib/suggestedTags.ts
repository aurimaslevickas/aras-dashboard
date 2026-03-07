export interface TagGroup {
  group: string;
  icon: string;
  color: string;
  tags: string[];
}

export const LISTING_TAG_GROUPS: TagGroup[] = [
  {
    group: 'Istorija ir paveldas',
    icon: '🏛',
    color: 'amber',
    tags: ['istorija', 'paveldas', 'muziejus', 'pilis', 'bažnyčia', 'katedra', 'senamiestis', 'architektūra'],
  },
  {
    group: 'Kultūra ir menas',
    icon: '🎨',
    color: 'rose',
    tags: ['kultūra', 'menas', 'galerija', 'teatras', 'muzika', 'kinas', 'paroda'],
  },
  {
    group: 'Gamta ir lauke',
    icon: '🌿',
    color: 'green',
    tags: ['gamta', 'parkas', 'miškas', 'upė', 'ežeras', 'lauke', 'žaluma', 'dviratis', 'žygiai'],
  },
  {
    group: 'Maistas ir gėrimai',
    icon: '🍽',
    color: 'orange',
    tags: ['maistas', 'restoranas', 'kavinė', 'pusryčiai', 'brunch', 'degustacija', 'picerija', 'vegetariška'],
  },
  {
    group: 'Naktinis gyvenimas',
    icon: '🎵',
    color: 'blue',
    tags: ['naktinis', 'baras', 'klubas', 'kokteiliai', 'live muzika', 'rooftop', 'jazz', 'vynas'],
  },
  {
    group: 'Apsipirkimas',
    icon: '🛍',
    color: 'pink',
    tags: ['apsipirkimas', 'turgus', 'dizainas', 'suvenyrais', 'antikvaras', 'rankdarbiai', 'mada'],
  },
  {
    group: 'Šeima ir vaikai',
    icon: '👨‍👩‍👧',
    color: 'teal',
    tags: ['šeima', 'vaikai', 'žaidimai', 'edukacija', 'interaktyvus'],
  },
  {
    group: 'Sveikata ir sportas',
    icon: '💪',
    color: 'lime',
    tags: ['sportas', 'sveikata', 'spa', 'joga', 'bėgimas', 'fitnesas'],
  },
];

export const EVENT_TAG_GROUPS: TagGroup[] = [
  {
    group: 'Kultūra ir menas',
    icon: '🎨',
    color: 'rose',
    tags: ['kultūra', 'menas', 'paroda', 'galerija', 'teatras', 'kinas', 'literatūra'],
  },
  {
    group: 'Muzika ir naktinis gyvenimas',
    icon: '🎵',
    color: 'blue',
    tags: ['koncertas', 'live muzika', 'festivalis', 'naktinis', 'klubas', 'jazz', 'elektronika'],
  },
  {
    group: 'Maistas ir gėrimai',
    icon: '🍽',
    color: 'orange',
    tags: ['maistas', 'degustacija', 'restoranas', 'vynas', 'alus', 'gastronominiai', 'turgus'],
  },
  {
    group: 'Istorija ir edukacija',
    icon: '🏛',
    color: 'amber',
    tags: ['istorija', 'paveldas', 'konferencija', 'dirbtuvės', 'paskaita', 'edukacija', 'ekskursija'],
  },
  {
    group: 'Sportas ir aktyvus laisvalaikis',
    icon: '⚽',
    color: 'green',
    tags: ['sportas', 'bėgimas', 'maratonas', 'dviračiai', 'lauke', 'gamta', 'žygiai'],
  },
  {
    group: 'Šeima ir vaikai',
    icon: '👨‍👩‍👧',
    color: 'teal',
    tags: ['šeima', 'vaikai', 'žaidimai', 'interaktyvus', 'nemokama'],
  },
  {
    group: 'Verslas ir profesionalai',
    icon: '💼',
    color: 'gray',
    tags: ['konferencija', 'networking', 'verslas', 'dirbtuvės', 'seminaras'],
  },
];

export interface FilterTag {
  value: string;
  label: string;
  description: string;
}

export interface CategoryFilterGroup {
  category: string;
  label: string;
  filters: FilterTag[];
}

export const CATEGORY_FILTER_TAGS: CategoryFilterGroup[] = [
  {
    category: 'attraction',
    label: 'Lankytinos vietos – filtravimo žymekliai',
    filters: [
      { value: 'bažnyčia', label: 'Bažnyčia / Katedra', description: 'Rodoma "Bažnyčios" filtre' },
      { value: 'katedra', label: 'Katedra', description: 'Rodoma "Bažnyčios" filtre' },
      { value: 'muziejus', label: 'Muziejus', description: 'Rodoma "Muziejai" filtre' },
      { value: 'galerija', label: 'Galerija', description: 'Rodoma "Muziejai" filtre' },
      { value: 'paroda', label: 'Paroda', description: 'Rodoma "Muziejai" filtre' },
      { value: 'apžvalgos', label: 'Apžvalgos aikštelė', description: 'Rodoma "Apžvalgos" filtre' },
      { value: 'bokštas', label: 'Bokštas', description: 'Rodoma "Apžvalgos" filtre' },
      { value: 'panorama', label: 'Panorama', description: 'Rodoma "Apžvalgos" filtre' },
      { value: 'parkas', label: 'Parkas', description: 'Rodoma "Parkai" filtre' },
      { value: 'gamta', label: 'Gamta', description: 'Rodoma "Parkai" filtre' },
      { value: 'žaluma', label: 'Žaluma / Sodas', description: 'Rodoma "Parkai" filtre' },
      { value: 'istorija', label: 'Istorija', description: 'Rodoma "Istoriniai" filtre' },
      { value: 'paveldas', label: 'Paveldas', description: 'Rodoma "Istoriniai" filtre' },
      { value: 'pilis', label: 'Pilis', description: 'Rodoma "Istoriniai" filtre' },
      { value: 'senamiestis', label: 'Senamiestis', description: 'Rodoma "Istoriniai" filtre' },
      { value: 'architektūra', label: 'Architektūra', description: 'Rodoma "Istoriniai" filtre' },
    ],
  },
  {
    category: 'bar',
    label: 'Barai – filtravimo žymekliai',
    filters: [
      { value: 'cocktail', label: 'Kokteilių baras', description: 'Rodoma "Kokteilių barai" filtre' },
      { value: 'craft_beer', label: 'Craft alus', description: 'Rodoma "Craft alus" filtre' },
      { value: 'wine', label: 'Vyno baras', description: 'Rodoma "Vyno barai" filtre' },
      { value: 'sports', label: 'Sporto baras', description: 'Rodoma "Sporto barai" filtre' },
      { value: 'rooftop', label: 'Rooftop baras', description: 'Rodoma "Rooftop" filtre' },
      { value: 'live_music', label: 'Gyva muzika', description: 'Rodoma "Gyva muzika" filtre' },
    ],
  },
  {
    category: 'restaurant',
    label: 'Restoranai – filtravimo žymekliai',
    filters: [
      { value: 'lietuviška', label: 'Lietuviška virtuvė', description: 'Rodoma "Lietuviška" filtre' },
      { value: 'fine_dining', label: 'Fine dining', description: 'Rodoma "Fine dining" filtre' },
      { value: 'vegetariška', label: 'Vegetariška / Veganiška', description: 'Rodoma "Vegetariška" filtre' },
      { value: 'terasa', label: 'Lauko terasa', description: 'Rodoma "Terasa" filtre' },
      { value: 'brunch', label: 'Brunch / Pusryčiai', description: 'Rodoma "Brunch" filtre' },
      { value: 'degustacija', label: 'Degustacinis meniu', description: 'Rodoma "Degustacija" filtre' },
    ],
  },
  {
    category: 'hotel',
    label: 'Viešbučiai – filtravimo žymekliai',
    filters: [
      { value: 'spa', label: 'SPA centras', description: 'Rodoma "SPA" filtre' },
      { value: 'boutique', label: 'Boutique viešbutis', description: 'Rodoma "Boutique" filtre' },
      { value: 'baseinas', label: 'Baseinas', description: 'Rodoma "Baseinas" filtre' },
      { value: 'konferencijos', label: 'Konferencijų salės', description: 'Rodoma "Konferencijos" filtre' },
      { value: 'restoranas_vh', label: 'Restoranas viešbutyje', description: 'Rodoma "Restoranas" filtre' },
    ],
  },
  {
    category: 'shop',
    label: 'Parduotuvės – filtravimo žymekliai',
    filters: [
      { value: 'suvenyrais', label: 'Suvenyrai', description: 'Rodoma "Suvenyrai" filtre' },
      { value: 'turgus', label: 'Turgus / Mugė', description: 'Rodoma "Turgus" filtre' },
      { value: 'rankdarbiai', label: 'Rankų darbai', description: 'Rodoma "Rankų darbai" filtre' },
      { value: 'dizainas', label: 'Dizainas / Mada', description: 'Rodoma "Dizainas" filtre' },
      { value: 'antikvaras', label: 'Antikvaras', description: 'Rodoma "Antikvaras" filtre' },
    ],
  },
];

export const TAG_TRANSLATIONS: Record<string, Record<string, string>> = {
  'baras': { lt: 'Baras', en: 'Bar', pl: 'Bar', de: 'Bar', ru: 'Бар', fr: 'Bar' },
  'naktinis': { lt: 'Naktinis', en: 'Nightlife', pl: 'Nocne życie', de: 'Nachtleben', ru: 'Ночная жизнь', fr: 'Vie nocturne' },
  'klubas': { lt: 'Klubas', en: 'Club', pl: 'Klub', de: 'Club', ru: 'Клуб', fr: 'Club' },
  'kokteiliai': { lt: 'Kokteiliai', en: 'Cocktails', pl: 'Koktajle', de: 'Cocktails', ru: 'Коктейли', fr: 'Cocktails' },
  'live muzika': { lt: 'Live muzika', en: 'Live Music', pl: 'Muzyka na żywo', de: 'Live-Musik', ru: 'Живая музыка', fr: 'Musique live' },
  'rooftop': { lt: 'Rooftop', en: 'Rooftop', pl: 'Rooftop', de: 'Dachterrasse', ru: 'Руфтоп', fr: 'Rooftop' },
  'jazz': { lt: 'Jazz', en: 'Jazz', pl: 'Jazz', de: 'Jazz', ru: 'Джаз', fr: 'Jazz' },
  'vynas': { lt: 'Vynas', en: 'Wine', pl: 'Wino', de: 'Wein', ru: 'Вино', fr: 'Vin' },
  'istorija': { lt: 'Istorija', en: 'History', pl: 'Historia', de: 'Geschichte', ru: 'История', fr: 'Histoire' },
  'paveldas': { lt: 'Paveldas', en: 'Heritage', pl: 'Dziedzictwo', de: 'Erbe', ru: 'Наследие', fr: 'Patrimoine' },
  'muziejus': { lt: 'Muziejus', en: 'Museum', pl: 'Muzeum', de: 'Museum', ru: 'Музей', fr: 'Musée' },
  'pilis': { lt: 'Pilis', en: 'Castle', pl: 'Zamek', de: 'Burg', ru: 'Замок', fr: 'Château' },
  'bažnyčia': { lt: 'Bažnyčia', en: 'Church', pl: 'Kościół', de: 'Kirche', ru: 'Церковь', fr: 'Église' },
  'katedra': { lt: 'Katedra', en: 'Cathedral', pl: 'Katedra', de: 'Kathedrale', ru: 'Кафедральный собор', fr: 'Cathédrale' },
  'senamiestis': { lt: 'Senamiestis', en: 'Old Town', pl: 'Stare Miasto', de: 'Altstadt', ru: 'Старый город', fr: 'Vieille ville' },
  'architektūra': { lt: 'Architektūra', en: 'Architecture', pl: 'Architektura', de: 'Architektur', ru: 'Архитектура', fr: 'Architecture' },
  'kultūra': { lt: 'Kultūra', en: 'Culture', pl: 'Kultura', de: 'Kultur', ru: 'Культура', fr: 'Culture' },
  'menas': { lt: 'Menas', en: 'Art', pl: 'Sztuka', de: 'Kunst', ru: 'Искусство', fr: 'Art' },
  'galerija': { lt: 'Galerija', en: 'Gallery', pl: 'Galeria', de: 'Galerie', ru: 'Галерея', fr: 'Galerie' },
  'teatras': { lt: 'Teatras', en: 'Theatre', pl: 'Teatr', de: 'Theater', ru: 'Театр', fr: 'Théâtre' },
  'muzika': { lt: 'Muzika', en: 'Music', pl: 'Muzyka', de: 'Musik', ru: 'Музыка', fr: 'Musique' },
  'kinas': { lt: 'Kinas', en: 'Cinema', pl: 'Kino', de: 'Kino', ru: 'Кино', fr: 'Cinéma' },
  'paroda': { lt: 'Paroda', en: 'Exhibition', pl: 'Wystawa', de: 'Ausstellung', ru: 'Выставка', fr: 'Exposition' },
  'gamta': { lt: 'Gamta', en: 'Nature', pl: 'Przyroda', de: 'Natur', ru: 'Природа', fr: 'Nature' },
  'parkas': { lt: 'Parkas', en: 'Park', pl: 'Park', de: 'Park', ru: 'Парк', fr: 'Parc' },
  'miškas': { lt: 'Miškas', en: 'Forest', pl: 'Las', de: 'Wald', ru: 'Лес', fr: 'Forêt' },
  'upė': { lt: 'Upė', en: 'River', pl: 'Rzeka', de: 'Fluss', ru: 'Река', fr: 'Rivière' },
  'ežeras': { lt: 'Ežeras', en: 'Lake', pl: 'Jezioro', de: 'See', ru: 'Озеро', fr: 'Lac' },
  'lauke': { lt: 'Lauke', en: 'Outdoors', pl: 'Na zewnątrz', de: 'Im Freien', ru: 'На улице', fr: 'Extérieur' },
  'žaluma': { lt: 'Žaluma', en: 'Green Space', pl: 'Zieleń', de: 'Grünfläche', ru: 'Зелёная зона', fr: 'Espace vert' },
  'dviratis': { lt: 'Dviratis', en: 'Cycling', pl: 'Rowerem', de: 'Radfahren', ru: 'Велосипед', fr: 'Vélo' },
  'žygiai': { lt: 'Žygiai', en: 'Hiking', pl: 'Wędrówki', de: 'Wandern', ru: 'Походы', fr: 'Randonnée' },
  'maistas': { lt: 'Maistas', en: 'Food', pl: 'Jedzenie', de: 'Essen', ru: 'Еда', fr: 'Nourriture' },
  'restoranas': { lt: 'Restoranas', en: 'Restaurant', pl: 'Restauracja', de: 'Restaurant', ru: 'Ресторан', fr: 'Restaurant' },
  'kavinė': { lt: 'Kavinė', en: 'Café', pl: 'Kawiarnia', de: 'Café', ru: 'Кафе', fr: 'Café' },
  'pusryčiai': { lt: 'Pusryčiai', en: 'Breakfast', pl: 'Śniadanie', de: 'Frühstück', ru: 'Завтрак', fr: 'Petit-déjeuner' },
  'brunch': { lt: 'Brunch', en: 'Brunch', pl: 'Brunch', de: 'Brunch', ru: 'Бранч', fr: 'Brunch' },
  'degustacija': { lt: 'Degustacija', en: 'Tasting', pl: 'Degustacja', de: 'Verkostung', ru: 'Дегустация', fr: 'Dégustation' },
  'picerija': { lt: 'Picerija', en: 'Pizzeria', pl: 'Pizzeria', de: 'Pizzeria', ru: 'Пиццерия', fr: 'Pizzeria' },
  'vegetariška': { lt: 'Vegetariška', en: 'Vegetarian', pl: 'Wegetariańska', de: 'Vegetarisch', ru: 'Вегетарианское', fr: 'Végétarien' },
  'apsipirkimas': { lt: 'Apsipirkimas', en: 'Shopping', pl: 'Zakupy', de: 'Einkaufen', ru: 'Шоппинг', fr: 'Shopping' },
  'turgus': { lt: 'Turgus', en: 'Market', pl: 'Targ', de: 'Markt', ru: 'Рынок', fr: 'Marché' },
  'dizainas': { lt: 'Dizainas', en: 'Design', pl: 'Design', de: 'Design', ru: 'Дизайн', fr: 'Design' },
  'suvenyrais': { lt: 'Suvenyrai', en: 'Souvenirs', pl: 'Pamiątki', de: 'Souvenirs', ru: 'Сувениры', fr: 'Souvenirs' },
  'antikvaras': { lt: 'Antikvaras', en: 'Antiques', pl: 'Antyki', de: 'Antiquitäten', ru: 'Антиквариат', fr: 'Antiquités' },
  'rankdarbiai': { lt: 'Rankdarbiai', en: 'Handicrafts', pl: 'Rękodzieło', de: 'Kunsthandwerk', ru: 'Ремесло', fr: 'Artisanat' },
  'mada': { lt: 'Mada', en: 'Fashion', pl: 'Moda', de: 'Mode', ru: 'Мода', fr: 'Mode' },
  'šeima': { lt: 'Šeima', en: 'Family', pl: 'Rodzina', de: 'Familie', ru: 'Семья', fr: 'Famille' },
  'vaikai': { lt: 'Vaikams', en: 'Kid-friendly', pl: 'Dla dzieci', de: 'Kinderfreundlich', ru: 'Для детей', fr: 'Enfants' },
  'žaidimai': { lt: 'Žaidimai', en: 'Games', pl: 'Gry', de: 'Spiele', ru: 'Игры', fr: 'Jeux' },
  'edukacija': { lt: 'Edukacija', en: 'Education', pl: 'Edukacja', de: 'Bildung', ru: 'Образование', fr: 'Éducation' },
  'interaktyvus': { lt: 'Interaktyvus', en: 'Interactive', pl: 'Interaktywny', de: 'Interaktiv', ru: 'Интерактивный', fr: 'Interactif' },
  'nemokama': { lt: 'Nemokama', en: 'Free', pl: 'Bezpłatny', de: 'Kostenlos', ru: 'Бесплатно', fr: 'Gratuit' },
  'sportas': { lt: 'Sportas', en: 'Sports', pl: 'Sport', de: 'Sport', ru: 'Спорт', fr: 'Sport' },
  'sveikata': { lt: 'Sveikata', en: 'Wellness', pl: 'Zdrowie', de: 'Wellness', ru: 'Здоровье', fr: 'Bien-être' },
  'spa': { lt: 'SPA', en: 'Spa', pl: 'Spa', de: 'Spa', ru: 'СПА', fr: 'Spa' },
  'joga': { lt: 'Joga', en: 'Yoga', pl: 'Joga', de: 'Yoga', ru: 'Йога', fr: 'Yoga' },
  'bėgimas': { lt: 'Bėgimas', en: 'Running', pl: 'Bieganie', de: 'Laufen', ru: 'Бег', fr: 'Course' },
  'fitnesas': { lt: 'Fitnesas', en: 'Fitness', pl: 'Fitness', de: 'Fitness', ru: 'Фитнес', fr: 'Fitness' },
  'apžvalgos': { lt: 'Apžvalgos aikštelė', en: 'Viewpoint', pl: 'Punkt widokowy', de: 'Aussichtspunkt', ru: 'Смотровая площадка', fr: 'Point de vue' },
  'bokštas': { lt: 'Bokštas', en: 'Tower', pl: 'Wieża', de: 'Turm', ru: 'Башня', fr: 'Tour' },
  'panorama': { lt: 'Panorama', en: 'Panorama', pl: 'Panorama', de: 'Panorama', ru: 'Панорама', fr: 'Panorama' },
  'cocktail': { lt: 'Kokteilių baras', en: 'Cocktail Bar', pl: 'Bar koktajlowy', de: 'Cocktailbar', ru: 'Коктейльный бар', fr: 'Bar à cocktails' },
  'craft_beer': { lt: 'Craft alus', en: 'Craft Beer', pl: 'Piwo rzemieślnicze', de: 'Craft-Bier', ru: 'Крафтовое пиво', fr: 'Bière artisanale' },
  'wine': { lt: 'Vyno baras', en: 'Wine Bar', pl: 'Bar winny', de: 'Weinbar', ru: 'Винный бар', fr: 'Bar à vin' },
  'sports': { lt: 'Sporto baras', en: 'Sports Bar', pl: 'Bar sportowy', de: 'Sportsbar', ru: 'Спорт-бар', fr: 'Bar sportif' },
  'live_music': { lt: 'Gyva muzika', en: 'Live Music', pl: 'Muzyka na żywo', de: 'Live-Musik', ru: 'Живая музыка', fr: 'Musique live' },
  'lietuviška': { lt: 'Lietuviška virtuvė', en: 'Lithuanian Cuisine', pl: 'Kuchnia litewska', de: 'Litauische Küche', ru: 'Литовская кухня', fr: 'Cuisine lituanienne' },
  'fine_dining': { lt: 'Fine dining', en: 'Fine Dining', pl: 'Fine dining', de: 'Fine Dining', ru: 'Изысканная кухня', fr: 'Fine dining' },
  'terasa': { lt: 'Lauko terasa', en: 'Outdoor Terrace', pl: 'Taras zewnętrzny', de: 'Außenterrasse', ru: 'Летняя терраса', fr: 'Terrasse extérieure' },
  'boutique': { lt: 'Boutique viešbutis', en: 'Boutique Hotel', pl: 'Hotel butikowy', de: 'Boutiquehotel', ru: 'Бутик-отель', fr: 'Hôtel boutique' },
  'baseinas': { lt: 'Baseinas', en: 'Swimming Pool', pl: 'Basen', de: 'Schwimmbad', ru: 'Бассейн', fr: 'Piscine' },
  'konferencijos': { lt: 'Konferencijų salės', en: 'Conference Rooms', pl: 'Sale konferencyjne', de: 'Konferenzräume', ru: 'Конференц-залы', fr: 'Salles de conférence' },
  'restoranas_vh': { lt: 'Restoranas viešbutyje', en: 'On-site Restaurant', pl: 'Restauracja w hotelu', de: 'Hotelrestaurant', ru: 'Ресторан при отеле', fr: 'Restaurant sur place' },
  'koncertas': { lt: 'Koncertas', en: 'Concert', pl: 'Koncert', de: 'Konzert', ru: 'Концерт', fr: 'Concert' },
  'festivalis': { lt: 'Festivalis', en: 'Festival', pl: 'Festiwal', de: 'Festival', ru: 'Фестиваль', fr: 'Festival' },
  'elektronika': { lt: 'Elektronika', en: 'Electronic Music', pl: 'Muzyka elektroniczna', de: 'Elektronische Musik', ru: 'Электронная музыка', fr: 'Musique électronique' },
  'konferencija': { lt: 'Konferencija', en: 'Conference', pl: 'Konferencja', de: 'Konferenz', ru: 'Конференция', fr: 'Conférence' },
  'dirbtuvės': { lt: 'Dirbtuvės', en: 'Workshop', pl: 'Warsztaty', de: 'Workshop', ru: 'Мастер-класс', fr: 'Atelier' },
  'paskaita': { lt: 'Paskaita', en: 'Lecture', pl: 'Wykład', de: 'Vortrag', ru: 'Лекция', fr: 'Conférence' },
  'ekskursija': { lt: 'Ekskursija', en: 'Tour', pl: 'Wycieczka', de: 'Führung', ru: 'Экскурсия', fr: 'Visite guidée' },
  'maratonas': { lt: 'Maratonas', en: 'Marathon', pl: 'Maraton', de: 'Marathon', ru: 'Марафон', fr: 'Marathon' },
  'dviračiai': { lt: 'Dviračiai', en: 'Cycling', pl: 'Rowerem', de: 'Radfahren', ru: 'Велосипед', fr: 'Vélo' },
  'networking': { lt: 'Networking', en: 'Networking', pl: 'Networking', de: 'Networking', ru: 'Нетворкинг', fr: 'Networking' },
  'verslas': { lt: 'Verslas', en: 'Business', pl: 'Biznes', de: 'Geschäft', ru: 'Бизнес', fr: 'Affaires' },
  'seminaras': { lt: 'Seminaras', en: 'Seminar', pl: 'Seminarium', de: 'Seminar', ru: 'Семинар', fr: 'Séminaire' },
  'literatūra': { lt: 'Literatūra', en: 'Literature', pl: 'Literatura', de: 'Literatur', ru: 'Литература', fr: 'Littérature' },
  'alus': { lt: 'Alus', en: 'Beer', pl: 'Piwo', de: 'Bier', ru: 'Пиво', fr: 'Bière' },
  'gastronominiai': { lt: 'Gastronominiai', en: 'Gastronomic', pl: 'Gastronomiczne', de: 'Gastronomisch', ru: 'Гастрономический', fr: 'Gastronomique' },
  'privatus': { lt: 'Privatus', en: 'Private', pl: 'Prywatny', de: 'Privat', ru: 'Частный', fr: 'Privé' },
};

export function translateTag(tag: string, locale: string): string {
  const lower = tag.toLowerCase().trim();
  const translations = TAG_TRANSLATIONS[lower];
  if (translations) {
    return translations[locale] || translations['lt'] || tag;
  }
  return tag;
}

export const TRIP_PLANNER_TAG_MAP: Record<string, string[]> = {
  historical: ['istorija', 'paveldas', 'muziejus', 'pilis', 'bažnyčia', 'katedra', 'senamiestis', 'architektūra'],
  cultural: ['kultūra', 'menas', 'galerija', 'teatras', 'muzika', 'kinas', 'paroda'],
  nature: ['gamta', 'parkas', 'miškas', 'upė', 'ežeras', 'lauke', 'žaluma', 'dviratis', 'žygiai'],
  food: ['maistas', 'restoranas', 'kavinė', 'pusryčiai', 'brunch', 'degustacija', 'picerija', 'vegetariška', 'gastronominiai'],
  nightlife: ['naktinis', 'baras', 'klubas', 'kokteiliai', 'live muzika', 'rooftop', 'jazz', 'vynas', 'koncertas', 'festivalis'],
  shopping: ['apsipirkimas', 'turgus', 'dizainas', 'suvenyrais', 'antikvaras', 'rankdarbiai', 'mada'],
};
