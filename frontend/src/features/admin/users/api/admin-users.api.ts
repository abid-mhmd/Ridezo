import { API_ENDPOINTS } from '../../../../common/constants/api_endpoints';
import type {
  AdminUserListParams,
  AdminUserListResponse,
  AdminUserDetailsResponse,
  AccountStatus,
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
    `${API_BASE_URL}${API_ENDPOINTS.ADMIN.USERS}?${searchParams.toString()}`,
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

export async function getAdminUserDetails(
  accessToken: string,
  userId: string,
): Promise<AdminUserDetailsResponse> {
  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.ADMIN.USERS}${encodeURIComponent(userId)}`,
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
        : 'Unable to load user details. Please try again.';

    throw new Error(
      Array.isArray(message) ? message.join(', ') : String(message),
    );
  }

  return data as AdminUserDetailsResponse;
}

export async function updateAdminUserStatus(
  accessToken: string,
  userId: string,
  accountStatus: AccountStatus,
): Promise<{ id: string; accountStatus: AccountStatus }> {
  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.ADMIN.USERS}${encodeURIComponent(userId)}/status`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ status: accountStatus }),
    },
  );

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      typeof data === 'object' && data !== null && 'message' in data
        ? data.message
        : 'Unable to update user status. Please try again.';

    throw new Error(
      Array.isArray(message) ? message.join(', ') : String(message),
    );
  }

  return data as { id: string; accountStatus: AccountStatus };
}
