"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-provider";
import {
  listJobApplicants,
  updateApplicationStatus,
} from "@/lib/applicant-review";
import type { ApplicationStatus } from "@/lib/applications";

/** Query a job's applicants, optionally filtered by status. */
export function useJobApplicants(jobId: string, status?: ApplicationStatus) {
  const { session } = useAuth();
  return useQuery({
    queryKey: ["applicants", jobId, status ?? "ALL"],
    queryFn: () => listJobApplicants(jobId, status),
    enabled: Boolean(session) && jobId.length > 0,
  });
}

/**
 * Advance an application's status. Invalidates every status view for the job so
 * a moved applicant leaves/enters the relevant filter.
 */
export function useUpdateApplicantStatus(jobId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: ApplicationStatus;
    }) => updateApplicationStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["applicants", jobId] });
    },
  });
}
