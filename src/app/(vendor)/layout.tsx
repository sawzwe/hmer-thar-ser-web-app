import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { UserFactory } from "@/lib/auth/UserFactory";
import { VendorShell } from "@/components/vendor/VendorShell";
import type { VendorUser } from "@/lib/auth/users/VendorUser";

export default async function VendorLayout({
  children,
}: { children: React.ReactNode }) {
  const supabase = await createClient();
  const user = await UserFactory.fromSupabase(supabase);

  if (user.type !== "vendor") {
    redirect(user.isAuthenticated() ? "/" : `/sign-in?next=/vendor`);
  }

  return <VendorShell user={user as VendorUser}>{children}</VendorShell>;
}
