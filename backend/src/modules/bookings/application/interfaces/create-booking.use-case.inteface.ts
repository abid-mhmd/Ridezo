import type { BookingEntity } from '../../domain/entities/booking.entity';
import type { CreateBookingDto } from '../dto/create-booking.dto';

export const CREATE_BOOKING_USE_CASE = Symbol('CREATE_BOOKING_USE_CASE');

export interface ICreateBookingUseCase {
  execute(passengerId: string, dto: CreateBookingDto): Promise<BookingEntity>;
}
