import { createClient } from "@/lib/supabase/server";
import { UserFactory } from "@/lib/auth/UserFactory";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const user = await UserFactory.fromSupabase(supabase);
  const today = new Date().toISOString().split("T")[0];

  const [
    usersCount,
    pendingVendorsCount,
    todayBookingsCount,
  ] = await Promise.all([
    supabase
      .from("user_roles")
      .select("user_id", { count: "exact", head: true }),
    supabase
      .from("vendor_profiles")
      .select("user_id", { count: "exact", head: true })
      .is("verified_at", null),
    supabase
      .from("bookings")
      .select("id", { count: "exact", head: true })
      .eq("date", today),
  ]);

  return (
    <div className="p-8">
      <h1 className="font-serif text-2xl font-bold text-text-primary mb-2">
        Admin Overview
      </h1>
      <p className="text-sm text-text-muted mb-8">
        Platform-wide stats and activity.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-card border border-border rounded-[var(--radius-lg)] p-5">
          <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
            Total Users
          </div>
          <div className="text-2xl font-bold text-text-primary">
            {usersCount.count ?? 0}
          </div>
        </div>
        <div className="bg-card border border-border rounded-[var(--radius-lg)] p-5">
          <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
            Pending Vendor Verifications
          </div>
          <div className="text-2xl font-bold text-text-primary">
            {pendingVendorsCount.count ?? 0}
          </div>
          {(pendingVendorsCount.count ?? 0) > 0 && (
            <a
              href="/admin/vendors"
              className="mt-2 text-sm text-brand-light hover:underline block"
            >
              Review →
            </a>
          )}
        </div>
        <div className="bg-card border border-border rounded-[var(--radius-lg)] p-5">
          <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">
            Today&apos;s Bookings
          </div>
          <div className="text-2xl font-bold text-text-primary">
            {todayBookingsCount.count ?? 0}
          </div>
        </div>
      </div>

      <div className="text-sm text-text-muted">
        Quick links:{" "}
        <a href="/admin/vendors" className="text-brand-light hover:underline">
          Vendors
        </a>
        {" · "}
        <a href="/admin/users" className="text-brand-light hover:underline">
          Users
        </a>
        {" · "}
        <a href="/admin/restaurants" className="text-brand-light hover:underline">
          Restaurants
        </a>
        {" · "}
        <a href="/admin/bookings" className="text-brand-light hover:underline">
          Bookings
        </a>
      </div>
    </div>
  );
}
