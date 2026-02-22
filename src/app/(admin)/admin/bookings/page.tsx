import { createClient } from "@/lib/supabase/server";
import { UserFactory } from "@/lib/auth/UserFactory";

export default async function AdminBookingsPage() {
  const supabase = await createClient();
  await UserFactory.fromSupabase(supabase);

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, booking_ref, customer_name, date, time, status, restaurant_id")
    .order("date", { ascending: false })
    .order("time", { ascending: false })
    .limit(100);

  return (
    <div className="p-8">
      <h1 className="font-serif text-2xl font-bold text-text-primary mb-2">
        All Bookings
      </h1>
      <p className="text-sm text-text-muted mb-8">
        Cross-restaurant view. Filter and export via API.
      </p>

      {!bookings?.length ? (
        <div className="bg-card border border-border rounded-[var(--radius-lg)] p-8 text-center text-text-muted text-sm">
          No bookings.
        </div>
      ) : (
        <div className="border border-border rounded-[var(--radius-lg)] overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th className="text-left text-xs font-bold text-text-muted uppercase px-4 py-3">
                  Ref
                </th>
                <th className="text-left text-xs font-bold text-text-muted uppercase px-4 py-3">
                  Guest
                </th>
                <th className="text-left text-xs font-bold text-text-muted uppercase px-4 py-3">
                  Date / Time
                </th>
                <th className="text-left text-xs font-bold text-text-muted uppercase px-4 py-3">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((b) => (
                <tr
                  key={b.id}
                  className="border-b border-border last:border-b-0 hover:bg-card"
                >
                  <td className="px-4 py-3 font-mono text-sm text-brand-light">
                    {b.booking_ref}
                  </td>
                  <td className="px-4 py-3 text-text-primary">{b.customer_name}</td>
                  <td className="px-4 py-3 text-text-secondary">
                    {b.date} {b.time}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                        b.status === "confirmed"
                          ? "bg-success-dim text-success"
                          : b.status === "completed"
                            ? "bg-info-dim text-info"
                            : "bg-[rgba(255,255,255,0.05)] text-text-muted"
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
