import { create } from "zustand";

const ONBOARDED_KEY = "mher_thar_ser:onboarded";
const GUEST_EMAIL_KEY = "mher_thar_ser:guest_email";

function getOnboarded(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return localStorage.getItem(ONBOARDED_KEY) === "true";
  } catch {
    return false;
  }
}

function getStoredGuestEmail(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const v = localStorage.getItem(GUEST_EMAIL_KEY);
    return v && v.trim() ? v.trim() : null;
  } catch {
    return null;
  }
}

export type OnboardingStep = 1 | 2 | 3;

interface OnboardingState {
  onboarded: boolean;
  step: OnboardingStep;
  guestEmail: string | null;
  hydrate: () => void;
  setStep: (step: OnboardingStep) => void;
  setGuestEmail: (email: string | null) => void;
  completeOnboarding: () => void;
}

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  onboarded: false,
  step: 1,
  guestEmail: null,

  hydrate: () => {
    set({
      onboarded: getOnboarded(),
      guestEmail: getStoredGuestEmail(),
    });
  },

  setStep: (step) => set({ step }),

  setGuestEmail: (email) => {
    try {
      if (typeof window !== "undefined") {
        if (email && email.trim()) {
          localStorage.setItem(GUEST_EMAIL_KEY, email.trim());
        } else {
          localStorage.removeItem(GUEST_EMAIL_KEY);
        }
      }
    } catch {}
    set({ guestEmail: email?.trim() || null });
  },

  completeOnboarding: () => {
    try {
      if (typeof window !== "undefined") {
        localStorage.setItem(ONBOARDED_KEY, "true");
      }
    } catch {}
    set({ onboarded: true, step: 1 });
  },
}));
