/**
 * Validate a post-login redirect target taken from the URL (?redirectTo=...).
 * Only plain same-site paths are accepted, so a crafted link can't send a user
 * to another website right after they sign in.
 */
export function safeRedirectPath(value: string | null | undefined): string | null {
  if (!value) return null;
  const path = value.trim();
  if (!path.startsWith('/')) return null;           // absolute URLs, "javascript:", "evil.com"
  if (path.startsWith('//')) return null;           // protocol-relative: //evil.com
  if (/[\u0000-\u001f\u007f\\]/.test(path)) return null; // control chars and backslashes browsers normalise to "/"
  return path;
}
