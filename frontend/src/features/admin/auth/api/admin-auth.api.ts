import type {
  AdminLoginInput,
  AdminLoginResponse,
} from '../types/admin-auth.types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export async function loginAdmin(
  input: AdminLoginInput,
): Promise<AdminLoginResponse> {
  const response = await fetch(`${API_BASE_URL}/admin/auth/login`, {
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
