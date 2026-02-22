-- ══════════════════════════════════════════════════════════════════
-- Migration 009: Normalize restaurant address, area, and cuisine
-- Address: province, district, subdistrict + address (street)
-- Area: neighbourhood (Silom, Sukhumvit, etc.) - already exists
-- Cuisine: cuisine_types table for enum-like selection
-- ══════════════════════════════════════════════════════════════════

-- Address fields (address = street; add structured parts)
ALTER TABLE public.restaurants
  ADD COLUMN IF NOT EXISTS province TEXT,
  ADD COLUMN IF NOT EXISTS district TEXT,
  ADD COLUMN IF NOT EXISTS subdistrict TEXT;

-- Cuisine types (enum-like lookup)
CREATE TABLE IF NOT EXISTS public.cuisine_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL
);

INSERT INTO public.cuisine_types (slug, name) VALUES
  ('thai', 'Thai'),
  ('italian', 'Italian'),
  ('japanese', 'Japanese'),
  ('american', 'American'),
  ('indian', 'Indian'),
  ('chinese', 'Chinese'),
  ('korean', 'Korean'),
  ('french', 'French'),
  ('mexican', 'Mexican'),
  ('seafood', 'Seafood'),
  ('vegetarian', 'Vegetarian'),
  ('european', 'European'),
  ('asian', 'Asian'),
  ('bbq', 'BBQ'),
  ('burgers', 'Burgers'),
  ('healthy', 'Healthy'),
  ('latin', 'Latin')
ON CONFLICT (slug) DO NOTHING;
