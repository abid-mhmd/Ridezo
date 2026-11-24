import {
  BadRequestException,
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  BOOKING_REPOSITORY,
  type IBookingRepository,
} from '../../domain/repositories/booking.repository';
import {
  RIDE_REPOSITORY,
  type IRideRepository,
} from '../../../rides/domain/repositories/ride.repository';
import { BookingStatus } from '../../domain/enums/booking.enums';
import type { BookingEntity } from '../../domain/entities/booking.entity';
import type { ICancelBookingUseCase } from '../interfaces/cancel-booking.use-case.interface';

export const CANCEL_BOOKING_USE_CASE = Symbol('CANCEL_BOOKING_USE_CASE');

@Injectable()
export class CancelBookingUseCase implements ICancelBookingUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,

    @Inject(RIDE_REPOSITORY)
    private readonly rideRepository: IRideRepository,
  ) {}

  async execute(
    bookingId: string,
    passengerId: string,
  ): Promise<BookingEntity> {
    const booking = await this.bookingRepository.findById(bookingId);

    if (!booking) {
      throw new NotFoundException('Booking not found.');
    }

    if (booking.passengerId !== passengerId) {
      throw new ForbiddenException('You can only cancel your own bookings.');
    }

    if (
      booking.status !== BookingStatus.PENDING &&
      booking.status !== BookingStatus.ACCEPTED
    ) {
      throw new BadRequestException('This booking can no longer be cancelled.');
    }

    const updated = await this.bookingRepository.updateStatus(
      booking.id,
      booking.status,
      { status: BookingStatus.CANCELLED },
    );

    if (!updated) {
      throw new BadRequestException(
        'Booking status changed concurrently. Please refresh and try again.',
      );
    }

    // Atomically restore seats to the ride
    await this.rideRepository.releaseSeats(
      booking.rideId,
      booking.seatsRequested,
    );

    return updated;
  }
}
