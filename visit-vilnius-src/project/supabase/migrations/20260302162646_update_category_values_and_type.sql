/*
  # Update Category Values and Type
  
  1. Changes
    - Update existing category values to match new naming
    - Change category column to TEXT type
    - Remove old enum type constraint
    
  2. Mapping
    - sightseeing -> attraction
    - accommodation -> hotel
    - shopping -> shop
    - restaurant -> restaurant (no change)
    - event -> event (keep as is)
*/

-- First, change column type to text to allow updates
ALTER TABLE listings ALTER COLUMN category TYPE TEXT;

-- Update existing categories to new names
UPDATE listings SET category = 'attraction' WHERE category = 'sightseeing';
UPDATE listings SET category = 'hotel' WHERE category = 'accommodation';
UPDATE listings SET category = 'shop' WHERE category = 'shopping';

-- Add check constraint for valid categories
ALTER TABLE listings DROP CONSTRAINT IF EXISTS valid_categories;
ALTER TABLE listings ADD CONSTRAINT valid_categories 
  CHECK (category IN ('hotel', 'restaurant', 'attraction', 'shop', 'event'));
