# VisitVilnius.lt - Tourism Portal

A comprehensive, multilingual tourism portal for Vilnius, Lithuania. Built with React, TypeScript, Tailwind CSS, and Supabase.

## Features Implemented

### Database Architecture
- **PostgreSQL with Supabase** - Complete backend infrastructure
- **Row Level Security (RLS)** - Multi-tenant secure data access
- **5 Core Tables**:
  - `users` - User accounts with role-based access (admin, provider, user)
  - `businesses` - Business listings (restaurants, hotels, attractions, shops)
  - `events` - Events happening in Vilnius
  - `analytics_events` - Click and view tracking
  - `hero_images` - Seasonal hero banner images

### Admin System
- **Secure Authentication** - Supabase Auth integration
- **Admin Dashboard** (`/admin`):
  - Overview statistics (events, businesses, views, clicks)
  - Business breakdown by type
  - Recent activity feed
  - Quick access to management pages
- **Event Management** (`/admin/events`):
  - List all events with search and filters
  - Toggle active/inactive status
  - Edit and delete events
  - Create new events

### Frontend Pages
- **Homepage** - Seasonal hero, events, attractions, restaurants, shopping
- **Events Page** - Browse all events with filtering
- **See Page** - Attractions and landmarks
- **Eat Page** - Restaurants and cafes
- **Stay Page** - Hotels and accommodation
- **Shop Page** - Souvenirs and shopping
- **Plan Page** - AI trip planner interface
- **Detail Pages** - Individual pages for attractions, restaurants, hotels

### Technical Features
- **Responsive Design** - Mobile-first approach with Tailwind CSS
- **Seasonal Hero Banners** - Automatic rotation based on current season
- **Multi-language Ready** - Database supports Lithuanian and English content
- **Analytics Tracking** - Built-in view and click tracking
- **Type Safety** - Full TypeScript implementation

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx
│   ├── Footer.tsx
│   ├── SeasonalHero.tsx
│   ├── EventsSection.tsx
│   └── ...
├── contexts/           # React Context providers
│   └── AuthContext.tsx # Authentication state management
├── lib/                # Core utilities
│   └── supabase.ts    # Supabase client and types
├── pages/              # Page components
│   ├── AdminPage.tsx           # Admin login
│   ├── AdminDashboard.tsx      # Admin overview
│   ├── AdminEventsPage.tsx     # Event management
│   ├── EventsPage.tsx          # Public events listing
│   ├── SeePage.tsx             # Attractions listing
│   ├── EatPage.tsx             # Restaurants listing
│   └── ...
└── App.tsx             # Main app with routing
```

## Setup Instructions

See [SETUP.md](./SETUP.md) for detailed setup instructions.

### Quick Start

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and add your Supabase credentials:
   ```bash
   cp .env.example .env
   ```

4. Create the first admin user in Supabase (see SETUP.md)

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Access the admin panel at `http://localhost:5173/admin`

## Database Schema

### Users Table
```sql
- id: UUID (primary key, references auth.users)
- email: TEXT
- role: user_role (admin, provider, user)
- full_name: TEXT
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### Businesses Table
```sql
- id: UUID (primary key)
- owner_id: UUID (references users)
- type: business_type (restaurant, hotel, attraction, shop, event_organizer)
- name: TEXT
- name_en: TEXT
- description: TEXT
- description_en: TEXT
- address: TEXT
- phone: TEXT
- email: TEXT
- website: TEXT
- latitude: NUMERIC
- longitude: NUMERIC
- images: JSONB
- opening_hours: JSONB
- price_range: TEXT
- rating: NUMERIC
- featured: BOOLEAN
- active: BOOLEAN
- subscription_tier: subscription_tier (free, basic, premium)
- subscription_expires_at: TIMESTAMPTZ
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### Events Table
```sql
- id: UUID (primary key)
- organizer_id: UUID (references businesses)
- title: TEXT
- title_en: TEXT
- description: TEXT
- description_en: TEXT
- category: TEXT
- start_date: TIMESTAMPTZ
- end_date: TIMESTAMPTZ
- location: TEXT
- latitude: NUMERIC
- longitude: NUMERIC
- price: TEXT
- ticket_url: TEXT
- images: JSONB
- featured: BOOLEAN
- active: BOOLEAN
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

### Analytics Events Table
```sql
- id: UUID (primary key)
- entity_type: TEXT (event, business, attraction)
- entity_id: UUID
- event_type: TEXT (view, click, search)
- user_ip: TEXT
- user_agent: TEXT
- referrer: TEXT
- metadata: JSONB
- created_at: TIMESTAMPTZ
```

### Hero Images Table
```sql
- id: UUID (primary key)
- season: TEXT
- title: TEXT
- title_en: TEXT
- description: TEXT
- description_en: TEXT
- image_url: TEXT
- months: INTEGER[]
- active: BOOLEAN
- order_index: INTEGER
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
```

## Security

### Row Level Security (RLS)
All tables have comprehensive RLS policies:

- **Public Access**: Users can view active businesses and events
- **Owner Access**: Business owners can manage only their own content
- **Admin Access**: Admins have full access to all data
- **Analytics**: Anyone can insert analytics, only owners/admins can view

### Authentication
- Secure authentication via Supabase Auth
- Role-based access control (RBAC)
- Protected admin routes
- Session management

## Monetization Strategy

The platform supports a B2B subscription model:

- **Free Tier**: Basic listing
- **Basic Tier (€20-30/month)**: Featured placement, basic analytics
- **Premium Tier (€40-50/month)**: Priority placement, detailed analytics, custom branding

## Roadmap

### Phase 1 (Current)
- [x] Database schema and migrations
- [x] Admin authentication
- [x] Admin dashboard with statistics
- [x] Event management interface
- [x] Public-facing pages

### Phase 2 (Next)
- [ ] Event creation/editing forms
- [ ] Business management interface
- [ ] Content provider portal
- [ ] Business registration flow
- [ ] Analytics dashboard with charts

### Phase 3 (Future)
- [ ] Multilingual routing system
- [ ] Advanced search functionality
- [ ] Map integration (Google Maps/Mapbox)
- [ ] Email notifications
- [ ] Payment integration (Stripe)
- [ ] API for mobile apps
- [ ] SEO optimization
- [ ] Performance monitoring

## Technologies Used

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Build Tool**: Vite
- **Routing**: React Router v6
- **Icons**: Lucide React
- **Deployment**: Ready for Netlify, Vercel, or similar

## Contributing

This is a production project for VisitVilnius.lt. For development:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit for review

## License

Proprietary - All rights reserved

## Support

For technical support or questions:
- Email: admin@visitvilnius.lt
- Documentation: See SETUP.md

---

Built with care for Vilnius tourism
