import { env } from "./env";
import { ApiError, messageFromBackendError } from "./api-error";

/**
 * Supplies the current auth token (or null when unauthenticated). Auth is wired
 * in a later ticket; until then the default provider yields no token, so
 * requests go out unauthenticated. The provider is deliberately swappable so
 * the auth layer can inject the live Supabase session without this module
 * depending on it.
 */
export type TokenProvider = () => string | null | Promise<string | null>;

let tokenProvider: TokenProvider = () => null;

/** Register the provider used to obtain the bearer token for each request. */
export function setAuthTokenProvider(provider: TokenProvider): void {
  tokenProvider = provider;
}

/** Restore the default (no-token) provider. Primarily for tests. */
export function resetAuthTokenProvider(): void {
  tokenProvider = () => null;
}

export interface ApiRequestOptions extends Omit<RequestInit, "body"> {
  /** JSON-serialized automatically, unless it is a `FormData` (sent as-is). */
  body?: unknown;
  /** Appended as query-string params; nullish values are skipped. */
  query?: Record<string, string | number | boolean | undefined | null>;
}

function buildUrl(
  path: string,
  baseUrl: string,
  query?: ApiRequestOptions["query"],
): string {
  const base = baseUrl.replace(/\/+$/, "");
  const rel = path.startsWith("/") ? path : `/${path}`;
  // Support both an absolute base (the default) and a relative one (e.g. "/api"
  // for same-origin proxying): a relative base is resolved against the current
  // origin in the browser, avoiding a `new URL` TypeError.
  const isAbsolute = /^[a-z][a-z0-9+.-]*:\/\//i.test(base);
  const resolveBase = isAbsolute
    ? undefined
    : typeof window !== "undefined"
      ? window.location.origin
      : "http://localhost";
  const url = new URL(`${base}${rel}`, resolveBase);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, String(value));
      }
    }
  }
  return url.toString();
}

/**
 * Perform a request against the backend REST API.
 *
 * - Prefixes {@link env.apiBaseUrl} (overridable via `baseUrl` for tests).
 * - Injects `Authorization: Bearer <token>` when a token is available.
 * - JSON-encodes object bodies; passes `FormData` through untouched.
 * - Maps any non-2xx response to a thrown {@link ApiError} with a message
 *   derived from the backend's consistent error body.
 */
export async function apiFetch<T>(
  path: string,
  options: ApiRequestOptions = {},
  baseUrl: string = env.apiBaseUrl,
): Promise<T> {
  const { body, query, headers, ...rest } = options;
  const url = buildUrl(path, baseUrl, query);

  const finalHeaders = new Headers(headers);
  const token = await tokenProvider();
  if (token) finalHeaders.set("Authorization", `Bearer ${token}`);

  let finalBody: BodyInit | undefined;
  if (body instanceof FormData) {
    finalBody = body; // let fetch set the multipart boundary
  } else if (body !== undefined) {
    finalHeaders.set("Content-Type", "application/json");
    finalBody = JSON.stringify(body);
  }

  const response = await fetch(url, {
    ...rest,
    headers: finalHeaders,
    body: finalBody,
  });

  if (!response.ok) {
    const parsed = await response.json().catch(() => undefined);
    throw new ApiError(
      response.status,
      messageFromBackendError(response.status, parsed),
      parsed,
    );
  }

  if (response.status === 204) return undefined as T;
  const text = await response.text();
  if (!text) return undefined as T;
  try {
    return JSON.parse(text) as T;
  } catch {
    // A 2xx with a non-JSON body (proxy HTML page, truncated response) still
    // reaches callers as the consistent ApiError contract rather than a raw
    // SyntaxError.
    throw new ApiError(
      response.status,
      "Received a non-JSON response from the server",
      text,
    );
  }
}

/** Convenience verbs over {@link apiFetch}. */
export const api = {
  get: <T>(path: string, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: "GET" }),
  post: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: "POST", body }),
  patch: <T>(path: string, body?: unknown, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: "PATCH", body }),
  delete: <T>(path: string, options?: ApiRequestOptions) =>
    apiFetch<T>(path, { ...options, method: "DELETE" }),
};
