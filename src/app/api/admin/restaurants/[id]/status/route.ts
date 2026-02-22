import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/apiGuard";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase } = await requireAdmin();
    const { id } = await params;
    const body = await req.json();
    const { status } = body;
    if (!["draft", "active", "paused", "archived"].includes(status)) {
      return NextResponse.json(
        { error: "status must be draft, active, paused, or archived" },
        { status: 400 }
      );
    }
    const { data, error } = await supabase
      .from("restaurants")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    const e = err as Error & { status?: number };
    return NextResponse.json(
      { error: e.message },
      { status: e.status ?? 500 }
    );
  }
}
