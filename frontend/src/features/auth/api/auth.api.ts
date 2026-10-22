import { apiRequest, setAccessToken } from '../../../api/http';
import type {
  AuthUser,
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

interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
}

interface CurrentUserResponse {
  user: {
    id: string;
    email: string;
    role: string;
  };
}

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

export async function refreshLoginSession(): Promise<string> {
  const result = await apiRequest<RefreshResponse>('/auth/refresh', {
    method: 'POST',
  });

  setAccessToken(result.accessToken);

  return result.accessToken;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const result = await apiRequest<CurrentUserResponse>('/auth/me');

  return {
    id: result.user.id,
    email: result.user.email,
    role: result.user.role,
    firstName: '',
    lastName: '',
  };
}

export async function logoutUser(): Promise<void> {
  try {
    await apiRequest('/auth/logout', { method: 'POST' });
  } finally {
    setAccessToken(null);
  }
}
