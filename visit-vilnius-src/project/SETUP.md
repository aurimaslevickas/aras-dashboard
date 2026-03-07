# VisitVilnius.lt Setup Guide

## Prerequisites

1. Node.js and npm installed
2. Supabase account and project created
3. Database migration applied

## Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Fill in your Supabase credentials in `.env`:
   ```
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

## Database Setup

The database migration has already been applied with the following tables:
- `users` - User accounts with roles (admin, provider, user)
- `businesses` - Business listings (restaurants, hotels, attractions, etc.)
- `events` - Events happening in Vilnius
- `analytics_events` - Click and view tracking
- `hero_images` - Seasonal hero banner images

## Creating the First Admin User

You need to create the first admin user directly in Supabase:

1. Go to your Supabase project dashboard
2. Navigate to Authentication > Users
3. Click "Add user" or "Invite user"
4. Enter the admin email and password
5. After the user is created, go to SQL Editor
6. Run this query to set the user as admin:

```sql
-- Replace 'admin@visitvilnius.lt' with your admin email
INSERT INTO public.users (id, email, role, full_name)
SELECT
  id,
  email,
  'admin'::user_role,
  'Admin'
FROM auth.users
WHERE email = 'admin@visitvilnius.lt'
ON CONFLICT (id) DO UPDATE
SET role = 'admin'::user_role;
```

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Access the admin panel at: `http://localhost:5173/admin`

## Admin Dashboard Features

The admin dashboard (`/admin`) provides:

- **Overview Statistics**:
  - Total and active events count
  - Total and active businesses count
  - Total views and clicks analytics
  - Business breakdown by type

- **Recent Activity Feed**:
  - Last 10 analytics events
  - Real-time tracking of user interactions

- **Quick Actions**:
  - Create new events
  - Manage businesses
  - View detailed analytics

## Creating Additional Admin Users

To create more admin users:

1. Register the user through Supabase Authentication
2. Update their role in the database:

```sql
UPDATE public.users
SET role = 'admin'::user_role
WHERE email = 'new-admin@example.com';
```

## Creating Content Provider Users

For business owners who will manage their own listings:

1. Create the user in Supabase Authentication
2. Set their role and create their business:

```sql
-- Set user as provider
UPDATE public.users
SET role = 'provider'::user_role
WHERE email = 'business@example.com';

-- Create their business (get the user_id first)
INSERT INTO public.businesses (
  owner_id,
  type,
  name,
  description,
  address,
  phone,
  email
) VALUES (
  'user_id_here',
  'restaurant',
  'Restaurant Name',
  'Description',
  'Address',
  '+370 123 45678',
  'business@example.com'
);
```

## Security Notes

- Admin panel is protected by Row Level Security (RLS)
- Only users with `role = 'admin'` can access admin features
- Business owners can only edit their own businesses
- All analytics data is anonymized (IP addresses stored for rate limiting only)

## Next Steps

After setting up the admin user:

1. Log in to `/admin` with your admin credentials
2. Create businesses and assign them to content providers
3. Create events for the homepage
4. Monitor analytics and visitor statistics
5. Manage seasonal hero images

## Troubleshooting

### Cannot log in as admin
- Verify the user exists in `auth.users`
- Verify the user has `role = 'admin'` in `public.users`
- Check browser console for error messages

### Database connection issues
- Verify `.env` file has correct Supabase credentials
- Check Supabase project is active
- Verify RLS policies are enabled

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Clear cache: `rm -rf node_modules dist && npm install`
- Check Node.js version (should be 18+)
