import { apiRequest } from '../../../api/http';
import type { LoginRequest, LoginResponse } from '../types/auth.types';

export function loginUser(credentials: LoginRequest): Promise<LoginResponse> {
  return apiRequest<LoginResponse>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}
