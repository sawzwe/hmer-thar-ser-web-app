import type { Restaurant } from "@/types";

function getApiBase(): string {
  if (typeof window !== "undefined") return "";
  return process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
}

export async function fetchRestaurants(): Promise<Restaurant[]> {
  const res = await fetch(`${getApiBase()}/api/restaurants`);
  if (!res.ok) {
    const body = await res.text();
    let msg = `Failed to fetch restaurants (${res.status})`;
    try {
      const json = JSON.parse(body);
      if (json?.error) msg += `: ${json.error}`;
    } catch {
      if (body) msg += `: ${body.slice(0, 100)}`;
    }
    throw new Error(msg);
  }
  return res.json();
}

export async function fetchRestaurantById(id: string): Promise<Restaurant | null> {
  const res = await fetch(`${getApiBase()}/api/restaurants/${id}`);
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch restaurant");
  return res.json();
}

export async function searchRestaurants(query: string): Promise<Restaurant[]> {
  const data = await fetchRestaurants();
  const q = query.toLowerCase().trim();
  if (!q) return data;
  return data.filter(
    (r) =>
      r.name.toLowerCase().includes(q) ||
      r.area.toLowerCase().includes(q) ||
      r.cuisineTags.some((t) => t.toLowerCase().includes(q)) ||
      r.description.toLowerCase().includes(q)
  );
}
