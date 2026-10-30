export interface AuthUserResponseDto {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  role?: string;
}

export interface RegisterResponseDto {
  user: Pick<AuthUserResponseDto, 'id' | 'firstName' | 'lastName' | 'email'>;
}

export interface LoginResponseDto {
  accessToken: string;
  expiresIn: number;
  user: AuthUserResponseDto;
}

export interface RefreshResponseDto {
  accessToken: string;
  expiresIn: number;
}

export interface CurrentUserResponseDto {
  user: Pick<AuthUserResponseDto, 'id' | 'email' | 'role'>;
}

export interface ForgotPasswordResponseDto {
  otpSent: boolean;
}
