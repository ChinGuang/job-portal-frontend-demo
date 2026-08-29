import { describe, expect, it } from "vitest";
import {
  canTransitionStatus,
  parseRequirements,
  formatRequirements,
  statusActions,
} from "./job-status";

describe("statusActions", () => {
  it("offers Publish from DRAFT", () => {
    expect(statusActions("DRAFT")).toEqual([{ to: "PUBLISHED", label: "Publish" }]);
  });

  it("offers Close and Unpublish from PUBLISHED", () => {
    expect(statusActions("PUBLISHED")).toEqual([
      { to: "CLOSED", label: "Close" },
      { to: "DRAFT", label: "Unpublish" },
    ]);
  });

  it("offers Reopen from CLOSED", () => {
    expect(statusActions("CLOSED")).toEqual([{ to: "PUBLISHED", label: "Reopen" }]);
  });

  it("offers nothing from ARCHIVED", () => {
    expect(statusActions("ARCHIVED")).toEqual([]);
  });
});

describe("canTransitionStatus", () => {
  it("allows valid transitions", () => {
    expect(canTransitionStatus("DRAFT", "PUBLISHED")).toBe(true);
    expect(canTransitionStatus("PUBLISHED", "CLOSED")).toBe(true);
    expect(canTransitionStatus("PUBLISHED", "DRAFT")).toBe(true);
    expect(canTransitionStatus("CLOSED", "PUBLISHED")).toBe(true);
  });

  it("rejects invalid transitions", () => {
    expect(canTransitionStatus("DRAFT", "CLOSED")).toBe(false);
    expect(canTransitionStatus("CLOSED", "DRAFT")).toBe(false);
    expect(canTransitionStatus("ARCHIVED", "PUBLISHED")).toBe(false);
    expect(canTransitionStatus("PUBLISHED", "PUBLISHED")).toBe(false);
  });
});

describe("parseRequirements / formatRequirements", () => {
  it("splits lines, trims, and drops blanks", () => {
    expect(parseRequirements("3+ years React\n  TypeScript \n\n\nGraphQL")).toEqual([
      "3+ years React",
      "TypeScript",
      "GraphQL",
    ]);
  });

  it("keeps duplicates and original order (unlike skills)", () => {
    expect(parseRequirements("A\nA\nB")).toEqual(["A", "A", "B"]);
  });

  it("returns an empty array for blank input", () => {
    expect(parseRequirements("   \n  ")).toEqual([]);
  });

  it("formats an array back to newline-separated text", () => {
    expect(formatRequirements(["A", "B"])).toBe("A\nB");
    expect(formatRequirements(undefined)).toBe("");
  });
});
