import { api } from "./api-client";
import type { ApplicationStatus } from "./applications";
import type { Paginated } from "@/types/job";

/** Applicant profile summary embedded in an application review item. */
export interface ApplicantProfile {
  id: string;
  name: string;
  headline?: string | null;
  bio?: string | null;
  phone?: string | null;
  skills: string[];
  yearsOfExperience?: number | null;
}

/** An application as seen by the employer reviewing a listing. */
export interface ReviewApplication {
  id: string;
  jobId: string;
  jobSeekerProfileId: string;
  coverLetter?: string | null;
  resumeUrl: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
  jobSeekerProfile: ApplicantProfile;
}

export interface ApplicantStatusAction {
  to: ApplicationStatus;
  label: string;
}

/**
 * Hiring pipeline reachable via `PATCH /applications/:id/status`:
 * SUBMITTED → REVIEWED → OFFERED | REJECTED. OFFERED and REJECTED are terminal.
 * The backend is the final authority (409 on an invalid move); this drives the
 * buttons shown.
 */
const TRANSITIONS: Record<ApplicationStatus, ApplicantStatusAction[]> = {
  SUBMITTED: [{ to: "REVIEWED", label: "Mark reviewed" }],
  REVIEWED: [
    { to: "OFFERED", label: "Make offer" },
    { to: "REJECTED", label: "Reject" },
  ],
  OFFERED: [],
  REJECTED: [],
};

export function applicantStatusActions(
  status: ApplicationStatus,
): ApplicantStatusAction[] {
  return TRANSITIONS[status];
}

export function canTransitionApplication(
  from: ApplicationStatus,
  to: ApplicationStatus,
): boolean {
  return TRANSITIONS[from].some((action) => action.to === to);
}

// --- API ---------------------------------------------------------------------

/**
 * List ALL applicants for a job, optionally filtered by status (server-side).
 * `/jobs/:id/applications` is paginated, so this walks every page.
 */
export async function listJobApplicants(
  jobId: string,
  status?: ApplicationStatus,
): Promise<Paginated<ReviewApplication>> {
  const limit = 50;
  const path = `/jobs/${encodeURIComponent(jobId)}/applications`;
  const first = await api.get<Paginated<ReviewApplication>>(path, {
    query: { status, limit, offset: 0 },
  });
  const items = [...first.items];
  while (items.length < first.total) {
    const next = await api.get<Paginated<ReviewApplication>>(path, {
      query: { status, limit, offset: items.length },
    });
    if (next.items.length === 0) break;
    items.push(...next.items);
  }
  return { items, total: first.total };
}

export function updateApplicationStatus(
  id: string,
  status: ApplicationStatus,
): Promise<ReviewApplication> {
  return api.patch<ReviewApplication>(
    `/applications/${encodeURIComponent(id)}/status`,
    { status },
  );
}

/** Fetch a short-lived signed URL to view an applicant's résumé. */
export function getApplicationResumeUrl(id: string): Promise<{ resumeUrl: string }> {
  return api.get<{ resumeUrl: string }>(
    `/applications/${encodeURIComponent(id)}/resume`,
  );
}
