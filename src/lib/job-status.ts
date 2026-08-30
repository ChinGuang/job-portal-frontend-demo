import type { JobStatus } from "@/types/job";

/** A status change offered to the employer, with a verb label. */
export interface StatusAction {
  to: JobStatus;
  label: string;
}

/**
 * Status transitions reachable via `PATCH /jobs/:id/status`, mirroring the
 * backend state machine: DRAFT → PUBLISHED → CLOSED, forward only. Unpublish
 * (PUBLISHED → DRAFT) and reopen (CLOSED → PUBLISHED) are not allowed. ARCHIVED
 * is terminal and reached only via archive (soft-delete), not a status change.
 * The backend is the final authority (it returns 409 on an invalid transition);
 * this drives which buttons to show.
 */
const TRANSITIONS: Record<JobStatus, StatusAction[]> = {
  DRAFT: [{ to: "PUBLISHED", label: "Publish" }],
  PUBLISHED: [{ to: "CLOSED", label: "Close" }],
  CLOSED: [],
  ARCHIVED: [],
};

export function statusActions(status: JobStatus): StatusAction[] {
  return TRANSITIONS[status];
}

export function canTransitionStatus(from: JobStatus, to: JobStatus): boolean {
  return TRANSITIONS[from].some((action) => action.to === to);
}

/** Human labels for a status badge. */
export const STATUS_LABELS: Record<JobStatus, string> = {
  DRAFT: "Draft",
  PUBLISHED: "Published",
  CLOSED: "Closed",
  ARCHIVED: "Archived",
};

/** Parse a requirements textarea (one per line): trim, drop blanks, keep order + duplicates. */
export function parseRequirements(input: string): string[] {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.length > 0);
}

/** Render a requirements list back into editable newline-separated text. */
export function formatRequirements(requirements: string[] | undefined | null): string {
  return (requirements ?? []).join("\n");
}
