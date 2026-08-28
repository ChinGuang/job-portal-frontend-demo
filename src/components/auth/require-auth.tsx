"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
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
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !session) {
      const target = `/login?redirect=${encodeURIComponent(pathname)}`;
      router.replace(target);
    }
  }, [loading, session, router, pathname]);

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
