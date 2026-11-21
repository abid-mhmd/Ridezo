import { API_ENDPOINTS } from '../../../../common/constants/api_endpoints';
import type { ApiResponse } from '../../../../common/types/api-response.types';

import type {
  AdminBookingListParams,
  AdminBookingListResponse,
} from '../types/admin-booking.types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export async function getAdminBookings(
  accessToken: string,
  params: AdminBookingListParams,
): Promise<AdminBookingListResponse> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });

  if (params.search?.trim()) {
    searchParams.set('search', params.search.trim());
  }

  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.ADMIN.BOOKINGS}?${searchParams.toString()}`,
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
        : 'Unable to load bookings. Please try again.';

    throw new Error(
      Array.isArray(message) ? message.join(', ') : String(message),
    );
  }

  const result = data as ApiResponse<AdminBookingListResponse['bookings']>;

  return {
    bookings: result.data,
    pagination: result.meta!,
  };
}
