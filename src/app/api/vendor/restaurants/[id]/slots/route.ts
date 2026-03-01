import { NextResponse } from "next/server";
import { requireVendorOwner } from "@/lib/auth/apiGuard";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { supabase } = await requireVendorOwner(id);
    const { searchParams } = new URL(_req.url);
    const from = searchParams.get("from");
    const { data, error } = await supabase
      .from("slots")
      .select("*")
      .eq("restaurant_id", id)
      .gte("date", from ?? new Date().toISOString().split("T")[0])
      .order("date")
      .order("time");
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- intentionally excluding restaurant_id
    const { restaurant_id, ...rest } = body;
    const { data, error } = await supabase
      .from("slots")
      .update(rest)
      .eq("restaurant_id", id)
      .select();
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
