import { apiRequest } from '../../../api/http';
import type { ApiResponse } from '../../../common/types/api-response.types';

import type {
  Booking,
  CreateBookingPayload,
  MyBookingsResult,
} from '../types/booking-types';

const BOOKING_ENDPOINTS = {
  ROOT: '/bookings',
  MY_BOOKINGS: '/bookings/my-bookings',
  DRIVER_REQUESTS: '/bookings/requests',
} as const;

export async function createBooking(
  payload: CreateBookingPayload,
): Promise<Booking> {
  const response = await apiRequest<ApiResponse<Booking>>(
    BOOKING_ENDPOINTS.ROOT,
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
  );

  return response.data;
}

export async function getMyBookings(
  page = 1,
  limit = 10,
): Promise<MyBookingsResult> {
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const response = await apiRequest<ApiResponse<MyBookingsResult>>(
    `${BOOKING_ENDPOINTS.MY_BOOKINGS}?${queryParams.toString()}`,
  );

  return response.data;
}
export async function getDriverBookingRequests(
  page = 1,
  limit = 10,
): Promise<MyBookingsResult> {
  const queryParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });

  const response = await apiRequest<ApiResponse<MyBookingsResult>>(
    `${BOOKING_ENDPOINTS.DRIVER_REQUESTS}?${queryParams.toString()}`,
  );

  return response.data;
}
