/**
 * Authentication API Service
 * 
 * This file contains API functions for authentication-related endpoints.
 * Based on Swagger documentation: /api/v1/users/login, /api/v1/users/register, etc.
 */

import { apiClient } from '../client';
import { API_ENDPOINTS } from '../config';

export type AccountType = 'buyer' | 'seller';
export type OTPPurpose = 'register' | 'login' | 'reset_password';

export interface LoginRequest {
  username: string; // Can be email or username
  password: string;
}

export interface LoginResponse {
  access: string;
  refresh: string;
  user?: {
    id: number;
    email: string;
    role: string;
  };
}

export interface RegisterRequest {
  email: string;
  password: string;
  account_type: AccountType;
  phone_number?: string;
  store?: {
    store_name: string;
    store_description?: string;
    store_logo?: File | string; // File for multipart upload
  };
}

export interface RegisterResponse {
  email: string;
  phone_number?: string;
  store?: {
    store_name: string;
    store_description?: string;
    store_logo?: string;
  };
}

export interface TokenRefreshRequest {
  refresh: string;
}

export interface TokenRefreshResponse {
  access: string;
}

// OTP Flow
export interface SendOTPRequest {
  email: string;
  purpose: OTPPurpose;
}

export interface SendOTPResponse {
  email: string;
  purpose: OTPPurpose;
}

export interface ResendOTPRequest {
  email: string;
  purpose: OTPPurpose;
}

export interface ResendOTPResponse {
  email: string;
  purpose: OTPPurpose;
}

export interface VerifyOTPRequest {
  email: string;
  purpose: OTPPurpose;
  otp: string;
}

/**
 * Send OTP to email
 */
export const sendOTP = async (data: SendOTPRequest): Promise<SendOTPResponse> => {
  return apiClient.post<SendOTPResponse>(API_ENDPOINTS.AUTH.OTP_SEND, data);
};

/**
 * Resend OTP to email
 */
export const resendOTP = async (data: ResendOTPRequest): Promise<ResendOTPResponse> => {
  return apiClient.post<ResendOTPResponse>(API_ENDPOINTS.AUTH.OTP_RESEND, data);
};

/**
 * Verify OTP
 * Backend returns tokens on success - we store them here
 */
export interface VerifyOTPResponseWithTokens {
  message: string;
  access: string;
  refresh: string;
  user: { id: number; email: string; role: string };
}

export const verifyOTP = async (data: VerifyOTPRequest): Promise<VerifyOTPResponseWithTokens> => {
  const response = await apiClient.post<VerifyOTPResponseWithTokens>(API_ENDPOINTS.AUTH.OTP_VERIFY, data);
  // Backend returns tokens on verify - store them
  if (response.access && response.refresh) {
    apiClient.setTokens(response.access, response.refresh, response.user?.role);
  }
  return response;
};

/**
 * Login user
 * Returns access and refresh tokens
 */
export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
    username: data.username,
    password: data.password,
  });

  // Store tokens after successful login
  if (response.access && response.refresh) {
    apiClient.setTokens(response.access, response.refresh, response.user?.role);
  }

  return response;
};

/**
 * Register new user
 * Note: Registration might require OTP verification first
 */
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  // Always build nested JSON payload to perfectly match backend expectations
  const payload: Record<string, unknown> = {
    email: data.email,
    password: data.password,
    account_type: data.account_type,
  };

  if (data.phone_number) {
    payload.phone_number = data.phone_number;
  }

  if (data.account_type === 'seller' && data.store) {
    // If store_logo is a File object, it cannot be serialized directly into JSON.
    // For now, we drop it to ensure the JSON strictly matches the requested format.
    // Base64 encoding a 10MB image would crash standard JSON parsers.
    const storePayload: Record<string, unknown> = {
      store_name: data.store.store_name,
    };
    
    if (data.store.store_description) {
      storePayload.store_description = data.store.store_description;
    }
    
    // Only pass store_logo if it's already a URL/string. File objects are ignored in pure JSON.
    if (typeof data.store.store_logo === 'string') {
      storePayload.store_logo = data.store.store_logo;
    }

    payload.store = storePayload;
  }

  return apiClient.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, payload);
};

/**
 * Refresh access token using refresh token
 */
export const refreshToken = async (refreshToken?: string): Promise<TokenRefreshResponse> => {
  const refresh = refreshToken || localStorage.getItem('refresh_token');

  if (!refresh) {
    throw new Error('No refresh token available');
  }

  const response = await apiClient.post<TokenRefreshResponse>(
    API_ENDPOINTS.AUTH.TOKEN_REFRESH,
    { refresh }
  );

  // Update access token
  if (response.access) {
    apiClient.setTokens(response.access);
  }

  return response;
};

/**
 * Logout user
 * Note: Backend might not have explicit logout endpoint
 * We just clear tokens locally
 */
export const logout = async (): Promise<void> => {
  apiClient.removeTokens();
};
