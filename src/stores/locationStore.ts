import { create } from "zustand";

const LOCATION_KEY = "mher_thar_ser:user_location";

function getStored(): { lat: number; lng: number } | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(LOCATION_KEY);
    if (!v) return null;
    const parsed = JSON.parse(v) as { lat?: number; lng?: number };
    if (
      typeof parsed?.lat === "number" &&
      typeof parsed?.lng === "number" &&
      !Number.isNaN(parsed.lat) &&
      !Number.isNaN(parsed.lng)
    ) {
      return { lat: parsed.lat, lng: parsed.lng };
    }
  } catch {}
  return null;
}

interface LocationState {
  lat: number | null;
  lng: number | null;
  hydrate: () => void;
  setLocation: (lat: number, lng: number) => void;
  clearLocation: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  lat: null,
  lng: null,

  hydrate: () => {
    const stored = getStored();
    set(
      stored ? { lat: stored.lat, lng: stored.lng } : { lat: null, lng: null },
    );
  },

  setLocation: (lat, lng) => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(LOCATION_KEY, JSON.stringify({ lat, lng }));
      }
    } catch {}
    set({ lat, lng });
  },

  clearLocation: () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.removeItem(LOCATION_KEY);
      }
    } catch {}
    set({ lat: null, lng: null });
  },
}));
