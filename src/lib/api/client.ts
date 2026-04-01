/**
 * API Client
 * 
 * This file contains the main API client for making HTTP requests.
 * It handles authentication, error handling, and request/response interceptors.
 */

import { API_BASE_URL, API_ENDPOINTS, API_TIMEOUT } from './config';

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

  constructor(baseURL: string, timeout: number = API_TIMEOUT) {
    this.baseURL = baseURL;
    this.timeout = timeout;
  }

  /**
   * Get access token from localStorage
   */
  private getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('access_token');
  }

  /**
   * Get refresh token from localStorage
   */
  private getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refresh_token');
  }

  /**
   * Set authentication tokens in localStorage
   */
  setTokens(access: string, refresh?: string, role?: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', access);
      if (refresh) {
        localStorage.setItem('refresh_token', refresh);
      }
      if (role) {
        localStorage.setItem('user_role', role);
      }
    }
  }

  /**
   * Remove authentication tokens from localStorage
   */
  removeTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_role');
    }
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
   * Attempt to refresh the JWT Access Token
   */
  private async refreshAccessToken(): Promise<boolean> {
    const refresh = this.getRefreshToken();
    if (!refresh) return false;

    try {
      const response = await fetch(`${this.baseURL}${API_ENDPOINTS.AUTH.TOKEN_REFRESH}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.access) {
          // Keep the existing refresh token, just update the access token
          this.setTokens(data.access, refresh, typeof window !== 'undefined' ? (localStorage.getItem('user_role') || undefined) : undefined);
          return true;
        }
      }
      return false;
    } catch {
      return false;
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
          if (refreshed) {
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
          } else {
            // Token refresh failed or didn't exist, log user out
            this.removeTokens();
            window.location.href = '/login'; // Force a visual redirect
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
