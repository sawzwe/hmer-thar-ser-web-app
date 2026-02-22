import { NextResponse } from "next/server";
import { requireVendorOwner } from "@/lib/auth/apiGuard";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { supabase } = await requireVendorOwner(id);
    const { data, error } = await supabase
      .from("bookings")
      .select("*")
      .eq("restaurant_id", id)
      .order("date", { ascending: false })
      .order("time", { ascending: false });
    if (error) throw error;
    return NextResponse.json(data ?? []);
  } catch (err) {
    const e = err as Error & { status?: number };
    return NextResponse.json(
      { error: e.message },
      { status: e.status ?? 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { supabase } = await requireVendorOwner(id);
    const body = await req.json();
    const { bookingId, status } = body;
    if (!bookingId || !["completed", "no_show"].includes(status)) {
      return NextResponse.json(
        { error: "bookingId and status (completed|no_show) required" },
        { status: 400 }
      );
    }
    const { data: booking } = await supabase
      .from("bookings")
      .select("restaurant_id")
      .eq("id", bookingId)
      .single();
    if (!booking || booking.restaurant_id !== id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const { data, error } = await supabase
      .from("bookings")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", bookingId)
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
