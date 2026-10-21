import { apiRequest } from '../../../api/http';
import type {
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailOtpRequest,
  VerifyEmailOtpResponse,
  ResendEmailOtpRequest,
  ResendEmailOtpResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponce,
  VerifyResetOtpResponse,
  verifyResetOtpRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '../types/auth.types';

export function loginUser(credentials: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function registerUser(
  userData: RegisterRequest,
): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export function verifyEmailOtp(
  data: VerifyEmailOtpRequest,
): Promise<VerifyEmailOtpResponse> {
  return apiRequest<VerifyEmailOtpResponse>('/auth/verify-email-otp', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function resendEmailOtp(
  data: ResendEmailOtpRequest,
): Promise<ResendEmailOtpResponse> {
  return apiRequest<ResendEmailOtpResponse>('/auth/email-otp', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function forgotPassword(
  data: ForgotPasswordRequest,
): Promise<ForgotPasswordResponce> {
  return apiRequest<ForgotPasswordResponce>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function verifyResetOtp(
  data: verifyResetOtpRequest,
): Promise<VerifyResetOtpResponse> {
  return apiRequest<VerifyResetOtpResponse>('/auth/verify-reset-otp', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function resetPassword(
  data: ResetPasswordRequest,
): Promise<ResetPasswordResponse> {
  return apiRequest<ResetPasswordResponse>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
