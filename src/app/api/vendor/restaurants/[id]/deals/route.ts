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
      .from("deals")
      .select("*")
      .eq("restaurant_id", id);
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

export async function POST(
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
      .from("deals")
      .insert({ ...rest, restaurant_id: id })
      .select()
      .single();
    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (err) {
    const e = err as Error & { status?: number };
    return NextResponse.json(
      { error: e.message },
      { status: e.status ?? 500 }
    );
  }
}
