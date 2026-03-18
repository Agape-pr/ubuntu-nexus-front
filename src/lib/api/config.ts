/**
 * API Configuration
 * 
 * This file contains the base configuration for API calls.
 * The API base URL is read from environment variables.
 */

// Get API base URL from environment variable
// In Vite, environment variables must be prefixed with VITE_
// Default assumes backend is at /api/v1/
let BASE_API_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

// Auto-fix misconfigured production environment variables (e.g. Vercel)
// If the URL starts with a domain name instead of a protocol or a slash, prepend https://
if (!BASE_API_URL.startsWith('http://') && !BASE_API_URL.startsWith('https://') && !BASE_API_URL.startsWith('/')) {
  BASE_API_URL = `https://${BASE_API_URL}`;
}

export const API_BASE_URL = BASE_API_URL.endsWith('/v1') ? BASE_API_URL : `${BASE_API_URL}/v1`;

// API endpoints matching Swagger documentation
export const API_ENDPOINTS = {
  // Authentication & OTP
  AUTH: {
    // OTP Flow
    OTP_SEND: '/auth/otp/email/send/',
    OTP_RESEND: '/auth/otp/resend/',
    OTP_VERIFY: '/auth/otp/verify/',

    // User Authentication
    LOGIN: '/users/login',
    REGISTER: '/users/register',
    TOKEN_REFRESH: '/users/token/refresh',
  },

  // Users
  USERS: {
    ME: '/users/me/',
    STORE_PUBLIC: (slug: string) => `/users/store/${slug}/`,
  },

  // Products (Public)
  PRODUCTS: {
    LIST: '/products/products/',
    DETAIL: (slug: string) => `/products/products/${slug}/`,
  },

  // Products (Seller)
  SELLER_PRODUCTS: {
    LIST: '/products/seller/products/',
    DETAIL: (id: string) => `/products/seller/products/${id}/`,
    CREATE: '/products/seller/products/',
    UPDATE: (id: string) => `/products/seller/products/${id}/`,
    PATCH: (id: string) => `/products/seller/products/${id}/`,
    DELETE: (id: string) => `/products/seller/products/${id}/`,
  },

  // Categories
  CATEGORIES: {
    LIST: '/products/categories/',
    DETAIL: (id: number) => `/products/categories/${id}/`,
    CREATE: '/products/categories/',
    UPDATE: (id: number) => `/products/categories/${id}/`,
    PATCH: (id: number) => `/products/categories/${id}/`,
    DELETE: (id: number) => `/products/categories/${id}/`,
  },
} as const;

// Request timeout (in milliseconds)
export const API_TIMEOUT = 60000; // 60 seconds
