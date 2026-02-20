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
}

export interface RegisterRequest {
  email: string;
  password: string;
  account_type: AccountType;
  phone_number?: string;
  store?: {
    store_name: string;
    store_description?: string;
    store_logo?: string;
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

export interface VerifyOTPResponse {
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
 */
export const verifyOTP = async (data: VerifyOTPRequest): Promise<VerifyOTPResponse> => {
  return apiClient.post<VerifyOTPResponse>(API_ENDPOINTS.AUTH.OTP_VERIFY, data);
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
    apiClient.setTokens(response.access, response.refresh);
  }
  
  return response;
};

/**
 * Register new user
 * Note: Registration might require OTP verification first
 */
export const register = async (data: RegisterRequest): Promise<RegisterResponse> => {
  const response = await apiClient.post<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, {
    email: data.email,
    password: data.password,
    account_type: data.account_type,
    phone_number: data.phone_number,
    store: data.store,
  });
  
  return response;
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
