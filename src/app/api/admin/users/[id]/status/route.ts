import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/apiGuard";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase: _s } = await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const { status } = body;
    if (!["active", "suspended"].includes(status)) {
      return NextResponse.json(
        { error: "status must be active or suspended" },
        { status: 400 }
      );
    }
    // TODO: Use Supabase Auth Admin API with service role to ban/unban user
    // supabase.auth.admin.updateUserById(id, { ban_duration: "876000h" }) for suspend
    return NextResponse.json({ success: true });
  } catch (err) {
    const e = err as Error & { status?: number };
    return NextResponse.json(
      { error: e.message },
      { status: e.status ?? 500 }
    );
  }
}
