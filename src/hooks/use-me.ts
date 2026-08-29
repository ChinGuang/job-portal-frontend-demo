"use client";

import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-provider";
import { fetchMe } from "@/lib/me";

/** Query `GET /me` for the signed-in account; disabled while logged out. */
export function useMe() {
  const { session } = useAuth();
  return useQuery({
    queryKey: ["me", session?.user.id],
    queryFn: fetchMe,
    enabled: Boolean(session),
  });
}
