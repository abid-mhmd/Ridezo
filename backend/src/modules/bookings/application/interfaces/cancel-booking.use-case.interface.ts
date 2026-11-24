import type { BookingEntity } from '../../domain/entities/booking.entity';

export const CANCEL_BOOKING_USE_CASE = Symbol('CANCEL_BOOKING_USE_CASE');

export interface ICancelBookingUseCase {
  execute(bookingId: string, passengerId: string): Promise<BookingEntity>;
}
