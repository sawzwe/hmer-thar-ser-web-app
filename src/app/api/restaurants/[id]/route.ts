import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { transformDbRestaurant } from "@/lib/restaurants/transform";
import type { MenuCategory } from "@/types";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = await createClient();

    const { data: restaurant, error: rErr } = await supabase
      .from("restaurants")
      .select("*")
      .eq("id", id)
      .eq("status", "active")
      .single();

    if (rErr || !restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    const [dealsRes, menuRes, reviewsRes] = await Promise.all([
      supabase.from("deals").select("id, title, type, description, price, discount, discount_pct, conditions").eq("restaurant_id", id),
      supabase
        .from("menu_categories")
        .select("id, name, sort_order, menu_items(id, name, description, price, sort_order)")
        .eq("restaurant_id", id)
        .order("sort_order"),
      supabase.from("reviews").select("rating").eq("restaurant_id", id),
    ]);

    const deals = (dealsRes.data ?? []) as { id: string; title: string; type: string; description: string; price?: number; discount?: number; discount_pct?: number; conditions?: string }[];
    const categories = (menuRes.data ?? []) as { id: string; name: string; sort_order: number; menu_items?: { id: string; name: string; description?: string; price: number; sort_order: number }[] }[];
    const reviews = reviewsRes.data ?? [];

    const menu: MenuCategory[] = categories
      .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
      .map((cat) => ({
        name: cat.name,
        items: (cat.menu_items ?? [])
          .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))
          .map((item) => ({
            name: item.name,
            description: item.description ?? undefined,
            price: item.price,
          })),
      }));

    const reviewCount = reviews.length;
    const avgRating =
      reviewCount > 0
        ? Math.round((reviews.reduce((s, r) => s + (r as { rating: number }).rating, 0) / reviewCount) * 10) / 10
        : 0;

    const transformed = transformDbRestaurant(restaurant as Parameters<typeof transformDbRestaurant>[0], {
      deals,
      reviewCount,
      avgRating,
    });
    transformed.menu = menu;

    return NextResponse.json(transformed);
  } catch (err) {
    return NextResponse.json(
      { error: (err as Error).message },
      { status: 500 }
    );
  }
}
