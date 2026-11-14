import { apiRequest } from '../../../api/http';
import type { ApiResponse } from '../../../common/types/api-response.types';

import type { SearchRidesParams, SearchRidesResult } from '../types/ride.types';

const RIDE_ENDPOINTS = {
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
