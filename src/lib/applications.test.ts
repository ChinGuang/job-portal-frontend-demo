import { describe, expect, it } from "vitest";
import { ApiError } from "./api-error";
import { describeApplyError, formatAppliedDate } from "./applications";

describe("describeApplyError", () => {
  it("maps 409 to an already-applied message (ignoring the raw body)", () => {
    expect(describeApplyError(new ApiError(409, "Conflict"))).toBe(
      "You've already applied to this job.",
    );
  });

  it("maps 404 to a no-longer-available message", () => {
    expect(describeApplyError(new ApiError(404, "Not Found"))).toMatch(
      /no longer available/i,
    );
  });

  it("prefers the backend message for 400 (e.g. the résumé rule)", () => {
    expect(
      describeApplyError(new ApiError(400, "A résumé is required to apply.")),
    ).toBe("A résumé is required to apply.");
  });

  it("falls back to a résumé hint for a 400 with no message", () => {
    expect(describeApplyError(new ApiError(400, ""))).toMatch(/résumé/i);
  });

  it("prefers the backend message for 403", () => {
    expect(
      describeApplyError(new ApiError(403, "This job is not open.")),
    ).toBe("This job is not open.");
  });

  it("uses a generic Error's message", () => {
    expect(describeApplyError(new Error("network down"))).toBe("network down");
  });

  it("has a fallback for a non-Error value", () => {
    expect(describeApplyError("weird")).toMatch(/something went wrong/i);
  });
});

describe("formatAppliedDate", () => {
  it("returns a non-empty string for a valid ISO date", () => {
    expect(formatAppliedDate("2026-08-30T04:18:40Z")).not.toBe("");
  });

  it("returns an empty string for an invalid date", () => {
    expect(formatAppliedDate("not-a-date")).toBe("");
  });
});
