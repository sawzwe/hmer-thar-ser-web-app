-- ══════════════════════════════════════════════════════════════════
-- Migration 005: Public read access for active restaurants
-- Allows unauthenticated users to browse restaurant listings.
-- ══════════════════════════════════════════════════════════════════

-- Public can SELECT active restaurants (homepage, detail page, discovery)
DROP POLICY IF EXISTS "public_read_active_restaurants" ON public.restaurants;
CREATE POLICY "public_read_active_restaurants" ON public.restaurants
  FOR SELECT USING (status = 'active');

-- Public can SELECT deals for active restaurants
DROP POLICY IF EXISTS "public_read_deals_active" ON public.deals;
CREATE POLICY "public_read_deals_active" ON public.deals
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.restaurants r
      WHERE r.id = deals.restaurant_id AND r.status = 'active'
    )
  );
