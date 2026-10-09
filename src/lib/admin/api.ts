/**
 * Admin portal API client.
 *
 * Kept separate from the public-site client on purpose: admin tokens live in
 * sessionStorage (cleared when the tab closes), never localStorage, and expire
 * after 10 minutes (refreshed automatically for up to 8 hours).
 */
import { API_BASE_URL } from '@/lib/api/config';
import type {
  AccountUser, AdminOrder, AdminPayment, AdminSessionUser, AuditEntry,
  LoginChallenge, Page, PermissionInfo,
} from './types';

const ACCESS_KEY = 'admin_access';
const REFRESH_KEY = 'admin_refresh';
export const SESSION_EXPIRED_EVENT = 'admin-session-expired';

const store = {
  get: (k: string): string | null => {
    try { return sessionStorage.getItem(k); } catch { return null; }
  },
  set: (k: string, v: string) => {
    try { sessionStorage.setItem(k, v); } catch { /* storage unavailable */ }
  },
  remove: (k: string) => {
    try { sessionStorage.removeItem(k); } catch { /* storage unavailable */ }
  },
};

export const hasStoredSession = () => !!store.get(REFRESH_KEY);
export const clearSession = () => { store.remove(ACCESS_KEY); store.remove(REFRESH_KEY); };

export class AdminApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function messageFrom(data: unknown, status: number): string {
  if (data && typeof data === 'object') {
    const d = data as Record<string, unknown>;
    if (typeof d.detail === 'string') return d.detail;
    if (typeof d.error === 'string') return d.error;
    const flat = (v: unknown): string[] =>
      typeof v === 'string' ? [v] : Array.isArray(v) ? v.flatMap(flat) : v && typeof v === 'object' ? Object.values(v).flatMap(flat) : [];
    const msgs = flat(d).filter(Boolean);
    if (msgs.length) return msgs.join(' ');
  }
  return status === 403 ? "You don't have permission to do that." : `Request failed (${status})`;
}

type Query = Record<string, string | number | undefined | null>;

const withQuery = (path: string, query?: Query) => {
  const params = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params.set(k, String(v));
  });
  const qs = params.toString();
  return qs ? `${path}${path.includes('?') ? '&' : '?'}${qs}` : path;
};

async function send(path: string, method: string, body?: unknown, token?: string | null): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 30_000);
  try {
    return await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new AdminApiError('Network error. Check your connection and try again.', 0);
  } finally {
    clearTimeout(timer);
  }
}

async function parse<T>(res: Response): Promise<T> {
  if (res.status === 204) return undefined as T;
  let data: unknown = null;
  try { data = await res.json(); } catch { /* non-JSON body */ }
  if (!res.ok) throw new AdminApiError(messageFrom(data, res.status), res.status);
  return data as T;
}

let refreshing: Promise<boolean> | null = null;

/** Exchange the refresh token for a new access token. Shared between concurrent callers. */
function refreshAccess(): Promise<boolean> {
  if (!refreshing) {
    refreshing = (async () => {
      const refresh = store.get(REFRESH_KEY);
      if (!refresh) return false;
      try {
        const res = await send('/users/token/refresh', 'POST', { refresh });
        if (!res.ok) return false;
        const data = await res.json();
        if (!data.access) return false;
        store.set(ACCESS_KEY, data.access);
        return true;
      } catch {
        return false;
      }
    })().finally(() => { refreshing = null; });
  }
  return refreshing;
}

async function request<T>(path: string, method = 'GET', body?: unknown, query?: Query): Promise<T> {
  const url = withQuery(path, query);
  let res = await send(url, method, body, store.get(ACCESS_KEY));
  if (res.status === 401 && (await refreshAccess())) {
    res = await send(url, method, body, store.get(ACCESS_KEY));
  }
  if (res.status === 401) {
    clearSession();
    if (typeof window !== 'undefined') window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }
  return parse<T>(res);
}

const listOf = <T,>(data: Page<T> | T[]): Page<T> =>
  Array.isArray(data) ? { count: data.length, next: null, previous: null, results: data } : data;

export const adminApi = {
  // ── sign-in ──
  async login(email: string, password: string): Promise<LoginChallenge> {
    return parse<LoginChallenge>(await send('/users/admin/login', 'POST', { email, password }));
  },
  async verify(challenge: string, otp: string): Promise<AdminSessionUser> {
    const data = await parse<{ access: string; refresh: string; user: AdminSessionUser }>(
      await send('/users/admin/login/verify', 'POST', { challenge, otp }),
    );
    store.set(ACCESS_KEY, data.access);
    store.set(REFRESH_KEY, data.refresh);
    return data.user;
  },
  me: () => request<AdminSessionUser>('/users/me/'),

  // ── accounts ──
  permissions: () => request<PermissionInfo[]>('/users/admin/permissions/'),
  users: (q: { role?: string; search?: string }) => request<AccountUser[]>('/users/admin/users/', 'GET', undefined, q),
  setUserActive: (id: number, is_active: boolean) =>
    request<AccountUser>(`/users/admin/users/${id}/`, 'PATCH', { is_active }),
  admins: () => request<AccountUser[]>('/users/admin/admins/'),
  createAdmin: (data: { email: string; password: string; phone_number?: string; admin_permissions: string[] }) =>
    request<AccountUser>('/users/admin/admins/', 'POST', data),
  updateAdmin: (id: number, data: { admin_permissions?: string[]; is_active?: boolean }) =>
    request<AccountUser>(`/users/admin/admins/${id}/`, 'PATCH', data),
  deleteAdmin: (id: number) => request<void>(`/users/admin/admins/${id}/`, 'DELETE'),

  // ── operations ──
  orders: async (q: { page?: number; status?: string; payment_status?: string; search?: string }) =>
    listOf(await request<Page<AdminOrder>>('/orders/admin/orders/', 'GET', undefined, q)),
  payments: async (q: { limit?: number; offset?: number; status?: string }) =>
    listOf(await request<Page<AdminPayment>>('/payments/payment/admin/list', 'GET', undefined, q)),
  releasable: async () => listOf(await request<Page<AdminPayment> | AdminPayment[]>('/payments/payment/releasable')).results,
  balance: () => request<{ balance: string }>('/payments/payment/intouch-balance'),
  releasePayment: (payment_id: number) =>
    request<{ status: string; transactionid?: string }>('/payments/payment/release', 'POST', { payment_id }),
  audit: (q: { limit?: number; offset?: number; action?: string; actor_id?: string }) =>
    request<Page<AuditEntry>>('/users/admin/audit/', 'GET', undefined, q),
};
