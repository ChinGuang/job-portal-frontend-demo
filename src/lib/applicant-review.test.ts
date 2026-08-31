import { describe, expect, it } from "vitest";
import {
  applicantStatusActions,
  canTransitionApplication,
} from "./applicant-review";

describe("applicantStatusActions", () => {
  it("offers Mark reviewed from SUBMITTED", () => {
    expect(applicantStatusActions("SUBMITTED")).toEqual([
      { to: "REVIEWED", label: "Mark reviewed" },
    ]);
  });

  it("offers Make offer and Reject from REVIEWED", () => {
    expect(applicantStatusActions("REVIEWED")).toEqual([
      { to: "OFFERED", label: "Make offer" },
      { to: "REJECTED", label: "Reject" },
    ]);
  });

  it("offers nothing from the terminal states", () => {
    expect(applicantStatusActions("OFFERED")).toEqual([]);
    expect(applicantStatusActions("REJECTED")).toEqual([]);
  });
});

describe("canTransitionApplication", () => {
  it("allows the valid pipeline transitions", () => {
    expect(canTransitionApplication("SUBMITTED", "REVIEWED")).toBe(true);
    expect(canTransitionApplication("REVIEWED", "OFFERED")).toBe(true);
    expect(canTransitionApplication("REVIEWED", "REJECTED")).toBe(true);
  });

  it("rejects skips, reversals, and moves out of terminal states", () => {
    expect(canTransitionApplication("SUBMITTED", "OFFERED")).toBe(false);
    expect(canTransitionApplication("REVIEWED", "SUBMITTED")).toBe(false);
    expect(canTransitionApplication("OFFERED", "REVIEWED")).toBe(false);
    expect(canTransitionApplication("REJECTED", "OFFERED")).toBe(false);
  });
});
