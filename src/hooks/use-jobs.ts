"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { getJob, listJobs, type JobFilters } from "@/lib/jobs";

/** Query a page of published listings; keeps the previous page visible while the next loads. */
export function useJobs(filters: JobFilters) {
  return useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => listJobs(filters),
    placeholderData: keepPreviousData,
  });
}

/** Query a single listing by id. */
export function useJob(id: string) {
  return useQuery({
    queryKey: ["job", id],
    queryFn: () => getJob(id),
    enabled: id.length > 0,
  });
}
