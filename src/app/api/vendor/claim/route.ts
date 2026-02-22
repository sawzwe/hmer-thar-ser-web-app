import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { UserFactory } from "@/lib/auth/UserFactory";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const user = await UserFactory.fromSupabase(supabase);
    if (!user.isAuthenticated()) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }

    const { restaurantId } = await req.json();
    if (!restaurantId) {
      return NextResponse.json(
        { error: "restaurantId is required" },
        { status: 400 }
      );
    }

    await supabase.from("vendor_restaurants").upsert(
      {
        vendor_id: user.id,
        restaurant_id: restaurantId,
        role: "owner",
      },
      { onConflict: "vendor_id,restaurant_id" }
    );

    const { data: vp } = await supabase
      .from("vendor_profiles")
      .select("restaurant_ids")
      .eq("user_id", user.id)
      .single();

    const ids = new Set((vp?.restaurant_ids as string[] | undefined) ?? []);
    ids.add(restaurantId);
    await supabase.from("vendor_profiles").upsert(
      {
        user_id: user.id,
        restaurant_ids: Array.from(ids),
      },
      { onConflict: "user_id" }
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
