import { create } from "zustand";
import { createClient } from "@/lib/supabase/client";
import { UserFactory } from "@/lib/auth/UserFactory";
import type { IUser } from "@/lib/auth/types";

let authSubscription: { unsubscribe: () => void } | null = null;
let visibilityHandler: (() => void) | null = null;

interface AuthState {
  user: IUser | null;
  loading: boolean;
  initialized: boolean;

  initialize: () => Promise<void>;
  signIn: (
    email: string,
    password: string,
  ) => Promise<{ error?: string; code?: string }>;
  signUp: (
    email: string,
    password: string,
    name: string,
  ) => Promise<{ error?: string; code?: string }>;
  signOut: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  loading: false,
  initialized: false,

  initialize: async () => {
    if (get().initialized) return;

    set({ loading: true });
    const supabase = createClient();

    const user = await UserFactory.fromSupabase(supabase);
    set({ user, loading: false, initialized: true });

    if (authSubscription) {
      authSubscription.unsubscribe();
    }

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_OUT" || !session?.user) {
        set({ user: UserFactory.createGuest(), loading: false });
        return;
      }

      set({ loading: true });
      try {
        const resolved = await UserFactory.resolveUser(supabase, session.user);
        set({ user: resolved, loading: false });
      } catch {
        set({ user: UserFactory.createGuest(), loading: false });
      }
    });
    authSubscription = subscription;

    if (visibilityHandler) {
      document.removeEventListener("visibilitychange", visibilityHandler);
    }
    visibilityHandler = () => {
      if (document.visibilityState !== "visible") return;
      supabase.auth.getUser().then(async ({ data }) => {
        const current = get().user;
        const newId = data?.user?.id ?? null;
        const oldId = current?.isAuthenticated() ? current.id : null;
        if (newId === oldId) return;

        if (!data?.user) {
          set({ user: UserFactory.createGuest() });
          return;
        }
        try {
          const resolved = await UserFactory.resolveUser(supabase, data.user);
          set({ user: resolved });
        } catch {
          /* keep current */
        }
      });
    };
    document.addEventListener("visibilitychange", visibilityHandler);
  },

  signIn: async (email, password) => {
    set({ loading: true });
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) {
      set({ loading: false });
      return { error: error.message, code: error.code };
    }
    return {};
  },

  signUp: async (email, password, name) => {
    set({ loading: true });
    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });
    if (error) {
      set({ loading: false });
      return { error: error.message, code: error.code };
    }
    return {};
  },

  signOut: async () => {
    set({ loading: true });
    const supabase = createClient();
    await supabase.auth.signOut();
    set({ user: UserFactory.createGuest(), loading: false });
  },
}));
