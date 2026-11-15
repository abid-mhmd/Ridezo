import { apiRequest } from '../../../api/http';
import type { ApiResponse } from '../../../common/types/api-response.types';

import type {
  SearchRidesParams,
  SearchRidesResult,
  Ride,
  CreateRidePayload,
} from '../types/ride.types';

const RIDE_ENDPOINTS = {
  ROOT: '/rides',
  SEARCH: '/rides/search',
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
