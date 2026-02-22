import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/apiGuard";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase } = await requireAdmin();
    const { id: vendorUserId } = await params;

    const { data: role } = await supabase
      .from("roles")
      .select("id")
      .eq("slug", "vendor")
      .single();

    await Promise.all([
      supabase
        .from("vendor_profiles")
        .update({ verified_at: new Date().toISOString() })
        .eq("user_id", vendorUserId),
      role
        ? supabase
            .from("user_roles")
            .upsert(
              { user_id: vendorUserId, role_id: role.id },
              { onConflict: "user_id,role_id" }
            )
        : Promise.resolve(),
    ]);

    const { data: vr } = await supabase
      .from("vendor_restaurants")
      .select("restaurant_id")
      .eq("vendor_id", vendorUserId);

    if (vr?.length) {
      const ids = vr.map((r: { restaurant_id: string }) => r.restaurant_id);
      await supabase
        .from("restaurants")
        .update({ status: "active" })
        .in("id", ids);
    }

    const { data: vp } = await supabase
      .from("vendor_profiles")
      .select("restaurant_ids")
      .eq("user_id", vendorUserId)
      .single();

    if (vp?.restaurant_ids?.length) {
      await supabase
        .from("vendor_profiles")
        .update({ restaurant_ids: vp.restaurant_ids })
        .eq("user_id", vendorUserId);
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    const e = err as Error & { status?: number };
    return NextResponse.json(
      { error: e.message },
      { status: e.status ?? 500 }
    );
  }
}
