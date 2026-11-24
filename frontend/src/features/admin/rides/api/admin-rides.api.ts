import { API_ENDPOINTS } from '../../../../common/constants/api_endpoints';
import type { ApiResponse } from '../../../../common/types/api-response.types';
import type {
  AdminRideDetails,
  AdminRideListParams,
  AdminRideListResponse,
  AdminRideStatus,
} from '../types/admin-ride.types';

const API_BASE_URL =
  import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

function extractErrorMessage(data: unknown, fallback: string): string {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const message = (data as { message?: unknown }).message;
    return Array.isArray(message) ? message.join(', ') : String(message);
  }
  return fallback;
}

export async function getAdminRides(
  accessToken: string,
  params: AdminRideListParams,
): Promise<AdminRideListResponse> {
  const searchParams = new URLSearchParams({
    page: String(params.page),
    limit: String(params.limit),
  });

  if (params.search?.trim()) {
    searchParams.set('search', params.search.trim());
  }

  if (params.status) {
    searchParams.set('status', params.status);
  }

  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.ADMIN.RIDES}?${searchParams.toString()}`,
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
    throw new Error(
      extractErrorMessage(data, 'Unable to load rides. Please try again.'),
    );
  }

  const result = data as ApiResponse<AdminRideListResponse['rides']>;

  return {
    rides: result.data,
    pagination: result.meta!,
  };
}

export async function getAdminRideDetails(
  accessToken: string,
  rideId: string,
): Promise<AdminRideDetails> {
  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.ADMIN.RIDE_BY_ID(rideId)}`,
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
    throw new Error(
      extractErrorMessage(
        data,
        'Unable to load ride details. Please try again.',
      ),
    );
  }

  const result = data as ApiResponse<AdminRideDetails>;
  return result.data;
}

export async function cancelAdminRide(
  accessToken: string,
  rideId: string,
): Promise<{ id: string; status: AdminRideStatus }> {
  const response = await fetch(
    `${API_BASE_URL}${API_ENDPOINTS.ADMIN.CANCEL_RIDE(rideId)}`,
    {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      credentials: 'include',
    },
  );

  const data: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      extractErrorMessage(data, 'Unable to cancel ride. Please try again.'),
    );
  }

  const result = data as ApiResponse<{ id: string; status: AdminRideStatus }>;
  return result.data;
}
