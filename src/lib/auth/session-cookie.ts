/**
 * Session marker cookie.
 *
 * The route guard (middleware) only needs to know "is someone signed in?", so it
 * reads this marker. It deliberately holds NO credentials: the tokens themselves
 * never go into cookies, where they would be sent with every request.
 *
 * (Pure module with no imports so it can run in the edge middleware and in tests.)
 */
export const SESSION_COOKIE = 'ubn_session';

// Older versions wrote the raw tokens into cookies; these are removed on sight.
const LEGACY_TOKEN_COOKIES = ['access_token', 'refresh_token'];

// Matches the lifetime of the backend refresh token (1 day).
const MAX_AGE_SECONDS = 24 * 60 * 60;

type CookieJar = { cookie: string };

const isSecureContext = () => typeof location !== 'undefined' && location.protocol === 'https:';

const expire = (name: string, secure: boolean) =>
  `${name}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax${secure ? '; Secure' : ''}`;

export function setSessionMarker(doc: CookieJar = document, secure = isSecureContext()): void {
  doc.cookie = `${SESSION_COOKIE}=1; path=/; max-age=${MAX_AGE_SECONDS}; SameSite=Lax${secure ? '; Secure' : ''}`;
}

export function removeLegacyTokenCookies(doc: CookieJar = document, secure = isSecureContext()): void {
  LEGACY_TOKEN_COOKIES.forEach((name) => { doc.cookie = expire(name, secure); });
}

export function clearSessionMarker(doc: CookieJar = document, secure = isSecureContext()): void {
  doc.cookie = expire(SESSION_COOKIE, secure);
  removeLegacyTokenCookies(doc, secure);
}

/**
 * Bring cookies in line with whether tokens exist. Also migrates users who signed in
 * before this change: their old credential cookies are deleted and a marker is set.
 */
export function syncSessionMarker(hasTokens: boolean, doc: CookieJar = document, secure = isSecureContext()): void {
  removeLegacyTokenCookies(doc, secure);
  if (hasTokens) setSessionMarker(doc, secure);
  else clearSessionMarker(doc, secure);
}
