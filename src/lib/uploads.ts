import { api } from "./api-client";
import type { EmployerProfile, JobSeekerProfile } from "./profiles";

/** Rules for validating a chosen file before uploading it. */
export interface UploadConfig {
  /** Accepted MIME types. */
  mimeTypes: string[];
  /** Accepted filename extensions (lowercase, with leading dot). */
  extensions: string[];
  /** Human-readable list of allowed types, e.g. "PDF, DOC, DOCX". */
  typeLabel: string;
  /** Maximum size in bytes. */
  maxBytes: number;
  /** `accept` attribute for the <input type="file">. */
  accept: string;
}

const MAX_BYTES = 5 * 1024 * 1024;

export const RESUME_UPLOAD: UploadConfig = {
  mimeTypes: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  extensions: [".pdf", ".doc", ".docx"],
  typeLabel: "PDF, DOC, DOCX",
  maxBytes: MAX_BYTES,
  accept: ".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

export const LOGO_UPLOAD: UploadConfig = {
  mimeTypes: ["image/png", "image/jpeg", "image/svg+xml", "image/webp"],
  extensions: [".png", ".jpg", ".jpeg", ".svg", ".webp"],
  typeLabel: "PNG, JPG, SVG, WEBP",
  maxBytes: MAX_BYTES,
  accept: "image/png,image/jpeg,image/svg+xml,image/webp",
};

export type FileValidation = { ok: true } | { ok: false; message: string };

function megabytes(bytes: number): number {
  return Math.round((bytes / (1024 * 1024)) * 10) / 10;
}

/**
 * Validate a chosen file against an {@link UploadConfig}: type first (by MIME or,
 * when the browser reports none, by extension), then size. Returns a clear,
 * user-facing message on failure.
 */
export function validateFile(file: File, config: UploadConfig): FileValidation {
  const name = file.name.trim().toLowerCase();
  const mimeOk = file.type !== "" && config.mimeTypes.includes(file.type);
  const extensionOk = config.extensions.some((ext) => name.endsWith(ext));
  if (!mimeOk && !extensionOk) {
    return {
      ok: false,
      message: `Unsupported file type. Allowed: ${config.typeLabel}.`,
    };
  }

  if (file.size > config.maxBytes) {
    return {
      ok: false,
      message: `File is too large. Maximum size is ${megabytes(config.maxBytes)} MB.`,
    };
  }

  return { ok: true };
}

// --- Upload API --------------------------------------------------------------

function fileForm(file: File): FormData {
  const form = new FormData();
  form.append("file", file);
  return form;
}

/** Upload a résumé to the current user's job-seeker profile. */
export function uploadJobSeekerResume(file: File): Promise<JobSeekerProfile> {
  return api.post<JobSeekerProfile>(
    "/profiles/job-seeker/resume",
    fileForm(file),
  );
}

/**
 * Upload a company logo. NOTE: the backend does not yet expose this endpoint —
 * the employer profile stores `logoUrl` and there is no multipart logo route in
 * the API spec. This calls the expected path so the UI is ready; it will 404
 * until the backend adds `POST /profiles/employer/logo`.
 */
export function uploadEmployerLogo(file: File): Promise<EmployerProfile> {
  return api.post<EmployerProfile>("/profiles/employer/logo", fileForm(file));
}
