import type { BookingEntity } from '../../domain/entities/booking.entity';
import type { RespondBookingRequestDto } from '../dto/respond-booking-request.dto';

export const RESPOND_TO_BOOKING_REQUEST_USE_CASE = Symbol(
  'RESPOND_TO_BOOKING_REQUEST_USE_CASE',
);

export interface IRespondToBookingRequestUseCase {
  execute(
    bookingId: string,
    driverId: string,
    dto: RespondBookingRequestDto,
  ): Promise<BookingEntity>;
}
