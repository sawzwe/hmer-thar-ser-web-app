# Cursor Prompts for CMS & Admin — Copy-paste in Order

Use these prompts with your AI agent. Each builds on the previous. See `docs/AUTH_AND_CMS_PATTERN.md` for the auth/factory context and `docs/CMS_BUILD_GUIDE.html` for the full visual guide.

---

## Prompt 1 · Route Groups & Shells (Steps 1–3)

```
Create the vendor and admin route groups in Next.js App Router.

1. Create src/app/(vendor)/layout.tsx — server component that:
   - Calls createClient() from @/lib/supabase/server
   - Calls UserFactory.fromSupabase(supabase)
   - Redirects to /sign-in?next=/vendor if user.type !== 'vendor'
   - Renders <VendorShell user={user}>{children}</VendorShell>

2. Create src/app/(admin)/layout.tsx — same pattern, redirect if user.type !== 'admin'

3. Create src/components/vendor/VendorShell.tsx — client component with:
   - Sidebar nav: Dashboard, Restaurants, Deals, Availability, Bookings
   - Active link highlighting using usePathname()
   - Show user.name, user.companyName
   - Warning banner if !user.verifiedAt: "Pending verification"
   - Main content area next to sidebar

4. Create src/components/admin/AdminShell.tsx — same pattern but:
   - Nav: Overview, Users, Vendor Verify, Restaurants, All Bookings, Reviews
   - Show user.accessLevel badge (superadmin / moderator / support)
   - Purple accent color (var(--purple)) instead of brand red

Use the existing design system tokens from app/globals.css. Do not add new CSS files.
```

---

## Prompt 2 · Vendor Pages (Steps 4–9)

```
Build all vendor pages under src/app/(vendor)/vendor/.

For EVERY [id] page: call user.ownsRestaurant(params.id) and redirect('/vendor') if false.
All DB queries must be scoped to user.restaurantIds or the specific restaurantId.

Pages to build:
1. /vendor — Dashboard with stat cards: today's confirmed bookings, active restaurants, pending reviews
2. /vendor/restaurants — Table of their restaurants, status badge, Edit link
3. /vendor/restaurants/[id] — Tabs: Info | Deals | Availability | Menu | Bookings
4. /vendor/restaurants/[id] Info tab — edit form: name, description, area, address, price_tier, opening_hours (weekly schedule), transit_nearby (add/remove entries), ai_tags (checkbox grid), save via PATCH /api/vendor/restaurants/[id]
5. /vendor/restaurants/[id] Deals tab — table of deals with DealForm modal for create/edit. Fields: title, type, description, price, discount_pct, valid_from, valid_until, status toggle
6. /vendor/restaurants/[id] Availability tab — SlotEditor: weekly template grid (times as rows, Mon–Sun as cols), capacity input per cell, generate button calls /api/vendor/restaurants/[id]/slots/generate
7. /vendor/restaurants/[id] Bookings tab — sortable table: booking_ref, customer_name, date, time, party_size, deal title, status badge. Actions: Mark Complete, Mark No-show (only if confirmed + date is past)
8. /vendor/claim — 2-step flow: search restaurant by name, submit claim (insert vendor_restaurants with verified_at=null)

Use server components for data fetching, client components only for interactive forms. Server actions for mutations.
```

---

## Prompt 3 · Admin Pages (Steps 10–13)

```
Build all admin pages under src/app/(admin)/admin/.

All queries are unscoped (admins see everything). Gate destructive actions with user.isSuperAdmin().

Pages to build:
1. /admin — Platform stats: total users, pending vendor verifications (with badge count), today's bookings, flagged reviews. Recent activity feed.

2. /admin/vendors — Pending verifications first. For each: vendor name, email, company name, claimed restaurant(s), date submitted. Actions: Approve (calls approveVendor server action: set verified_at + grant vendor role in user_roles + set restaurants.status='active'), Reject (delete vendor_restaurants row, notify). Show verified vendors below in a separate section.

3. /admin/users — Searchable paginated table. Columns: name, email, roles (badges), status, joined date, bookings count. Actions: Suspend/Reactivate (any admin), Change role (superadmin only via user.isSuperAdmin()). Click row → user detail modal.

4. /admin/restaurants — All restaurants. Filter by status. Columns: name, area, vendor, status, bookings count. Inline status change dropdown. Link to vendor's CMS for that restaurant.

5. /admin/bookings — All bookings across all restaurants. Filter by restaurant, date range, status. Export to CSV button.

6. /admin/reviews — Reviews with rating 1–2 shown first. Columns: restaurant, rating, comment preview, author, date. Delete action (any admin).

Reuse components from @/components/ui. Server components for all pages, server actions for mutations.
```

---

## Prompt 4 · API Routes (Steps 14–15)

```
Create all API route handlers. Follow this exact guard pattern:

For vendor routes (put in lib/auth/apiGuard.ts and reuse):

    async function requireVendorOwner(restaurantId: string) {
  const supabase = await createClient()
  const user = await UserFactory.fromSupabase(supabase) as VendorUser
  if (user.type !== 'vendor') throw { status: 401, message: 'Unauthenticated' }
  if (!user.ownsRestaurant(restaurantId)) throw { status: 403, message: 'Forbidden' }
  return { user, supabase }
    }

For admin routes: requireAdmin(requireSuperAdmin = false)

Create these route files:
- src/app/api/vendor/restaurants/route.ts — GET (list own restaurants)
- src/app/api/vendor/restaurants/[id]/route.ts — GET, PATCH
- src/app/api/vendor/restaurants/[id]/deals/route.ts — GET, POST
- src/app/api/vendor/restaurants/[id]/deals/[dealId]/route.ts — PATCH, DELETE
- src/app/api/vendor/restaurants/[id]/slots/route.ts — GET, PATCH
- src/app/api/vendor/restaurants/[id]/slots/generate/route.ts — POST (upsert 60-day slots from weekly template)
- src/app/api/vendor/restaurants/[id]/bookings/route.ts — GET, PATCH (status update)
- src/app/api/admin/users/route.ts — GET with search/pagination
- src/app/api/admin/users/[id]/status/route.ts — PATCH (suspend/activate)
- src/app/api/admin/vendors/[id]/verify/route.ts — POST (approve vendor)
- src/app/api/admin/restaurants/[id]/status/route.ts — PATCH

CRITICAL: Always override restaurant_id from URL params, never from request body. Always catch errors and return { error: message } with correct status codes.
```

---

## Prompt 5 · RLS + Nav + Middleware (Steps 16–18)

```
Three final pieces:

1. Update src/middleware.ts:
   - If request path starts with /vendor or /admin AND no Supabase session exists → redirect to /sign-in?next={path}
   - Keep existing session refresh logic

2. Update src/components/AppShell.tsx (or wherever the user dropdown is):
   - If user.type === 'vendor': add "🏪 Vendor Dashboard" link to /vendor in the dropdown
   - If user.type === 'admin': add "⚙️ Admin Panel" link to /admin in the dropdown

3. Create migration file migrations/004_rls_vendor_admin.sql with RLS policies:
   - restaurants: vendors can SELECT/UPDATE rows where their vendor_restaurants link exists; admins can do all
   - deals, slots, menu_categories, menu_items: same pattern (via restaurant_id FK)
   - bookings: vendors can SELECT where restaurant_id in their venues; admins all
   - user_roles: only superadmins can INSERT/DELETE (check via joining roles table)

Do not change any existing auth types, UserFactory, or Supabase client files.
```
