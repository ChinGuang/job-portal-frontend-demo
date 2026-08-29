"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  MutationCache,
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { ApiError } from "@/lib/api-error";
import {
  notifyUnauthorized,
  setUnauthorizedHandler,
} from "@/lib/unauthorized";
import { AuthProvider, useAuth } from "@/components/auth/auth-provider";
import { ActiveRoleProvider } from "@/components/profile/active-role-provider";

function makeQueryClient(): QueryClient {
  // Any 401 from the backend means the token is missing/expired: hand off to the
  // registered handler (sign out + redirect).
  const handleError = (error: unknown) => {
    if (error instanceof ApiError && error.status === 401) {
      notifyUnauthorized();
    }
  };
  return new QueryClient({
    queryCache: new QueryCache({ onError: handleError }),
    mutationCache: new MutationCache({ onError: handleError }),
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        // Never retry a deterministic 4xx; retry other failures once.
        retry: (failureCount, error) => {
          if (
            error instanceof ApiError &&
            error.status >= 400 &&
            error.status < 500
          ) {
            return false;
          }
          return failureCount < 1;
        },
        refetchOnWindowFocus: false,
      },
    },
  });
}

function QueryProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { signOut } = useAuth();
  const [queryClient] = useState(makeQueryClient);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      void signOut().finally(() => router.replace("/login"));
    });
    return () => setUnauthorizedHandler(null);
  }, [signOut, router]);

  return (
    <QueryClientProvider client={queryClient}>
      <ActiveRoleProvider>{children}</ActiveRoleProvider>
    </QueryClientProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <QueryProvider>{children}</QueryProvider>
    </AuthProvider>
  );
}
