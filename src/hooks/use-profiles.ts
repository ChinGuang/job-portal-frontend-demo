"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-provider";
import { ApiError } from "@/lib/api-error";
import {
  createEmployerProfile,
  createJobSeekerProfile,
  getEmployerProfile,
  getJobSeekerProfile,
  updateEmployerProfile,
  updateJobSeekerProfile,
  type EmployerProfile,
  type EmployerProfileInput,
  type JobSeekerProfile,
  type JobSeekerProfileInput,
} from "@/lib/profiles";

/** A missing profile is a normal state (404), not a query error. */
async function orNull<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export function useJobSeekerProfile(): UseQueryResult<JobSeekerProfile | null> {
  const { session } = useAuth();
  return useQuery({
    queryKey: ["profile", "job-seeker", session?.user.id],
    queryFn: () => orNull(getJobSeekerProfile()),
    enabled: Boolean(session),
  });
}

export function useEmployerProfile(): UseQueryResult<EmployerProfile | null> {
  const { session } = useAuth();
  return useQuery({
    queryKey: ["profile", "employer", session?.user.id],
    queryFn: () => orNull(getEmployerProfile()),
    enabled: Boolean(session),
  });
}

/**
 * Save the job-seeker profile: POST to create, PATCH to update. On success the
 * profile and `me` queries are invalidated so the dashboard's unlocked
 * capabilities refresh.
 */
export function useSaveJobSeekerProfile(exists: boolean) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: JobSeekerProfileInput) =>
      exists ? updateJobSeekerProfile(input) : createJobSeekerProfile(input),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile", "job-seeker"], data);
      void queryClient.invalidateQueries({ queryKey: ["profile", "job-seeker"] });
      void queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useSaveEmployerProfile(exists: boolean) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: EmployerProfileInput) =>
      exists ? updateEmployerProfile(input) : createEmployerProfile(input),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile", "employer"], data);
      void queryClient.invalidateQueries({ queryKey: ["profile", "employer"] });
      void queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });
}
