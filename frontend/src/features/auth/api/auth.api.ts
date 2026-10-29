import { apiRequest, setAccessToken } from '../../../api/http';
import { API_ENDPOINTS } from '../../../common/constants/api_endpoints';
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
  return apiRequest<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

export function registerUser(
  userData: RegisterRequest,
): Promise<RegisterResponse> {
  return apiRequest<RegisterResponse>(API_ENDPOINTS.AUTH.REGISTER, {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

export function verifyEmailOtp(
  data: VerifyEmailOtpRequest,
): Promise<VerifyEmailOtpResponse> {
  return apiRequest<VerifyEmailOtpResponse>(
    API_ENDPOINTS.AUTH.VERIFY_EMAIL_OTP,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );
}

export function resendEmailOtp(
  data: ResendEmailOtpRequest,
): Promise<ResendEmailOtpResponse> {
  return apiRequest<ResendEmailOtpResponse>(API_ENDPOINTS.AUTH.EMAIL_OTP, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function forgotPassword(
  data: ForgotPasswordRequest,
): Promise<ForgotPasswordResponce> {
  return apiRequest<ForgotPasswordResponce>(
    API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );
}

export function verifyResetOtp(
  data: verifyResetOtpRequest,
): Promise<VerifyResetOtpResponse> {
  return apiRequest<VerifyResetOtpResponse>(
    API_ENDPOINTS.AUTH.VERIFY_RESET_OTP,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );
}

export function resetPassword(
  data: ResetPasswordRequest,
): Promise<ResetPasswordResponse> {
  return apiRequest<ResetPasswordResponse>(API_ENDPOINTS.AUTH.RESET_PASSWORD, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function refreshLoginSession(): Promise<string> {
  const result = await apiRequest<RefreshResponse>(API_ENDPOINTS.AUTH.REFRESH, {
    method: 'POST',
  });

  setAccessToken(result.accessToken);

  return result.accessToken;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const result = await apiRequest<CurrentUserResponse>(API_ENDPOINTS.AUTH.ME);

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
    await apiRequest(API_ENDPOINTS.AUTH.LOGOUT, { method: 'POST' });
  } finally {
    setAccessToken(null);
  }
}
