/**
 * A tiny registry decoupling the QueryClient's error handling from React state:
 * the client calls {@link notifyUnauthorized} on a 401, and the auth layer
 * registers what should happen (sign out + redirect) via
 * {@link setUnauthorizedHandler}.
 */
type UnauthorizedHandler = () => void;

let handler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(next: UnauthorizedHandler | null): void {
  handler = next;
}

export function notifyUnauthorized(): void {
  handler?.();
}
