/**
 * Authentication Hooks
 * 
 * React Query hooks for authentication operations
 * Updated to match Swagger API documentation
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import * as authService from '../services/auth';
import type {
  LoginRequest,
  RegisterRequest,
  SendOTPRequest,
  ResendOTPRequest,
  VerifyOTPRequest,
} from '../services/auth';

/**
 * Hook for sending OTP
 */
export const useSendOTP = () => {
  return useMutation({
    mutationFn: (data: SendOTPRequest) => authService.sendOTP(data),
    onSuccess: () => {
      toast.success('OTP sent to your email. Please check your inbox.');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Failed to send OTP. Please try again.');
    },
  });
};

/**
 * Hook for resending OTP
 */
export const useResendOTP = () => {
  return useMutation({
    mutationFn: (data: ResendOTPRequest) => authService.resendOTP(data),
    onSuccess: () => {
      toast.success('OTP resent to your email.');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Failed to resend OTP. Please try again.');
    },
  });
};

/**
 * Hook for verifying OTP
 */
export const useVerifyOTP = () => {
  return useMutation({
    mutationFn: (data: VerifyOTPRequest) => authService.verifyOTP(data),
    onSuccess: () => {
      toast.success('OTP verified successfully!');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Invalid OTP. Please try again.');
    },
  });
};

/**
 * Hook for user login
 * Returns access and refresh tokens
 */
export const useLogin = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: () => {
      // Tokens are stored automatically by the service
      toast.success('Welcome back!');
      // Navigate based on stored user preference or default to marketplace
      navigate('/marketplace');
    },
    onError: (error: { message?: string }) => {
      toast.error(error.message || 'Login failed. Please check your credentials.');
    },
  });
};

/**
 * Hook for user registration
 * Note: Registration might require OTP verification first
 */
export const useRegister = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (response, variables) => {
      toast.success('Account created successfully!');
      // Navigate based on account type
      navigate(variables.account_type === 'seller' ? '/dashboard' : '/marketplace');
    },
    onError: (error: { message?: string; errors?: Record<string, string[]> }) => {
      if (error.errors) {
        Object.values(error.errors).flat().forEach((msg) => {
          toast.error(msg);
        });
      } else {
        toast.error(error.message || 'Registration failed. Please try again.');
      }
    },
  });
};

/**
 * Hook for refreshing access token
 */
export const useRefreshToken = () => {
  return useMutation({
    mutationFn: (refreshToken?: string) => authService.refreshToken(refreshToken),
    onError: (error: { message?: string }) => {
      // If refresh fails, user needs to login again
      toast.error('Session expired. Please login again.');
    },
  });
};

/**
 * Hook for user logout
 */
export const useLogout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => authService.logout(),
    onSuccess: () => {
      queryClient.clear();
      toast.success('Logged out successfully');
      navigate('/');
    },
    onError: () => {
      // Even if API call fails, clear local state
      queryClient.clear();
      navigate('/');
    },
  });
};
