"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/components/auth/auth-provider";
import { uploadEmployerLogo, uploadJobSeekerResume } from "@/lib/uploads";

/**
 * Upload a résumé to the job-seeker profile. On success the returned profile
 * (with its new `resumeUrl`) replaces the cached profile so the UI reflects it.
 */
export function useUploadResume() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  return useMutation({
    mutationFn: (file: File) => uploadJobSeekerResume(file),
    onSuccess: (data) => {
      queryClient.setQueryData(
        ["profile", "job-seeker", session?.user.id],
        data,
      );
      void queryClient.invalidateQueries({ queryKey: ["profile", "job-seeker"] });
    },
  });
}

/** Upload a company logo (assumed endpoint — see uploadEmployerLogo). */
export function useUploadLogo() {
  const queryClient = useQueryClient();
  const { session } = useAuth();
  return useMutation({
    mutationFn: (file: File) => uploadEmployerLogo(file),
    onSuccess: (data) => {
      queryClient.setQueryData(["profile", "employer", session?.user.id], data);
      void queryClient.invalidateQueries({ queryKey: ["profile", "employer"] });
    },
  });
}
