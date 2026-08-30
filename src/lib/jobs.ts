import { api } from "./api-client";
import type { Job, JobType, Paginated } from "@/types/job";

/** Listings requested per page of public browsing. */
export const JOBS_PAGE_SIZE = 10;

/** Locale and default currency for display formatting (Malaysia). */
export const LOCALE = "en-MY";
export const DEFAULT_CURRENCY = "MYR";

/** Selectable job types for the browse filter, in display order. */
export const JOB_TYPES: { value: JobType; label: string }[] = [
  { value: "FULL_TIME", label: "Full-time" },
  { value: "PART_TIME", label: "Part-time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERNSHIP", label: "Internship" },
  { value: "TEMPORARY", label: "Temporary" },
];

const JOB_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  JOB_TYPES.map((t) => [t.value, t.label]),
);

/** Filters that drive the public `GET /jobs` browse endpoint. `page` is 1-based. */
export interface JobFilters {
  q?: string;
  jobType?: string;
  location?: string;
  page?: number;
}

/**
 * Translate UI filters into backend query params: trims text, drops empty
 * values, and converts the 1-based page into offset/limit pagination.
 */
export function buildJobsQuery(
  filters: JobFilters,
): Record<string, string | number | undefined> {
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const q = filters.q?.trim();
  const location = filters.location?.trim();
  return {
    q: q ? q : undefined,
    jobType: filters.jobType ? filters.jobType : undefined,
    location: location ? location : undefined,
    limit: JOBS_PAGE_SIZE,
    offset: (page - 1) * JOBS_PAGE_SIZE,
  };
}

/** Total number of pages for a result count (never below 1). */
export function totalPages(total: number, pageSize = JOBS_PAGE_SIZE): number {
  if (total <= 0) return 1;
  return Math.max(1, Math.ceil(total / pageSize));
}

/**
 * Normalize a user-entered website into an absolute URL so it opens externally.
 * A value lacking a scheme (e.g. "acme.io") would otherwise resolve relative to
 * the current page; `https://` is prepended in that case.
 */
export function toExternalUrl(url: string): string {
  const trimmed = url.trim();
  if (!trimmed) return trimmed;
  return /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

/** Human label for a job type, tolerant of unknown values from the backend. */
export function formatJobType(type: string): string {
  if (JOB_TYPE_LABELS[type]) return JOB_TYPE_LABELS[type];
  const lower = type.replace(/_/g, " ").toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

type SalaryFields = Pick<Job, "salaryMin" | "salaryMax" | "currency">;

/** Format a salary range, or null when no bounds are present. */
export function formatSalary(job: SalaryFields): string | null {
  const { salaryMin, salaryMax } = job;
  if (salaryMin == null && salaryMax == null) return null;

  const currency = job.currency || DEFAULT_CURRENCY;
  const format = (amount: number): string => {
    try {
      return new Intl.NumberFormat(LOCALE, {
        style: "currency",
        currency,
        maximumFractionDigits: 0,
      }).format(amount);
    } catch {
      // Fall back gracefully if the backend sends a non-ISO currency code.
      return `${amount.toLocaleString(LOCALE)} ${currency}`;
    }
  };

  if (salaryMin != null && salaryMax != null) {
    return `${format(salaryMin)} – ${format(salaryMax)}`;
  }
  if (salaryMin != null) return `From ${format(salaryMin)}`;
  return `Up to ${format(salaryMax as number)}`;
}

/** Fetch a page of published listings. */
export function listJobs(filters: JobFilters): Promise<Paginated<Job>> {
  return api.get<Paginated<Job>>("/jobs", { query: buildJobsQuery(filters) });
}

/** Fetch a single listing (published or closed) with its company profile. */
export function getJob(id: string): Promise<Job> {
  return api.get<Job>(`/jobs/${encodeURIComponent(id)}`);
}
