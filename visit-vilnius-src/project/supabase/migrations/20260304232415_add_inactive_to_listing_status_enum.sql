/*
  # Add 'inactive' value to listing_status enum

  ## Problem
  The listing_status enum only had: draft, pending, active, rejected
  Admin UI uses 'inactive' to deactivate listings, but this value was missing
  causing all toggle/deactivate operations to silently fail.

  ## Change
  - Add 'inactive' to listing_status enum
  - Update RLS SELECT policy to also block inactive listings from public view
*/

ALTER TYPE listing_status ADD VALUE IF NOT EXISTS 'inactive';
