import type { BookingEntity } from '../../domain/entities/booking.entity';

export const GET_BOOKINGS_FOR_USER_USE_CASE = Symbol(
  'GET_BOOKINGS_FOR_USER_USE_CASE',
);

export type BookingListRole = 'passenger' | 'driver';

export interface IGetBookingsForUserUseCase {
  execute(
    userId: string,
    query: {
      page: number;
      limit: number;
    },
    role: BookingListRole,
  ): Promise<{
    bookings: BookingEntity[];
    total: number;
  }>;
}
