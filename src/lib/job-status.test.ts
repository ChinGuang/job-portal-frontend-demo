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

  it("offers only Close from PUBLISHED (no unpublish)", () => {
    expect(statusActions("PUBLISHED")).toEqual([{ to: "CLOSED", label: "Close" }]);
  });

  it("offers nothing from CLOSED (no reopen)", () => {
    expect(statusActions("CLOSED")).toEqual([]);
  });

  it("offers nothing from ARCHIVED", () => {
    expect(statusActions("ARCHIVED")).toEqual([]);
  });
});

describe("canTransitionStatus", () => {
  it("allows the forward transitions", () => {
    expect(canTransitionStatus("DRAFT", "PUBLISHED")).toBe(true);
    expect(canTransitionStatus("PUBLISHED", "CLOSED")).toBe(true);
  });

  it("rejects reverse and invalid transitions", () => {
    expect(canTransitionStatus("PUBLISHED", "DRAFT")).toBe(false); // no unpublish
    expect(canTransitionStatus("CLOSED", "PUBLISHED")).toBe(false); // no reopen
    expect(canTransitionStatus("DRAFT", "CLOSED")).toBe(false);
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
