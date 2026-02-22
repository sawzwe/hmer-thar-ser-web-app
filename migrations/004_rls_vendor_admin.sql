-- ══════════════════════════════════════════════════════════════════
-- Migration 004: RLS policies for vendor and admin access
-- Run once in Supabase SQL editor. Requires auth.uid() and schema.
-- ══════════════════════════════════════════════════════════════════

-- Enable RLS on tables that need it (skip if already enabled)
ALTER TABLE public.restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- ── restaurants: vendors see their own, admins see all ─────────────
DROP POLICY IF EXISTS "vendor_own_restaurants" ON public.restaurants;
CREATE POLICY "vendor_own_restaurants" ON public.restaurants
  FOR ALL USING (
    id IN (
      SELECT restaurant_id FROM public.vendor_restaurants
      WHERE vendor_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.slug = 'admin'
    )
  );

-- ── deals: via restaurant_id ──────────────────────────────────────
DROP POLICY IF EXISTS "vendor_own_deals" ON public.deals;
CREATE POLICY "vendor_own_deals" ON public.deals
  FOR ALL USING (
    restaurant_id IN (
      SELECT restaurant_id FROM public.vendor_restaurants
      WHERE vendor_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.slug = 'admin'
    )
  );

-- ── slots: via restaurant_id ───────────────────────────────────────
DROP POLICY IF EXISTS "vendor_own_slots" ON public.slots;
CREATE POLICY "vendor_own_slots" ON public.slots
  FOR ALL USING (
    restaurant_id IN (
      SELECT restaurant_id FROM public.vendor_restaurants
      WHERE vendor_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.slug = 'admin'
    )
  );

-- ── bookings: vendors SELECT for their venues; public can INSERT ───
-- Note: For public booking creation, you may need a separate policy.
-- Vendors + admins get full access for their scope.
DROP POLICY IF EXISTS "vendor_venue_bookings" ON public.bookings;
CREATE POLICY "vendor_venue_bookings" ON public.bookings
  FOR SELECT USING (
    restaurant_id IN (
      SELECT restaurant_id FROM public.vendor_restaurants
      WHERE vendor_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM public.user_roles ur
      JOIN public.roles r ON r.id = ur.role_id
      WHERE ur.user_id = auth.uid() AND r.slug = 'admin'
    )
  );

-- Allow INSERT for authenticated users and anon (guest booking) — adjust as needed
-- CREATE POLICY "allow_booking_insert" ON public.bookings FOR INSERT WITH CHECK (true);
-- CREATE POLICY "allow_booking_update_vendor_admin" ON public.bookings FOR UPDATE USING (...);
