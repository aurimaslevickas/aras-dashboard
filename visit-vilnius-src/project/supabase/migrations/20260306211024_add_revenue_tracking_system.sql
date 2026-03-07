/*
  # Revenue Tracking System

  ## Summary
  Creates a complete revenue tracking system for admin use only.
  This allows tracking payments from listings/partners, membership renewals,
  and revenue by category/type. Visible only to admin role users.

  ## New Tables

  ### revenue_payments
  - `id` - UUID primary key
  - `listing_id` - Optional FK to listings table (nullable for general payments)
  - `listing_name` - Cached listing name for display
  - `listing_category` - Cached category (hotel, restaurant, bar, shop, attraction, event)
  - `payment_type` - Enum: annual_membership, event_fee, featured_badge, sponsorship, other
  - `amount` - Payment amount in EUR (decimal)
  - `currency` - Currency code (default EUR)
  - `payment_date` - When payment was received
  - `valid_until` - When this payment/membership expires (for renewals tracking)
  - `notes` - Free text notes
  - `contact_person` - Name of responsible contact person
  - `contact_email` - Contact email
  - `contact_phone` - Contact phone
  - `created_by` - Which admin user created this record
  - `created_at` - Record creation timestamp
  - `updated_at` - Last update timestamp

  ## Security
  - RLS enabled - only admin role can access this table
  - Uses is_admin() security definer function for access control
*/

CREATE TABLE IF NOT EXISTS revenue_payments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id) ON DELETE SET NULL,
  listing_name text NOT NULL DEFAULT '',
  listing_category text NOT NULL DEFAULT '',
  payment_type text NOT NULL DEFAULT 'annual_membership',
  amount numeric(10,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'EUR',
  payment_date date NOT NULL DEFAULT CURRENT_DATE,
  valid_until date,
  notes text DEFAULT '',
  contact_person text DEFAULT '',
  contact_email text DEFAULT '',
  contact_phone text DEFAULT '',
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE revenue_payments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can select revenue payments"
  ON revenue_payments FOR SELECT
  TO authenticated
  USING (is_admin());

CREATE POLICY "Only admins can insert revenue payments"
  ON revenue_payments FOR INSERT
  TO authenticated
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can update revenue payments"
  ON revenue_payments FOR UPDATE
  TO authenticated
  USING (is_admin())
  WITH CHECK (is_admin());

CREATE POLICY "Only admins can delete revenue payments"
  ON revenue_payments FOR DELETE
  TO authenticated
  USING (is_admin());

CREATE INDEX IF NOT EXISTS idx_revenue_payments_listing_id ON revenue_payments(listing_id);
CREATE INDEX IF NOT EXISTS idx_revenue_payments_payment_date ON revenue_payments(payment_date);
CREATE INDEX IF NOT EXISTS idx_revenue_payments_valid_until ON revenue_payments(valid_until);
CREATE INDEX IF NOT EXISTS idx_revenue_payments_payment_type ON revenue_payments(payment_type);
CREATE INDEX IF NOT EXISTS idx_revenue_payments_listing_category ON revenue_payments(listing_category);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'listings' AND column_name = 'contact_person'
  ) THEN
    ALTER TABLE listings ADD COLUMN contact_person text DEFAULT '';
    ALTER TABLE listings ADD COLUMN contact_email text DEFAULT '';
    ALTER TABLE listings ADD COLUMN contact_phone text DEFAULT '';
    ALTER TABLE listings ADD COLUMN membership_valid_until date;
  END IF;
END $$;
