"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAuth } from "./auth-provider";

/**
 * Gate for authenticated pages: while the session resolves it shows a spinner;
 * once resolved without a session it redirects to login (preserving where the
 * user was headed via a `redirect` param).
 */
export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { session, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !session) {
      // Preserve the full path + query the user was headed to.
      const here = window.location.pathname + window.location.search;
      router.replace(`/login?redirect=${encodeURIComponent(here)}`);
    }
  }, [loading, session, router]);

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" aria-label="Loading" />
      </div>
    );
  }

  if (!session) return null;

  return <>{children}</>;
}
