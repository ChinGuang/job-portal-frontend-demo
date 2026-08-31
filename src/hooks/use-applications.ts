"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-provider";
import {
  applyToJob,
  getApplication,
  listMyApplications,
  type CreateApplicationInput,
} from "@/lib/applications";

/** Query the seeker's own applications (all pages). */
export function useMyApplications() {
  const { session } = useAuth();
  return useQuery({
    queryKey: ["applications", "mine", session?.user.id],
    queryFn: listMyApplications,
    enabled: Boolean(session),
  });
}

/** Query a single application's detail (includes the job). */
export function useApplication(id: string) {
  const { session } = useAuth();
  return useQuery({
    queryKey: ["application", id],
    queryFn: () => getApplication(id),
    enabled: Boolean(session) && id.length > 0,
  });
}

/** Apply to a job. Invalidates the applications list on success. */
export function useApplyToJob(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateApplicationInput) => applyToJob(jobId, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["applications", "mine"] });
    },
  });
}
