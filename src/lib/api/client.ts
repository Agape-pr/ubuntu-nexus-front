/**
 * API Client
 * 
 * This file contains the main API client for making HTTP requests.
 * It handles authentication, error handling, and request/response interceptors.
 */

import { API_BASE_URL, API_TIMEOUT } from './config';

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
    return localStorage.getItem('access_token');
  }

  /**
   * Get refresh token from localStorage
   */
  private getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  /**
   * Set authentication tokens in localStorage
   */
  setTokens(access: string, refresh?: string): void {
    localStorage.setItem('access_token', access);
    if (refresh) {
      localStorage.setItem('refresh_token', refresh);
    }
  }

  /**
   * Remove authentication tokens from localStorage
   */
  removeTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  /**
   * Get headers for API requests
   */
  private getHeaders(customHeaders?: Record<string, string>): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...customHeaders,
    };

    const token = this.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
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
      const fieldErrors = errorData as Record<string, string[]>;
      if (typeof fieldErrors === 'object' && !Array.isArray(fieldErrors)) {
        const msgs = Object.entries(fieldErrors)
          .flatMap(([k, v]) => (Array.isArray(v) ? v : [String(v)]))
          .filter(Boolean);
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

    if (status === 401) {
      this.removeTokens();
    }
    return error;
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

    try {
      const response = await fetch(url, {
        ...options,
        headers: this.getHeaders(options.headers as Record<string, string>),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
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
   * POST request
   */
  async post<T>(
    endpoint: string,
    data?: unknown,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
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
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
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
    return this.request<T>(endpoint, {
      ...options,
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
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
