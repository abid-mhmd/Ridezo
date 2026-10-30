import { API_ENDPOINTS } from '../../../../common/constants/api_endpoints';
import type {
  AdminLoginInput,
  AdminLoginResponse,
} from '../types/admin-auth.types';
import type { ApiResponse } from '../../../../common/types/api-response.types';
import type { AdminRefreshResponse } from '../types/admin-auth.types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export async function loginAdmin(
  input: AdminLoginInput,
): Promise<AdminLoginResponse> {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.LOGIN}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof data === 'object' && data !== null && 'message' in data
        ? data.message
        : 'Unable to sign in. Please try again.';

    throw new Error(
      Array.isArray(message) ? message.join(', ') : String(message),
    );
  }

  const result = data as ApiResponse<AdminLoginResponse>;
  return result.data;
}

let adminRefreshPromise: Promise<{
  accessToken: string;
  expiresIn: number;
}> | null = null;

export function refreshAdminSession(): Promise<AdminRefreshResponse> {
  if (adminRefreshPromise) {
    return adminRefreshPromise;
  }

  adminRefreshPromise = (async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.ADMIN.REFRESH}`,
        {
          method: 'POST',
          credentials: 'include',
        },
      );

      if (!response.ok) {
        throw new Error('Admin session expired.');
      }

      const result: ApiResponse<AdminRefreshResponse> = await response.json();

      if (
        !result.success ||
        !result.data ||
        typeof result.data.accessToken !== 'string' ||
        typeof result.data.expiresIn !== 'number'
      ) {
        throw new Error('Invalid admin refresh response.');
      }

      return result.data;
    } finally {
      adminRefreshPromise = null;
    }
  })();

  return adminRefreshPromise;
}

export async function logoutAdmin(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ADMIN.LOGOUT}`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Unable to complete admin logout.');
  }
}

