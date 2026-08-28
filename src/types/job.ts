/**
 * Domain types for job listings and their employer.
 *
 * Field names mirror the backend API documentation. Where the doc describes a
 * field but not its exact JSON key (e.g. the embedded employer relation, salary
 * bounds), a reasonable key is chosen here and kept in one place so it is easy
 * to realign with the real backend.
 */

export type JobStatus = "DRAFT" | "PUBLISHED" | "CLOSED" | "ARCHIVED";

export type JobType =
  | "FULL_TIME"
  | "PART_TIME"
  | "CONTRACT"
  | "INTERNSHIP"
  | "TEMPORARY";

/** Employer/company profile shown alongside a listing. */
export interface EmployerProfileSummary {
  id: string;
  companyName: string;
  website?: string | null;
  logoUrl?: string | null;
  industry?: string | null;
  companySize?: string | null;
  description?: string | null;
  address?: string | null;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  requirements: string[];
  location: string;
  jobType: JobType;
  status: JobStatus;
  salaryMin?: number | null;
  salaryMax?: number | null;
  salaryCurrency?: string | null;
  employer?: EmployerProfileSummary | null;
  createdAt: string;
  updatedAt?: string;
}

/** Offset/limit pagination envelope: a page of items plus the overall total. */
export interface Paginated<T> {
  items: T[];
  total: number;
}
