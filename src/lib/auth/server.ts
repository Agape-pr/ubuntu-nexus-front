/**
 * Server-side helpers for the /session/* routes.
 *
 * The long-lived refresh token lives in an HttpOnly cookie scoped to /session, so
 * page JavaScript can never read it and the browser sends it nowhere else. The
 * short-lived access token is returned to the page and kept in memory only.
 */
import { NextResponse } from 'next/server';
import { API_BASE_URL } from '@/lib/api/config';
import { SESSION_COOKIE } from './session-cookie';

export const REFRESH_COOKIE = 'ubn_refresh';
const MAX_AGE_SECONDS = 24 * 60 * 60; // matches the backend refresh token lifetime
const secure = process.env.NODE_ENV === 'production';

export function json(body: unknown, status = 200): NextResponse {
  const res = NextResponse.json(body, { status });
  res.headers.set('Cache-Control', 'no-store');
  return res;
}

/** Reject cross-site requests (cookie-authenticated POSTs must come from our own pages). */
export function crossSite(req: Request): boolean {
  const host = req.headers.get('host');
  const origin = req.headers.get('origin');
  if (origin) {
    try { return new URL(origin).host !== host; } catch { return true; }
  }
  const fetchSite = req.headers.get('sec-fetch-site');
  return !!fetchSite && fetchSite !== 'same-origin' && fetchSite !== 'none';
}

export function startSession(res: NextResponse, refresh: string): void {
  res.cookies.set({ name: REFRESH_COOKIE, value: refresh, httpOnly: true, secure, sameSite: 'lax', path: '/session', maxAge: MAX_AGE_SECONDS });
  res.cookies.set({ name: SESSION_COOKIE, value: '1', httpOnly: false, secure, sameSite: 'lax', path: '/', maxAge: MAX_AGE_SECONDS });
}

export function endSession(res: NextResponse): void {
  res.cookies.set({ name: REFRESH_COOKIE, value: '', httpOnly: true, secure, sameSite: 'lax', path: '/session', maxAge: 0 });
  res.cookies.set({ name: SESSION_COOKIE, value: '', httpOnly: false, secure, sameSite: 'lax', path: '/', maxAge: 0 });
}

type BackendBody = { access?: string; refresh?: string; detail?: string; [key: string]: unknown } | null;

async function callBackend(path: string, body: unknown): Promise<{ status: number; data: BackendBody }> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 20_000);
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: 'no-store',
    });
    let data: BackendBody = null;
    try { data = await res.json(); } catch { /* non-JSON body */ }
    return { status: res.status, data };
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Forward a sign-in request to the backend. On success the refresh token goes into the
 * cookie and is REMOVED from the body; the page only receives the access token and user.
 * Backend errors are passed through unchanged so the existing error messages still work.
 */
export async function signIn(req: Request, backendPath: string, allowed: string[]): Promise<NextResponse> {
  if (crossSite(req)) return json({ detail: 'Forbidden' }, 403);

  let input: Record<string, unknown>;
  try { input = await req.json(); } catch { return json({ detail: 'Invalid request' }, 400); }
  const payload = Object.fromEntries(allowed.filter((k) => k in input).map((k) => [k, input[k]]));

  let upstream;
  try {
    upstream = await callBackend(backendPath, payload);
  } catch {
    return json({ detail: 'Could not reach the server. Please try again.' }, 502);
  }

  const { status, data } = upstream;
  if (status !== 200 || !data?.access || !data?.refresh) {
    return json(data ?? { detail: 'Request failed' }, status === 200 ? 502 : status);
  }

  const { refresh, ...rest } = data;
  const res = json(rest);
  startSession(res, refresh);
  return res;
}

export async function refreshSession(req: Request, refresh: string | undefined): Promise<NextResponse> {
  if (crossSite(req)) return json({ detail: 'Forbidden' }, 403);
  if (!refresh) {
    const res = json({ detail: 'Not signed in' }, 401);
    endSession(res);
    return res;
  }
  let upstream;
  try {
    upstream = await callBackend('/users/token/refresh', { refresh });
  } catch {
    return json({ detail: 'Could not reach the server. Please try again.' }, 502);
  }
  if (upstream.status === 200 && upstream.data?.access) {
    return json({ access: upstream.data.access });
  }
  if (upstream.status === 401 || upstream.status === 400) {
    const res = json({ detail: 'Session expired' }, 401);
    endSession(res);
    return res;
  }
  return json({ detail: 'Could not refresh the session' }, 502);
}
