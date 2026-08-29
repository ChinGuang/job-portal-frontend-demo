import { api } from "./api-client";
import type { Job, JobStatus, Paginated } from "@/types/job";

/** Job types the backend accepts on create/update (note: no TEMPORARY). */
export type EmployerJobType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "INTERNSHIP";

export const EMPLOYER_JOB_TYPES: { value: EmployerJobType; label: string }[] = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
];

export interface CreateJobInput {
  title: string;
  description: string;
  requirements: string[];
  location: string;
  jobType: EmployerJobType;
  // `null` clears a previously-set value on update; omitted on create.
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency?: string | null;
}

export type UpdateJobInput = Partial<CreateJobInput>;

/** Coerce an arbitrary job type to one the create/update form supports. */
export function toEmployerJobType(value: string | undefined): EmployerJobType {
  return EMPLOYER_JOB_TYPES.some((t) => t.value === value)
    ? (value as EmployerJobType)
    : EMPLOYER_JOB_TYPES[0].value;
}

const jobPath = (id: string) => `/jobs/${encodeURIComponent(id)}`;

/**
 * List ALL of the current employer's own jobs, including drafts and archived.
 * `/jobs/mine` is paginated (default page ~20), so this walks every page via
 * offset/limit to return the complete set — the employer must see all listings.
 */
export async function listMyJobs(): Promise<Paginated<Job>> {
  const limit = 50;
  const first = await api.get<Paginated<Job>>("/jobs/mine", {
    query: { limit, offset: 0 },
  });
  const items = [...first.items];
  while (items.length < first.total) {
    const next = await api.get<Paginated<Job>>("/jobs/mine", {
      query: { limit, offset: items.length },
    });
    if (next.items.length === 0) break; // guard against a stuck offset
    items.push(...next.items);
  }
  return { items, total: first.total };
}

export function createJob(input: CreateJobInput): Promise<Job> {
  return api.post<Job>("/jobs", input);
}

export function updateJob(id: string, input: UpdateJobInput): Promise<Job> {
  return api.patch<Job>(jobPath(id), input);
}

export function updateJobStatus(id: string, status: JobStatus): Promise<Job> {
  return api.patch<Job>(`${jobPath(id)}/status`, { status });
}

/** Archive (soft-delete) a job. Returns the archived job. */
export function archiveJob(id: string): Promise<Job> {
  return api.delete<Job>(jobPath(id));
}
