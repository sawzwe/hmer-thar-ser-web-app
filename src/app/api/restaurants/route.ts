import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { transformDbRestaurant } from "@/lib/restaurants/transform";

export async function GET() {
  try {
    const supabase = await createClient();

    // Try with deals first; fall back to restaurants only if join fails (e.g. RLS on deals)
    let rows: Record<string, unknown>[] | null = null;

    const { data: withDeals, error: err1 } = await supabase
      .from("restaurants")
      .select(
        "*, deals(id, title, type, description, price, discount, discount_pct, conditions)",
      )
      .eq("status", "active")
      .order("name");

    if (!err1 && withDeals) {
      rows = withDeals;
    } else {
      const { data: noDeals, error: err2 } = await supabase
        .from("restaurants")
        .select("*")
        .eq("status", "active")
        .order("name");
      if (err2) throw err2;
      rows = noDeals;
    }

    if (!rows) throw new Error("No data returned from Supabase");

    const restaurants = rows.map((row) => {
      const deals = (row.deals ?? []) as {
        id: string;
        title: string;
        type: string;
        description: string;
        price?: number;
        discount?: number;
        discount_pct?: number;
        conditions?: string;
      }[];
      return transformDbRestaurant(
        row as Parameters<typeof transformDbRestaurant>[0],
        {
          deals: Array.isArray(deals) ? deals.filter((d) => d && d.id) : [],
        },
      );
    });

    return NextResponse.json(restaurants);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 },
    );
  }
}
