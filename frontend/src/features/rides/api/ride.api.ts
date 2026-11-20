import { apiRequest } from '../../../api/http';
import type { ApiResponse } from '../../../common/types/api-response.types';

import type {
  SearchRidesParams,
  SearchRidesResult,
  Ride,
  CreateRidePayload,
  MyRidesResult,
  UpdateRidePayload,
} from '../types/ride.types';

const RIDE_ENDPOINTS = {
  ROOT: '/rides',
  SEARCH: '/rides/search',
  MY_RIDES: '/rides/my-rides',
  CANCEL: (rideId: string) => `/rides/${encodeURIComponent(rideId)}/cancel`,
} as const;

export async function searchRides(
  params: SearchRidesParams,
): Promise<SearchRidesResult> {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.set(key, String(value));
    }
  });

  const response = await apiRequest<ApiResponse<SearchRidesResult>>(
    `${RIDE_ENDPOINTS.SEARCH}?${queryParams.toString()}`,
  );

  return response.data;
}

export async function createRide(payload: CreateRidePayload): Promise<Ride> {
  const response = await apiRequest<ApiResponse<Ride>>(RIDE_ENDPOINTS.ROOT, {
    method: 'POST',
    body: JSON.stringify(payload),
  });

  return response.data;
}

export async function getRideDetails(rideId: string): Promise<Ride> {
  const response = await apiRequest<ApiResponse<Ride>>(
    `${RIDE_ENDPOINTS.ROOT}/${encodeURIComponent(rideId)}`,
  );

  return response.data;
}

export async function getMyRides(page = 1, limit = 10): Promise<MyRidesResult> {
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const response = await apiRequest<ApiResponse<MyRidesResult>>(
    `${RIDE_ENDPOINTS.MY_RIDES}?${queryParams.toString()}`,
  );

  return response.data;
}

export async function cancelRide(rideId: string): Promise<void> {
  await apiRequest<ApiResponse<undefined>>(RIDE_ENDPOINTS.CANCEL(rideId), {
    method: 'PATCH',
  });
}

export async function updateRide(
  rideId: string,
  payload: UpdateRidePayload,
): Promise<Ride> {
  const response = await apiRequest<ApiResponse<Ride>>(
    `${RIDE_ENDPOINTS.ROOT}/${encodeURIComponent(rideId)}`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}
