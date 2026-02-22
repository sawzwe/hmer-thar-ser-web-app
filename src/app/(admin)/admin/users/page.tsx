import { createClient } from "@/lib/supabase/server";
import { UserFactory } from "@/lib/auth/UserFactory";

export default async function AdminUsersPage() {
  const supabase = await createClient();
  await UserFactory.fromSupabase(supabase);

  const { data: roles } = await supabase
    .from("user_roles")
    .select("user_id, roles(slug)")
    .limit(200);

  const userIds = [...new Set((roles ?? []).map((r: { user_id: string }) => r.user_id))];

  return (
    <div className="p-8">
      <h1 className="font-serif text-2xl font-bold text-text-primary mb-2">
        Users
      </h1>
      <p className="text-sm text-text-muted mb-8">
        Search and manage users. User details come from auth.users — use
        Supabase dashboard or admin API for full management.
      </p>

      <div className="bg-card border border-border rounded-[var(--radius-lg)] p-8 text-center text-text-muted text-sm">
        {userIds.length} users with roles. User table/search component and
        suspend/role actions require admin API.
      </div>
    </div>
  );
}
