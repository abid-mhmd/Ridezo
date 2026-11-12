import type { AdminLoginInput } from '../dto/admin-login.input';

export interface AdminLoginResult {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshTtl: number;
  user: {
    id: string;
    firstName: string;
    lastName?: string;
    email: string;
    role: string;
  };
}

export interface IAdminLoginUseCase {
  execute(input: AdminLoginInput): Promise<AdminLoginResult>;
}

export const ADMIN_LOGIN_USE_CASE = Symbol('ADMIN_LOGIN_USE_CASE');
