export interface AdminLoginInput {
  email: string;
  password: string;
}

export interface AdminUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'admin';
}

export interface AdminLoginResponse {
  message: string;
  accessToken: string;
  expiresIn: number;
  user: AdminUser;
}

export interface AdminRefreshResponse {
  accessToken: string;
  expiresIn: number;
}
