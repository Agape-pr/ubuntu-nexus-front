/**
 * API Client
 * 
 * This file contains the main API client for making HTTP requests.
 * It handles authentication, error handling, and request/response interceptors.
 */

import { API_BASE_URL, API_ENDPOINTS, API_TIMEOUT } from './config';
import { clearSessionMarker, hasSessionMarker, removeLegacyTokenCookies } from '@/lib/auth/session-cookie';
import { isExpiredOrExpiring } from '@/lib/auth/token-expiry';
import { safeRedirectPath } from '@/lib/auth/redirect';

export interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

// API returns data directly, not wrapped in {data, success}
export type ApiResponse<T> = T;

class ApiClient {
  private baseURL: string;
  private timeout: number;

  // The access token lives in memory only. The refresh token is an HttpOnly cookie that
  // page scripts cannot read; it is used by the /session/refresh route (see lib/auth/server.ts).
  private accessToken: string | null = null;
  private refreshPromise: Promise<'ok' | 'expired' | 'error'> | null = null;

  constructor(baseURL: string, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
    if (typeof window !== 'undefined') this.migrateLegacySession();
  }

  /**
   * Earlier versions kept both tokens in localStorage (and in cookies). Remove them and
   * sign the person out once, so no long-lived credential stays readable by page scripts.
   */
  private migrateLegacySession(): void {
    try {
      const hadLegacyTokens = !!(localStorage.getItem('access_token') || localStorage.getItem('refresh_token'));
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      removeLegacyTokenCookies();
      if (hadLegacyTokens) {
        localStorage.removeItem('user_role');
        clearSessionMarker();
      }
    } catch {
      /* storage unavailable */
    }
  }

  private getAccessToken(): string | null {
    return this.accessToken;
  }

  /**
   * A usable access token, refreshing it first when it is missing or about to expire.
   * Returns null when nobody is signed in. Use this for any request made outside apiClient.
   */
  async getValidAccessToken(): Promise<string | null> {
    if (typeof window === 'undefined') return null;
    if (!hasSessionMarker()) {
      this.accessToken = null;
      return null;
    }
    if (this.accessToken && !isExpiredOrExpiring(this.accessToken)) return this.accessToken;
    return (await this.refreshAccessToken()) === 'ok' ? this.accessToken : null;
  }

  /** Remember the access token and the (non-sensitive) role used to pick the right UI. */
  setTokens(access: string, _refresh?: string, role?: string): void {
    this.accessToken = access;
    if (typeof window !== 'undefined') {
      if (role) {
        try { localStorage.setItem('user_role', role); } catch { /* storage unavailable */ }
      }
      // Notify same-tab listeners (Navbar, MobileNav) of auth state change
      window.dispatchEvent(new Event('auth-change'));
    }
  }

  /** Sign out locally and ask the server to clear the refresh cookie. */
  removeTokens(): void {
    this.accessToken = null;
    if (typeof window !== 'undefined') {
      try { localStorage.removeItem('user_role'); } catch { /* storage unavailable */ }
      clearSessionMarker();
      fetch('/session/logout', { method: 'POST', keepalive: true }).catch(() => {});
      // Notify same-tab listeners of logout
      window.dispatchEvent(new Event('auth-change'));
    }
  }

