import { apiRequest, setAccessToken } from '../../../api/http';
import { API_ENDPOINTS } from '../../../common/constants/api_endpoints';
import type {
  AuthUser,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  RegisterResponse,
  VerifyEmailOtpRequest,
  // VerifyEmailOtpResponse,
  ResendEmailOtpRequest,
  ResendEmailOtpResponse,
  ForgotPasswordRequest,
  ForgotPasswordResponce,
  VerifyResetOtpResponse,
  verifyResetOtpRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from '../types/auth.types';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

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

export async function loginUser(
  credentials: LoginRequest,
): Promise<LoginResponse> {
  const response = await apiRequest<ApiResponse<LoginResponse>>(
    API_ENDPOINTS.AUTH.LOGIN,
    {
      method: 'POST',
      body: JSON.stringify(credentials),
    },
  );

  return response.data;
}

export async function registerUser(
  userData: RegisterRequest,
): Promise<RegisterResponse> {
  const response = await apiRequest<ApiResponse<RegisterResponse>>(
    API_ENDPOINTS.AUTH.REGISTER,
    {
      method: 'POST',
      body: JSON.stringify(userData),
    },
  );
  return response.data;
}

export async function verifyEmailOtp(
  data: VerifyEmailOtpRequest,
): Promise<ApiResponse<undefined>> {
  return apiRequest<ApiResponse<undefined>>(
    API_ENDPOINTS.AUTH.VERIFY_EMAIL_OTP,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );
}

export async function resendEmailOtp(
  data: ResendEmailOtpRequest,
): Promise<ResendEmailOtpResponse> {
  return apiRequest<ResendEmailOtpResponse>(API_ENDPOINTS.AUTH.EMAIL_OTP, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function forgotPassword(
  data: ForgotPasswordRequest,
): Promise<ForgotPasswordResponce> {
  const response = await apiRequest<ApiResponse<ForgotPasswordResponce>>(
    API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );
  return response.data!;
}

export async function verifyResetOtp(
  data: verifyResetOtpRequest,
): Promise<VerifyResetOtpResponse> {
  const response = await apiRequest<ApiResponse<VerifyResetOtpResponse>>(
    API_ENDPOINTS.AUTH.VERIFY_RESET_OTP,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );
  return response.data!;
}

export async function resetPassword(
  data: ResetPasswordRequest,
): Promise<ResetPasswordResponse> {
  const response = await apiRequest<ApiResponse<undefined>>(
    API_ENDPOINTS.AUTH.RESET_PASSWORD,
    {
      method: 'POST',
      body: JSON.stringify(data),
    },
  );
  return {
    message: response.message ?? 'Password reset successful.',
  };
}

export async function refreshLoginSession(): Promise<string> {
  const response = await apiRequest<ApiResponse<RefreshResponse>>(
    API_ENDPOINTS.AUTH.REFRESH,
    {
      method: 'POST',
    },
  );

  setAccessToken(response.data.accessToken);

  return response.data.accessToken;
}

export async function getCurrentUser(): Promise<AuthUser> {
  const response = await apiRequest<ApiResponse<CurrentUserResponse>>(
    API_ENDPOINTS.AUTH.ME,
  );

  const user = response.data!.user;
  return {
    id: user.id,
    email: user.email,
    role: user.role,
    firstName: '',
    lastName: '',
  };
}

export async function logoutUser(): Promise<void> {
  try {
    await apiRequest<ApiResponse<undefined>>(API_ENDPOINTS.AUTH.LOGOUT, {
      method: 'POST',
    });
  } finally {
    setAccessToken(null);
  }
}
