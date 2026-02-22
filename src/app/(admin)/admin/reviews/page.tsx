import { createClient } from "@/lib/supabase/server";
import { UserFactory } from "@/lib/auth/UserFactory";

export default async function AdminReviewsPage() {
  const supabase = await createClient();
  await UserFactory.fromSupabase(supabase);

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, restaurant_id, rating, comment, created_at")
    .order("rating", { ascending: true })
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <div className="p-8">
      <h1 className="font-serif text-2xl font-bold text-text-primary mb-2">
        Reviews
      </h1>
      <p className="text-sm text-text-muted mb-8">
        Low ratings shown first for moderation.
      </p>

      {!reviews?.length ? (
        <div className="bg-card border border-border rounded-[var(--radius-lg)] p-8 text-center text-text-muted text-sm">
          No reviews.
        </div>
      ) : (
        <div className="border border-border rounded-[var(--radius-lg)] overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-surface border-b border-border">
                <th className="text-left text-xs font-bold text-text-muted uppercase px-4 py-3">
                  Rating
                </th>
                <th className="text-left text-xs font-bold text-text-muted uppercase px-4 py-3">
                  Comment
                </th>
                <th className="text-left text-xs font-bold text-text-muted uppercase px-4 py-3">
                  Date
                </th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-border last:border-b-0 hover:bg-card"
                >
                  <td className="px-4 py-3">
                    <span
                      className={`font-semibold ${
                        r.rating <= 2 ? "text-warning" : "text-text-primary"
                      }`}
                    >
                      {r.rating} ★
                    </span>
                  </td>
                  <td className="px-4 py-3 text-text-secondary max-w-md truncate">
                    {r.comment}
                  </td>
                  <td className="px-4 py-3 text-text-muted text-sm">
                    {r.created_at?.toString().slice(0, 10)}
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
