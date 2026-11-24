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
import type { RespondBookingRequestDto } from '../dto/respond-booking-request.dto';
import type { IRespondToBookingRequestUseCase } from '../interfaces/respond-to-booking-request.use-case.interface';

@Injectable()
export class RespondToBookingRequestUseCase implements IRespondToBookingRequestUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,

    @Inject(RIDE_REPOSITORY)
    private readonly rideRepository: IRideRepository,
  ) {}

  async execute(
    bookingId: string,
    driverId: string,
    dto: RespondBookingRequestDto,
  ): Promise<BookingEntity> {
    const booking = await this.bookingRepository.findById(bookingId);

    if (!booking) {
      throw new NotFoundException('Booking request not found.');
    }

    if (booking.driverId !== driverId) {
      throw new ForbiddenException(
        'Only the ride driver can respond to this booking request.',
      );
    }

    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException(
        'This booking request has already been processed.',
      );
    }

    const nextStatus =
      dto.decision === 'accepted'
        ? BookingStatus.ACCEPTED
        : BookingStatus.REJECTED;

    const updated = await this.bookingRepository.updateStatus(
      booking.id,
      BookingStatus.PENDING,
      {
        status: nextStatus,
        ...(dto.decision === 'rejected' && {
          rejectionReason:
            dto.rejectionReason?.trim() || 'Declined by the driver.',
        }),
      },
    );

    if (!updated) {
      throw new BadRequestException(
        'Booking request status changed concurrently. Please refresh.',
      );
    }

    // If rejected, release the reserved seats back to the ride
    if (dto.decision === 'rejected') {
      await this.rideRepository.releaseSeats(
        booking.rideId,
        booking.seatsRequested,
      );
    }

    return updated;
  }
}
