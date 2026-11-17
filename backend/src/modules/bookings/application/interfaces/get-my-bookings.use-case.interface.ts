import type { BookingEntity } from '../../domain/entities/booking.entity';

export const GET_MY_BOOKINGS_USE_CASE = Symbol('GET_MY_BOOKINGS_USE_CASE');

export interface IGetMyBookingsUseCase {
  execute(
    passengerId: string,
    query: {
      page: number;
      limit: number;
    },
  ): Promise<{
    bookings: BookingEntity[];
    total: number;
  }>;
}
