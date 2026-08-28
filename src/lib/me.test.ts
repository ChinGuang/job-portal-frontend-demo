import { describe, expect, it } from "vitest";
import { deriveCapabilities } from "./me";

describe("deriveCapabilities", () => {
  it("returns no capabilities for a missing payload", () => {
    expect(deriveCapabilities(null)).toEqual({
      hasJobSeeker: false,
      hasEmployer: false,
    });
    expect(deriveCapabilities(undefined)).toEqual({
      hasJobSeeker: false,
      hasEmployer: false,
    });
  });

  it("reads a nested profiles object", () => {
    expect(
      deriveCapabilities({ profiles: { jobSeeker: true, employer: false } }),
    ).toEqual({ hasJobSeeker: true, hasEmployer: false });
  });

  it("reads has*Profile booleans", () => {
    expect(
      deriveCapabilities({
        hasJobSeekerProfile: false,
        hasEmployerProfile: true,
      }),
    ).toEqual({ hasJobSeeker: false, hasEmployer: true });
  });

  it("treats an embedded profile object as existence", () => {
    expect(
      deriveCapabilities({
        jobSeekerProfile: { id: "js-1" },
        employerProfile: null,
      }),
    ).toEqual({ hasJobSeeker: true, hasEmployer: false });
  });

  it("honors an explicit false over a fallback object check", () => {
    expect(
      deriveCapabilities({ profiles: { jobSeeker: false } }),
    ).toEqual({ hasJobSeeker: false, hasEmployer: false });
  });

  it("supports an account holding both profiles", () => {
    expect(
      deriveCapabilities({
        hasJobSeekerProfile: true,
        hasEmployerProfile: true,
      }),
    ).toEqual({ hasJobSeeker: true, hasEmployer: true });
  });

  it("defaults to false when nothing indicates a profile", () => {
    expect(deriveCapabilities({ id: "u1", email: "a@b.com" })).toEqual({
      hasJobSeeker: false,
      hasEmployer: false,
    });
  });
});
