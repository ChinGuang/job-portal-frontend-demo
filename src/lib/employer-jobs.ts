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
  salaryMin?: number;
  salaryMax?: number;
  currency?: string;
}

export type UpdateJobInput = Partial<CreateJobInput>;

const jobPath = (id: string) => `/jobs/${encodeURIComponent(id)}`;

/** List the current employer's own jobs, including drafts and archived. */
export function listMyJobs(): Promise<Paginated<Job>> {
  return api.get<Paginated<Job>>("/jobs/mine");
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
