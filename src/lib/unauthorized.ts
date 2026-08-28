/**
 * A tiny registry decoupling the QueryClient's error handling from React state:
 * the client calls {@link notifyUnauthorized} on a 401, and the auth layer
 * registers what should happen (sign out + redirect) via
 * {@link setUnauthorizedHandler}.
 */
type UnauthorizedHandler = () => void;

let handler: UnauthorizedHandler | null = null;
let notifying = false;

export function setUnauthorizedHandler(next: UnauthorizedHandler | null): void {
  handler = next;
  notifying = false;
}

/**
 * Invoke the handler once, collapsing a burst of concurrent 401s (e.g. several
 * parallel authed queries failing together) into a single sign-out + redirect.
 * The guard resets on the next tick so later 401s are handled again.
 */
export function notifyUnauthorized(): void {
  if (notifying || !handler) return;
  notifying = true;
  try {
    handler();
  } finally {
    setTimeout(() => {
      notifying = false;
    }, 0);
  }
}
