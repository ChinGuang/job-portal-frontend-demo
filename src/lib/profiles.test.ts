import { describe, expect, it } from "vitest";
import { formatSkills, parseSkills } from "./profiles";

describe("parseSkills", () => {
  it("splits a comma-separated string and trims each entry", () => {
    expect(parseSkills("React, TypeScript ,  Node")).toEqual([
      "React",
      "TypeScript",
      "Node",
    ]);
  });

  it("also splits on newlines", () => {
    expect(parseSkills("React\nTypeScript\n\nNode")).toEqual([
      "React",
      "TypeScript",
      "Node",
    ]);
  });

  it("drops empty entries and duplicates (case-insensitive)", () => {
    expect(parseSkills("React, , react, REACT, Vue")).toEqual(["React", "Vue"]);
  });

  it("returns an empty array for blank input", () => {
    expect(parseSkills("")).toEqual([]);
    expect(parseSkills("   ,  , ")).toEqual([]);
  });
});

describe("formatSkills", () => {
  it("joins an array into a comma-separated string for editing", () => {
    expect(formatSkills(["React", "TypeScript"])).toBe("React, TypeScript");
  });

  it("handles an empty or missing array", () => {
    expect(formatSkills([])).toBe("");
    expect(formatSkills(undefined)).toBe("");
  });

  it("round-trips with parseSkills", () => {
    const skills = ["React", "TypeScript", "Node"];
    expect(parseSkills(formatSkills(skills))).toEqual(skills);
  });
});
