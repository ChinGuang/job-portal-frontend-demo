/**
 * Reduce an untrusted `redirect` value (from a query param) to a safe internal
 * destination. Only a same-origin absolute path is allowed; absolute URLs and
 * protocol-relative values (`//evil.com`) fall back to the default, preventing
 * an open-redirect after login.
 */
export function sanitizeRedirect(
  value: string | null | undefined,
  fallback = "/dashboard",
): string {
  if (!value) return fallback;
  if (value.startsWith("/") && !value.startsWith("//")) return value;
  return fallback;
}
