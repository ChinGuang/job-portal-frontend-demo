import { describe, expect, it } from "vitest";
import {
  JOBS_PAGE_SIZE,
  buildJobsQuery,
  formatJobType,
  formatSalary,
  toExternalUrl,
  totalPages,
} from "./jobs";

describe("buildJobsQuery", () => {
  it("defaults to the first page with limit and zero offset", () => {
    expect(buildJobsQuery({})).toEqual({
      q: undefined,
      jobType: undefined,
      location: undefined,
      limit: JOBS_PAGE_SIZE,
      offset: 0,
    });
  });

  it("converts a 1-based page into an offset", () => {
    expect(buildJobsQuery({ page: 3 }).offset).toBe(2 * JOBS_PAGE_SIZE);
  });

  it("treats a zero or negative page as the first page", () => {
    expect(buildJobsQuery({ page: 0 }).offset).toBe(0);
    expect(buildJobsQuery({ page: -5 }).offset).toBe(0);
  });

  it("trims text filters and omits blank ones", () => {
    const query = buildJobsQuery({ q: "  react  ", location: "   ", jobType: "" });
    expect(query.q).toBe("react");
    expect(query.location).toBeUndefined();
    expect(query.jobType).toBeUndefined();
  });

  it("passes through a selected job type", () => {
    expect(buildJobsQuery({ jobType: "FULL_TIME" }).jobType).toBe("FULL_TIME");
  });
});

describe("totalPages", () => {
  it("rounds up partial pages", () => {
    expect(totalPages(25, 10)).toBe(3);
    expect(totalPages(20, 10)).toBe(2);
  });

  it("never returns less than 1, even for empty results", () => {
    expect(totalPages(0, 10)).toBe(1);
    expect(totalPages(-3, 10)).toBe(1);
  });
});

describe("formatJobType", () => {
  it("maps known types to friendly labels", () => {
    expect(formatJobType("FULL_TIME")).toBe("Full-time");
    expect(formatJobType("INTERNSHIP")).toBe("Internship");
  });

  it("humanizes unknown types instead of failing", () => {
    expect(formatJobType("SEASONAL_WORK")).toBe("Seasonal work");
  });
});

describe("toExternalUrl", () => {
  it("leaves an absolute http(s) URL unchanged", () => {
    expect(toExternalUrl("https://acme.io")).toBe("https://acme.io");
    expect(toExternalUrl("http://acme.io")).toBe("http://acme.io");
  });

  it("prepends https:// when a scheme is missing", () => {
    expect(toExternalUrl("acme.io")).toBe("https://acme.io");
    expect(toExternalUrl("www.acme.io/careers")).toBe("https://www.acme.io/careers");
  });

  it("trims surrounding whitespace", () => {
    expect(toExternalUrl("  acme.io  ")).toBe("https://acme.io");
  });
});

describe("formatSalary", () => {
  it("returns null when there are no bounds", () => {
    expect(formatSalary({ salaryMin: null, salaryMax: null, salaryCurrency: null })).toBeNull();
  });

  it("formats a full range", () => {
    expect(
      formatSalary({ salaryMin: 50000, salaryMax: 70000, salaryCurrency: "USD" }),
    ).toBe("$50,000 – $70,000");
  });

  it("formats an open-ended minimum", () => {
    expect(
      formatSalary({ salaryMin: 80000, salaryMax: null, salaryCurrency: "USD" }),
    ).toBe("From $80,000");
  });

  it("formats an open-ended maximum", () => {
    expect(
      formatSalary({ salaryMin: null, salaryMax: 40000, salaryCurrency: "USD" }),
    ).toBe("Up to $40,000");
  });

  it("falls back gracefully for a non-ISO currency code", () => {
    expect(
      formatSalary({ salaryMin: 100, salaryMax: null, salaryCurrency: "NOTACODE" }),
    ).toBe("From 100 NOTACODE");
  });
});
