import type {
  AdminUserListParams,
  AdminUserListResponse,
} from '../types/admin-user.types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export async function getAdminUsers(
  accessToken: string,
  params: AdminUserListParams,
): Promise<AdminUserListResponse> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });

  if (params.search?.trim()) {
    searchParams.set('search', params.search.trim());
  }

  const response = await fetch(
    `${API_BASE_URL}/admin/users?${searchParams.toString()}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
    },
  );

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof data === 'object' && data !== null && 'message' in data
        ? data.message
        : 'Unable to load users. Please try again.';

    throw new Error(
      Array.isArray(message) ? message.join(', ') : String(message),
    );
  }

  return data as AdminUserListResponse;
}
