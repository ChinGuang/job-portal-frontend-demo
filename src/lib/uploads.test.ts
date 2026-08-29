import { describe, expect, it } from "vitest";
import { LOGO_UPLOAD, RESUME_UPLOAD, validateFile } from "./uploads";

/** Minimal File-like stub — validateFile only reads name/type/size. */
function makeFile(name: string, type: string, size: number): File {
  return { name, type, size } as File;
}

const MB = 1024 * 1024;

describe("validateFile — résumé", () => {
  it("accepts a PDF within the size limit", () => {
    expect(validateFile(makeFile("cv.pdf", "application/pdf", 2 * MB), RESUME_UPLOAD)).toEqual({
      ok: true,
    });
  });

  it("accepts DOC and DOCX", () => {
    expect(
      validateFile(makeFile("cv.doc", "application/msword", MB), RESUME_UPLOAD).ok,
    ).toBe(true);
    expect(
      validateFile(
        makeFile(
          "cv.docx",
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          MB,
        ),
        RESUME_UPLOAD,
      ).ok,
    ).toBe(true);
  });

  it("falls back to the extension when the browser reports no MIME type", () => {
    expect(validateFile(makeFile("cv.pdf", "", MB), RESUME_UPLOAD).ok).toBe(true);
  });

  it("rejects an unsupported type with a clear message", () => {
    const result = validateFile(makeFile("photo.png", "image/png", MB), RESUME_UPLOAD);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/PDF, DOC, DOCX/);
  });

  it("rejects a file over 5 MB with a clear message", () => {
    const result = validateFile(
      makeFile("cv.pdf", "application/pdf", 5 * MB + 1),
      RESUME_UPLOAD,
    );
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/5 MB/);
  });

  it("accepts a file exactly at the 5 MB limit", () => {
    expect(
      validateFile(makeFile("cv.pdf", "application/pdf", 5 * MB), RESUME_UPLOAD).ok,
    ).toBe(true);
  });
});

describe("validateFile — logo", () => {
  it("accepts common image types", () => {
    expect(validateFile(makeFile("logo.png", "image/png", MB), LOGO_UPLOAD).ok).toBe(true);
    expect(validateFile(makeFile("logo.jpg", "image/jpeg", MB), LOGO_UPLOAD).ok).toBe(true);
    expect(validateFile(makeFile("logo.svg", "image/svg+xml", MB), LOGO_UPLOAD).ok).toBe(true);
  });

  it("rejects a PDF as a logo", () => {
    const result = validateFile(makeFile("cv.pdf", "application/pdf", MB), LOGO_UPLOAD);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/PNG, JPG/);
  });
});
