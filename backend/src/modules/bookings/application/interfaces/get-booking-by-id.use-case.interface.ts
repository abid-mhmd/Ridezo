import type { BookingEntity } from '../../domain/entities/booking.entity';

export const GET_BOOKING_BY_ID_USE_CASE = Symbol('GET_BOOKING_BY_ID_USE_CASE');

export interface IGetBookingByIdUseCase {
  execute(bookingId: string, userId: string): Promise<BookingEntity>;
}
