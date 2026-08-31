import { api } from "./api-client";
import { ApiError } from "./api-error";
import { LOCALE } from "./jobs";
import type { Job, Paginated } from "@/types/job";

export type ApplicationStatus =
  | "SUBMITTED"
  | "REVIEWED"
  | "OFFERED"
  | "REJECTED";

export interface Application {
  id: string;
  jobId: string;
  jobSeekerProfileId: string;
  coverLetter?: string | null;
  resumeUrl: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

/** Application detail embeds the full job. */
export interface ApplicationDetail extends Application {
  job: Job;
}

export interface CreateApplicationInput {
  coverLetter?: string;
  resumeUrl?: string;
}

export const APPLICATION_STATUS_META: Record<
  ApplicationStatus,
  { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
> = {
  SUBMITTED: { label: "Submitted", variant: "secondary" },
  REVIEWED: { label: "Reviewed", variant: "default" },
  OFFERED: { label: "Offered", variant: "default" },
  REJECTED: { label: "Rejected", variant: "outline" },
};

/**
 * Turn an apply failure into a clear, user-facing message. 409 always means a
 * duplicate application; for 400/403 the backend's own message (e.g. the résumé
 * rule) is preferred, with sensible fallbacks.
 */
export function describeApplyError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.status) {
      case 409:
        return "You've already applied to this job.";
      case 404:
        return "This job is no longer available.";
      case 403:
        return error.message || "You're not able to apply to this job.";
      case 400:
        return (
          error.message ||
          "We couldn't submit your application. Make sure your profile has a résumé."
        );
    }
  }
  return error instanceof Error
    ? error.message
    : "Something went wrong submitting your application.";
}

/** Format an application's date for display (localized), or "" if invalid. */
export function formatAppliedDate(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString(LOCALE, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
}

// --- API ---------------------------------------------------------------------

export function applyToJob(
  jobId: string,
  input: CreateApplicationInput,
): Promise<Application> {
  return api.post<Application>(
    `/jobs/${encodeURIComponent(jobId)}/applications`,
    input,
  );
}

export function getApplication(id: string): Promise<ApplicationDetail> {
  return api.get<ApplicationDetail>(`/applications/${encodeURIComponent(id)}`);
}

/**
 * List ALL of the seeker's own applications. `/applications/mine` is paginated,
 * so this walks every page via offset/limit to return the complete set.
 */
export async function listMyApplications(): Promise<Paginated<Application>> {
  const limit = 50;
  const first = await api.get<Paginated<Application>>("/applications/mine", {
    query: { limit, offset: 0 },
  });
  const items = [...first.items];
  while (items.length < first.total) {
    const next = await api.get<Paginated<Application>>("/applications/mine", {
      query: { limit, offset: items.length },
    });
    if (next.items.length === 0) break;
    items.push(...next.items);
  }
  return { items, total: first.total };
}
