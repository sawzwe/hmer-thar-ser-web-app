import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/apiGuard";

export async function GET(req: Request) {
  try {
    const { supabase } = await requireAdmin();
    const { searchParams } = new URL(req.url);
    const _q = searchParams.get("q") ?? "";
    const { data: roles } = await supabase
      .from("user_roles")
      .select("user_id, roles(slug)")
      .limit(200);
    const userIds = [...new Set((roles ?? []).map((r: { user_id: string }) => r.user_id))];
    return NextResponse.json({ userIds, count: userIds.length });
  } catch (err) {
    const e = err as Error & { status?: number };
    return NextResponse.json(
      { error: e.message },
      { status: e.status ?? 500 }
    );
  }
}
