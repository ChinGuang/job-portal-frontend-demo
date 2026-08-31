/**
 * The consistent error body shape produced by the backend's global exception
 * filter (NestJS style): `message` may be a single string or an array of
 * validation messages.
 */
export interface BackendErrorBody {
  statusCode?: number;
  message?: string | string[];
  error?: string;
}

/** Error thrown for any non-2xx backend response. */
export class ApiError extends Error {
  readonly status: number;
  readonly body: unknown;

  constructor(status: number, message: string, body?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.body = body;
  }

  /** True for missing/expired/invalid token responses. */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** True for authenticated-but-not-permitted responses. */
  get isForbidden(): boolean {
    return this.status === 403;
  }

  /** True for duplicate-application (and other) conflicts. */
  get isConflict(): boolean {
    return this.status === 409;
  }
}

/**
 * Derive a human-readable message from a backend error body, tolerating the
 * `message`-as-array validation case and missing/malformed bodies.
 */
export function messageFromBackendError(status: number, body: unknown): string {
  if (body && typeof body === "object") {
    const { message, error } = body as BackendErrorBody;
    if (Array.isArray(message) && message.length > 0) return message.join(", ");
    if (typeof message === "string" && message.length > 0) return message;
    if (typeof error === "string" && error.length > 0) return error;
  }
  return `Request failed with status ${status}`;
}

/**
 * Message for a failed status/lifecycle transition: a 409 means the backend
 * rejected the move as invalid; otherwise fall back to the error's own message.
 */
export function describeStatusChangeError(error: unknown): string {
  if (error instanceof ApiError && error.status === 409) {
    return "That status change isn't allowed.";
  }
  return error instanceof Error ? error.message : "Something went wrong.";
}
