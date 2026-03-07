/*
  # Add public event submission policy

  ## Summary
  Allows anyone (unauthenticated users) to submit events via the public form.
  Submitted events are automatically set to 'pending' status and must be
  approved by an admin before becoming publicly visible.

  ## Changes
  1. New RLS policy on listings table
     - Allows anonymous users to INSERT events with status='pending' only
     - Prevents public users from setting status to 'active' or 'inactive' directly
     - All other policies (SELECT, UPDATE, DELETE) remain unchanged

  ## Security
  - Public can only INSERT with category='event' and status='pending'
  - WITH CHECK ensures status is always 'pending' for anonymous submissions
  - Admins still control all listings via existing admin policies
*/

CREATE POLICY "Anyone can submit events for review"
  ON listings
  FOR INSERT
  TO anon
  WITH CHECK (
    category = 'event'
    AND status = 'pending'
  );
