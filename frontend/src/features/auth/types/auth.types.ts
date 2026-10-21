export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

export interface LoginResponse {
  message: string;
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

export interface RegisterResponse {
  message: string;
}

export interface VerifyEmailOtpRequest {
  email: string;
  otp: string;
}

export interface VerifyEmailOtpResponse {
  message: string;
}

export interface ResendEmailOtpRequest {
  email: string;
}

export interface ResendEmailOtpResponse {
  message: string;
}
