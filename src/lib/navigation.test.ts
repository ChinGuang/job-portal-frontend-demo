import { describe, expect, it } from "vitest";
import { sanitizeRedirect } from "./navigation";

describe("sanitizeRedirect", () => {
  it("allows an internal absolute path", () => {
    expect(sanitizeRedirect("/dashboard")).toBe("/dashboard");
    expect(sanitizeRedirect("/seeker/applications?tab=open")).toBe(
      "/seeker/applications?tab=open",
    );
  });

  it("falls back for absolute URLs (open redirect)", () => {
    expect(sanitizeRedirect("https://evil.com")).toBe("/dashboard");
    expect(sanitizeRedirect("http://evil.com")).toBe("/dashboard");
  });

  it("falls back for protocol-relative values", () => {
    expect(sanitizeRedirect("//evil.com")).toBe("/dashboard");
  });

  it("falls back for empty/missing values", () => {
    expect(sanitizeRedirect(null)).toBe("/dashboard");
    expect(sanitizeRedirect(undefined)).toBe("/dashboard");
    expect(sanitizeRedirect("")).toBe("/dashboard");
  });

  it("honors a custom fallback", () => {
    expect(sanitizeRedirect(null, "/")).toBe("/");
  });
});
