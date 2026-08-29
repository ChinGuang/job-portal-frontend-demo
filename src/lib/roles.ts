/** Which profiles an account currently holds (its unlocked capabilities). */
export interface ProfileCapabilities {
  hasJobSeeker: boolean;
  hasEmployer: boolean;
}

/** The two capabilities an account can hold. */
export type Role = "job-seeker" | "employer";

export const ROLES: readonly Role[] = ["job-seeker", "employer"] as const;

export function isRole(value: unknown): value is Role {
  return value === "job-seeker" || value === "employer";
}

export const ROLE_LABELS: Record<Role, string> = {
  "job-seeker": "Job seeker",
  employer: "Employer",
};

/**
 * Decide the active role from which profiles exist and a stored preference.
 *
 * - No profile → `null` (nothing to act as).
 * - Exactly one profile → that role, regardless of any stale stored value.
 * - Both profiles → the stored preference when valid, otherwise `job-seeker`.
 */
export function resolveActiveRole(
  capabilities: ProfileCapabilities,
  stored: string | null | undefined,
): Role | null {
  const available = ROLES.filter((role) =>
    role === "job-seeker" ? capabilities.hasJobSeeker : capabilities.hasEmployer,
  );

  if (available.length === 0) return null;
  if (available.length === 1) return available[0];

  return isRole(stored) ? stored : "job-seeker";
}
