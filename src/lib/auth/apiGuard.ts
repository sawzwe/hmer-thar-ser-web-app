import { createClient } from "@/lib/supabase/server";
import { UserFactory } from "@/lib/auth/UserFactory";
import type { VendorUser } from "@/lib/auth/users/VendorUser";
import type { AdminUser } from "@/lib/auth/users/AdminUser";

export async function requireVendor() {
  const supabase = await createClient();
  const user = (await UserFactory.fromSupabase(supabase)) as VendorUser;
  if (user.type !== "vendor") {
    const e = new Error("Unauthenticated") as Error & { status?: number };
    e.status = 401;
    throw e;
  }
  return { user, supabase };
}

export async function requireVendorOwner(restaurantId: string) {
  const supabase = await createClient();
  const user = (await UserFactory.fromSupabase(supabase)) as VendorUser;
  if (user.type !== "vendor") {
    const e = new Error("Unauthenticated") as Error & { status?: number };
    e.status = 401;
    throw e;
  }
  if (!user.ownsRestaurant(restaurantId)) {
    const e = new Error("Forbidden") as Error & { status?: number };
    e.status = 403;
    throw e;
  }
  return { user, supabase };
}

export async function requireAdmin(requireSuperAdmin = false) {
  const supabase = await createClient();
  const user = (await UserFactory.fromSupabase(supabase)) as AdminUser;
  if (user.type !== "admin") {
    const e = new Error("Forbidden") as Error & { status?: number };
    e.status = 403;
    throw e;
  }
  if (requireSuperAdmin && !user.isSuperAdmin()) {
    const e = new Error("Superadmin only") as Error & { status?: number };
    e.status = 403;
    throw e;
  }
  return { user, supabase };
}
