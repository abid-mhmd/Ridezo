import type {
  AdminLoginInput,
  AdminLoginResponse,
} from '../types/admin-auth.types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export async function loginAdmin(
  input: AdminLoginInput,
): Promise<AdminLoginResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/login`, {
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

  return data as AdminLoginResponse;
}

let adminRefreshPromise: Promise<{
  accessToken: string;
  expiresIn: number;
}> | null = null;

export function refreshAdminSession(): Promise<{
  accessToken: string;
  expiresIn: number;
}> {
  if (adminRefreshPromise) {
    return adminRefreshPromise;
  }

  adminRefreshPromise = (async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Admin session expired.');
      }

      const data: unknown = await response.json();

      if (
        typeof data !== 'object' ||
        data === null ||
        !('accessToken' in data) ||
        typeof data.accessToken !== 'string' ||
        !('expiresIn' in data) ||
        typeof data.expiresIn !== 'number'
      ) {
        throw new Error('Invalid admin refresh response.');
      }

      return {
        accessToken: data.accessToken,
        expiresIn: data.expiresIn,
      };
    } finally {
      adminRefreshPromise = null;
    }
  })();

  return adminRefreshPromise;
}

export async function logoutAdmin(): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/admin/logout`, {
    method: 'POST',
    credentials: 'include',
  });

  if (!response.ok) {
    throw new Error('Unable to complete admin logout.');
  }
}