  /**
   * Sign in through the Next.js /session routes. The server keeps the refresh token in its
   * HttpOnly cookie and only returns the access token.
   */
  async signIn<T extends { access: string; user?: { role?: string } }>(path: string, body: unknown): Promise<T> {
    let response: Response;
    try {
      response = await fetch(path, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
    } catch {
      throw { message: 'Network error. Please check your connection.', status: 0 } as ApiError;
    }
    if (!response.ok) throw await this.handleError(response);
    const data = (await response.json()) as T;
    this.setTokens(data.access, undefined, data.user?.role);
    return data;
  }

  /** Try to get a new access token from the refresh cookie. */
  async refreshSession(): Promise<boolean> {
    return (await this.refreshAccessToken()) === 'ok';
  }

  /**
   * Get headers for API requests
   */
  private getHeaders(customHeaders?: Record<string, string>, isFormData: boolean = false, skipAuth: boolean = false): HeadersInit {
    const headers: Record<string, string> = {
      ...customHeaders,
    };

    if (isFormData) {
      delete headers['Content-Type'];
      delete headers['content-type'];
    } else {
      headers['Content-Type'] = 'application/json';
    }

    if (!skipAuth) {
      const token = this.getAccessToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  /**
   * Handle API errors - supports Django REST Framework formats
   */
  private async handleError(response: Response): Promise<ApiError> {
    let error: ApiError;
    const status = response.status;

    try {
      const text = await response.text();
      let errorData: Record<string, unknown> = {};

      try {
        errorData = text ? JSON.parse(text) : {};
      } catch {
        // Response wasn't JSON (e.g. HTML error page)
        error = {
          message: `${response.statusText || 'Request failed'} (${status})`,
          status,
        };
        return this.maybeClearTokensAndReturn(error, status);
      }

      // DRF validation: {"field": ["error1"], "other": ["error2"]}
      const fieldErrors = errorData as Record<string, any>;
      if (typeof fieldErrors === 'object' && !Array.isArray(fieldErrors) && fieldErrors !== null) {
        const extractStrings = (val: any): string[] => {
          if (typeof val === 'string') return [val];
          if (Array.isArray(val)) return val.flatMap(extractStrings);
          if (val && typeof val === 'object') return Object.values(val).flatMap(extractStrings);
          return [];
        };
        const msgs = extractStrings(fieldErrors).filter(Boolean);
        if (msgs.length > 0) {
          error = {
            message: msgs.join('. '),
            status,
            errors: fieldErrors as Record<string, string[]>,
          };
          return this.maybeClearTokensAndReturn(error, status);
        }
      }

      // DRF standard: {"detail": "..."} or {"detail": ["..."]}
      const detail = errorData.detail ?? errorData.message;
      const messageStr = Array.isArray(detail) ? detail.join('. ') : String(detail || `Request failed (${status})`);
      error = {
        message: messageStr,
        status,
        errors: errorData.errors as Record<string, string[]> | undefined,
      };
    } catch {
      error = {
        message: response.statusText || `Request failed (${status})`,
        status,
      };
    }

    return this.maybeClearTokensAndReturn(error, status);
  }

  private maybeClearTokensAndReturn(error: ApiError, status: number): ApiError {
    // We now handle 401s centrally in the request method with auto-refresh logic.
    // However, if refresh completely fails, we will remove tokens there.
    return error;
  }

  /**
   * Attempt to refresh the access token using the HttpOnly refresh cookie.
   *   ok      - new access token is in memory
   *   expired - the server rejected the session; the person must sign in again
   *   error   - could not reach the server; keep the session and let the caller fail normally
   */
  private refreshAccessToken(): Promise<'ok' | 'expired' | 'error'> {
    // Several requests can need a fresh token at once; share a single refresh between them.
    if (!this.refreshPromise) {
      this.refreshPromise = this.performRefresh().finally(() => { this.refreshPromise = null; });
    }
    return this.refreshPromise;
  }

  private async performRefresh(): Promise<'ok' | 'expired' | 'error'> {
    try {
      const response = await fetch('/session/refresh', { method: 'POST' });
      if (response.ok) {
        const data = await response.json();
        if (data.access) {
          this.accessToken = data.access;
          return 'ok';
        }
        return 'error';
      }
      if (response.status === 401) {
        this.accessToken = null;
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('auth-change'));
        return 'expired';
      }
      return 'error';
    } catch {
      return 'error';
    }
  }

  /**
   * Make a request with timeout
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    const isFormData = options.body instanceof FormData;

    try {
      await this.getValidAccessToken();
      const response = await fetch(url, {
        ...options,
        headers: this.getHeaders(options.headers as Record<string, string>, isFormData),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Handle 401 Unauthorized by attempting a token refresh
        if (
          response.status === 401 &&
          endpoint !== API_ENDPOINTS.AUTH.LOGIN &&
          endpoint !== API_ENDPOINTS.AUTH.TOKEN_REFRESH
        ) {
          const refreshed = await this.refreshAccessToken();
          if (refreshed === 'ok') {
            // Retry the exact identical request with the new headers
            const retryResponse = await fetch(url, {
              ...options,
              headers: this.getHeaders(options.headers as Record<string, string>, isFormData),
              signal: controller.signal, // Reuse the same AbortController
            });

            if (!retryResponse.ok) {
              this.removeTokens(); // Refresh succeeded but request still 401'd
              const error = await this.handleError(retryResponse);
              throw error;
            }

            // Return the successful retry data
            if (retryResponse.status === 204 || retryResponse.headers.get('content-length') === '0') {
              return null as T;
            }
            return (await retryResponse.json()) as T;
          } else if (refreshed === 'expired') {
            // The session is over: log the user out
            this.removeTokens();
            const back = safeRedirectPath(window.location.pathname + window.location.search);
            window.location.href = back && back !== '/' ? `/auth?redirectTo=${encodeURIComponent(back)}` : '/auth';
          }
        }

        const error = await this.handleError(response);
        throw error;
      }

      // Handle empty responses (e.g., 204 No Content)
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null as T;
      }

      const data = await response.json();
      // API returns data directly, not wrapped
      return data as T;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        throw {
          message: 'Request timeout. Please try again.',
          status: 408,
        } as ApiError;
      }

      if (error && typeof error === 'object' && 'message' in error) {
        throw error as ApiError;
      }

      throw {
        message: 'Network error. Please check your connection.',
        status: 0,
      } as ApiError;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * Public GET request — no Authorization header sent.
   * Use for endpoints that are publicly accessible without a token.
   */
  async publicGet<T>(endpoint: string): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: this.getHeaders(undefined, false, true),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        const error = await this.handleError(response);
        throw error;
      }
      if (response.status === 204 || response.headers.get('content-length') === '0') {
        return null as T;
      }
      return (await response.json()) as T;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error && error.name === 'AbortError') {
        throw { message: 'Request timeout. Please try again.', status: 408 };
      }
      if (error && typeof error === 'object' && 'message' in error) throw error;
      throw { message: 'Network error. Please check your connection.', status: 0 };
    }
  }

  /**
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
    });
  }

  /**
   * PUT request
   */
  async put<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
    });
  }

  /**
   * PATCH request
   */
  async patch<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> {
    const isFormData = data instanceof FormData;
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: isFormData ? data : (data ? JSON.stringify(data) : undefined),
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T | null> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

// Create and export a singleton instance
export const apiClient = new ApiClient(API_BASE_URL);
