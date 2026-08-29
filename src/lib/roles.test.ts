import { describe, expect, it } from "vitest";
import { resolveActiveRole } from "./roles";

const NEITHER = { hasJobSeeker: false, hasEmployer: false };
const ONLY_SEEKER = { hasJobSeeker: true, hasEmployer: false };
const ONLY_EMPLOYER = { hasJobSeeker: false, hasEmployer: true };
const BOTH = { hasJobSeeker: true, hasEmployer: true };

describe("resolveActiveRole", () => {
  it("returns null when no profile exists", () => {
    expect(resolveActiveRole(NEITHER, null)).toBeNull();
    expect(resolveActiveRole(NEITHER, "job-seeker")).toBeNull();
  });

  it("returns the only role that exists, ignoring a stale stored value", () => {
    expect(resolveActiveRole(ONLY_SEEKER, null)).toBe("job-seeker");
    expect(resolveActiveRole(ONLY_SEEKER, "employer")).toBe("job-seeker");
    expect(resolveActiveRole(ONLY_EMPLOYER, "job-seeker")).toBe("employer");
  });

  it("honors a valid stored preference when both profiles exist", () => {
    expect(resolveActiveRole(BOTH, "employer")).toBe("employer");
    expect(resolveActiveRole(BOTH, "job-seeker")).toBe("job-seeker");
  });

  it("defaults to job-seeker when both exist and nothing is stored", () => {
    expect(resolveActiveRole(BOTH, null)).toBe("job-seeker");
  });

  it("falls back to a valid role when the stored value is garbage", () => {
    expect(resolveActiveRole(BOTH, "nonsense")).toBe("job-seeker");
    expect(resolveActiveRole(ONLY_EMPLOYER, "nonsense")).toBe("employer");
  });
});
