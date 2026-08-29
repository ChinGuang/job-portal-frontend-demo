"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { Session, User } from "@supabase/supabase-js";
import { getSupabaseClient } from "@/lib/supabase";
import { setAuthTokenProvider } from "@/lib/api-client";

interface SignUpResult {
  error: string | null;
  /** True when Supabase created the user but requires email confirmation before a session exists. */
  needsConfirmation: boolean;
}

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  /** True until the initial session has been resolved. */
  loading: boolean;
  /** True when Supabase env is missing, so auth actions cannot run. */
  isConfigured: boolean;
  signIn(email: string, password: string): Promise<{ error: string | null }>;
  signUp(email: string, password: string): Promise<SignUpResult>;
  /**
   * Start the Google OAuth flow. On success the browser is redirected away, so
   * this only returns when there is an error before the redirect. `redirectPath`
   * is the internal path to land on after authentication.
   */
  signInWithGoogle(redirectPath?: string): Promise<{ error: string | null }>;
  signOut(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const supabase = useMemo(() => getSupabaseClient(), []);
  const [session, setSession] = useState<Session | null>(null);
  // Nothing to resolve when auth is not configured, so start ready in that case.
  const [loading, setLoading] = useState(() => supabase !== null);

  useEffect(() => {
    if (!supabase) return;

    // Every backend request pulls the current (auto-refreshed) access token.
    setAuthTokenProvider(async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token ?? null;
    });

    let active = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!active) return;
      setSession(data.session);
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => {
        setSession(nextSession);
      },
    );

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, [supabase]);

  const signIn = useCallback(
    async (email: string, password: string) => {
      if (!supabase) return { error: "Authentication is not configured." };
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error: error?.message ?? null };
    },
    [supabase],
  );

  const signUp = useCallback(
    async (email: string, password: string): Promise<SignUpResult> => {
      if (!supabase) {
        return {
          error: "Authentication is not configured.",
          needsConfirmation: false,
        };
      }
      const { data, error } = await supabase.auth.signUp({ email, password });
      return {
        error: error?.message ?? null,
        needsConfirmation: Boolean(data.user && !data.session),
      };
    },
    [supabase],
  );

  const signInWithGoogle = useCallback(
    async (redirectPath = "/dashboard") => {
      if (!supabase) return { error: "Authentication is not configured." };
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}${redirectPath}`,
        },
      });
      return { error: error?.message ?? null };
    },
    [supabase],
  );

  const signOut = useCallback(async () => {
    if (supabase) await supabase.auth.signOut();
    setSession(null);
  }, [supabase]);

  const value = useMemo<AuthContextValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      isConfigured: supabase !== null,
      signIn,
      signUp,
      signInWithGoogle,
      signOut,
    }),
    [session, loading, supabase, signIn, signUp, signInWithGoogle, signOut],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
