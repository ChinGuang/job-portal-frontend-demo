"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-provider";
import {
  archiveJob,
  createJob,
  updateJob,
  updateJobStatus,
  type CreateJobInput,
  type UpdateJobInput,
} from "@/lib/employer-jobs";
import { listMyJobs } from "@/lib/employer-jobs";
import type { JobStatus } from "@/types/job";

/** Query the employer's own jobs (drafts + archived included). */
export function useMyJobs() {
  const { session } = useAuth();
  return useQuery({
    queryKey: ["jobs", "mine", session?.user.id],
    queryFn: listMyJobs,
    enabled: Boolean(session),
  });
}

function useInvalidateJobs() {
  const queryClient = useQueryClient();
  return () => {
    void queryClient.invalidateQueries({ queryKey: ["jobs", "mine"] });
    // Public browse and single-job caches may now be stale too.
    void queryClient.invalidateQueries({ queryKey: ["jobs"] });
  };
}

export function useCreateJob() {
  const invalidate = useInvalidateJobs();
  return useMutation({
    mutationFn: (input: CreateJobInput) => createJob(input),
    onSuccess: invalidate,
  });
}

export function useUpdateJob(id: string) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateJobs();
  return useMutation({
    mutationFn: (input: UpdateJobInput) => updateJob(id, input),
    onSuccess: (data) => {
      queryClient.setQueryData(["job", id], data);
      invalidate();
    },
  });
}

export function useUpdateJobStatus(id: string) {
  const queryClient = useQueryClient();
  const invalidate = useInvalidateJobs();
  return useMutation({
    mutationFn: (status: JobStatus) => updateJobStatus(id, status),
    onSuccess: (data) => {
      queryClient.setQueryData(["job", id], data);
      invalidate();
    },
  });
}

export function useArchiveJob(id: string) {
  const invalidate = useInvalidateJobs();
  return useMutation({
    mutationFn: () => archiveJob(id),
    onSuccess: invalidate,
  });
}
