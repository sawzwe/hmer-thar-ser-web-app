import { NextResponse } from "next/server";
import { requireVendorOwner } from "@/lib/auth/apiGuard";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string; dealId: string }> }
) {
  try {
    const { id, dealId } = await params;
    const { supabase } = await requireVendorOwner(id);
    const body = await req.json();
    const { data: existing } = await supabase
      .from("deals")
      .select("restaurant_id")
      .eq("id", dealId)
      .single();
    if (!existing || existing.restaurant_id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { data, error } = await supabase
      .from("deals")
      .update(body)
      .eq("id", dealId)
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

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string; dealId: string }> }
) {
  try {
    const { id, dealId } = await params;
    const { supabase } = await requireVendorOwner(id);
    const { data: existing } = await supabase
      .from("deals")
      .select("restaurant_id")
      .eq("id", dealId)
      .single();
    if (!existing || existing.restaurant_id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await supabase.from("deals").delete().eq("id", dealId);
    return NextResponse.json({ success: true });
  } catch (err) {
    const e = err as Error & { status?: number };
    return NextResponse.json(
      { error: e.message },
      { status: e.status ?? 500 }
    );
  }
}
