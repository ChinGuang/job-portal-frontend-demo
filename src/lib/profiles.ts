import { api } from "./api-client";

// --- Job-seeker profile -----------------------------------------------------

export interface JobSeekerProfile {
  name: string;
  headline: string;
  bio: string;
  phone: string;
  skills: string[];
  yearsOfExperience: number;
}

export type JobSeekerProfileInput = JobSeekerProfile;

// --- Employer profile -------------------------------------------------------

export const EMPLOYER_SIZES = [
  "1-10",
  "11-50",
  "51-200",
  "201-500",
  "500+",
] as const;

export type EmployerSize = (typeof EMPLOYER_SIZES)[number];

export interface EmployerProfile {
  companyName: string;
  website: string;
  industry: string;
  size: string;
  description: string;
  address: string;
}

export type EmployerProfileInput = EmployerProfile;

// --- Skills helpers (pure, unit-tested) -------------------------------------

/**
 * Parse a free-text skills field (comma- or newline-separated) into a clean
 * list: trimmed, empties removed, de-duplicated case-insensitively while keeping
 * the first-seen casing.
 */
export function parseSkills(input: string): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const raw of input.split(/[,\n]/)) {
    const skill = raw.trim();
    if (!skill) continue;
    const key = skill.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(skill);
  }
  return result;
}

/** Render a skills list back into an editable comma-separated string. */
export function formatSkills(skills: string[] | undefined | null): string {
  return (skills ?? []).join(", ");
}

// --- API ---------------------------------------------------------------------

export const getJobSeekerProfile = () =>
  api.get<JobSeekerProfile>("/profiles/job-seeker");

export const createJobSeekerProfile = (input: JobSeekerProfileInput) =>
  api.post<JobSeekerProfile>("/profiles/job-seeker", input);

export const updateJobSeekerProfile = (input: JobSeekerProfileInput) =>
  api.patch<JobSeekerProfile>("/profiles/job-seeker", input);

export const getEmployerProfile = () =>
  api.get<EmployerProfile>("/profiles/employer");

export const createEmployerProfile = (input: EmployerProfileInput) =>
  api.post<EmployerProfile>("/profiles/employer", input);

export const updateEmployerProfile = (input: EmployerProfileInput) =>
  api.patch<EmployerProfile>("/profiles/employer", input);
