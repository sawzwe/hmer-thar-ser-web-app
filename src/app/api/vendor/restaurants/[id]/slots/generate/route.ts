import { NextResponse } from "next/server";
import { requireVendorOwner } from "@/lib/auth/apiGuard";
import { addDays, format } from "date-fns";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { supabase } = await requireVendorOwner(id);
    const body = (await req.json()) as Record<string, { time: string; capacity: number }[]>;
    const start = new Date();
    const end = addDays(start, 60);
    const rows: { restaurant_id: string; date: string; time: string; capacity: number; remaining: number }[] = [];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const dayKey = format(d, "EEEE").toLowerCase();
      const daySlots = body[dayKey] ?? [];
      for (const s of daySlots) {
        rows.push({
          restaurant_id: id,
          date: format(d, "yyyy-MM-dd"),
          time: s.time,
          capacity: s.capacity,
          remaining: s.capacity,
        });
      }
    }

    const { error } = await supabase.from("slots").upsert(rows, {
      onConflict: "restaurant_id,date,time",
      ignoreDuplicates: false,
    });
    if (error) throw error;
    return NextResponse.json({ success: true, count: rows.length });
  } catch (err) {
    const e = err as Error & { status?: number };
    return NextResponse.json(
      { error: e.message },
      { status: e.status ?? 500 }
    );
  }
}
