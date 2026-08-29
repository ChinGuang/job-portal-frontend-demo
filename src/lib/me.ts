import { api } from "./api-client";

/**
 * Response of `GET /me`. The doc guarantees "the mirrored user record and which
 * profiles exist" but not the exact keys, so this type is permissive and the
 * profile-existence signal is normalized by {@link deriveCapabilities}.
 */
export interface MeResponse {
  id?: string;
  email?: string;
  provider?: string;
  createdAt?: string;

  // Possible shapes for "which profiles exist":
  profiles?: { jobSeeker?: boolean; employer?: boolean };
  hasJobSeekerProfile?: boolean;
  hasEmployerProfile?: boolean;
  jobSeekerProfile?: unknown;
  employerProfile?: unknown;
}

/** Whether the account currently holds each profile (its unlocked capabilities). */
export interface ProfileCapabilities {
  hasJobSeeker: boolean;
  hasEmployer: boolean;
}

function resolveFlag(
  boolCandidates: (boolean | undefined)[],
  objectCandidate: unknown,
): boolean {
  for (const candidate of boolCandidates) {
    if (typeof candidate === "boolean") return candidate;
  }
  return objectCandidate != null;
}

/**
 * Derive which profiles an account holds from a `GET /me` payload, tolerating
 * the several plausible response shapes (nested `profiles`, `has*Profile`
 * booleans, or an embedded profile object).
 */
export function deriveCapabilities(
  me: MeResponse | null | undefined,
): ProfileCapabilities {
  if (!me) return { hasJobSeeker: false, hasEmployer: false };
  return {
    hasJobSeeker: resolveFlag(
      [me.profiles?.jobSeeker, me.hasJobSeekerProfile],
      me.jobSeekerProfile,
    ),
    hasEmployer: resolveFlag(
      [me.profiles?.employer, me.hasEmployerProfile],
      me.employerProfile,
    ),
  };
}

/** Fetch the current user's mirrored record and profile existence. */
export function fetchMe(): Promise<MeResponse> {
  return api.get<MeResponse>("/me");
}
