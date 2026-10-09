/**
 * Read the expiry of a JWT access token (no verification: the API verifies tokens;
 * the browser only needs to know when to ask for a fresh one).
 */
export function tokenExpiresAt(token: string | null | undefined): number | null {
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    const exp = JSON.parse(json).exp;
    return typeof exp === 'number' ? exp * 1000 : null;
  } catch {
    return null;
  }
}

/** True when the token is missing, unreadable, or expires within `skewMs`. */
export function isExpiredOrExpiring(token: string | null | undefined, skewMs = 30_000, now = Date.now()): boolean {
  const expiresAt = tokenExpiresAt(token);
  return expiresAt === null || expiresAt - skewMs <= now;
}
