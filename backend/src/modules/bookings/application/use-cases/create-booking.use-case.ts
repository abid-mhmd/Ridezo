import { Inject, Injectable } from '@nestjs/common';
import {
  BOOKING_REPOSITORY,
  type IBookingRepository,
  type CreateBookingData,
} from '../../domain/repositories/booking.repository';
import type { BookingEntity } from '../../domain/entities/booking.entity';
import { BookingStatus } from '../../domain/enums/booking.enums';
import {
  RIDE_REPOSITORY,
  type IRideRepository,
} from '../../../rides/domain/repositories/ride.repository';
import { RideStatus } from '../../../rides/domain/enums/ride.enums';
import type { CreateBookingDto } from '../dto/create-booking.dto';
import type { ICreateBookingUseCase } from '../interfaces/create-booking.use-case.inteface';

export class RideNotFoundError extends Error {
  constructor() {
    super('Ride not found.');
    this.name = 'RideNotFoundError';
  }
}

export class CannotBookOwnRideError extends Error {
  constructor() {
    super('You cannot book your own ride.');
    this.name = 'CannotBookOwnRideError';
  }
}

export class RideNotAvailableError extends Error {
  constructor() {
    super('This ride is not available for booking.');
    this.name = 'RideNotAvailableError';
  }
}

export class InsufficientSeatsError extends Error {
  constructor() {
    super('Not enough available seats.');
    this.name = 'InsufficientSeatsError';
  }
}

export class DuplicateBookingError extends Error {
  constructor() {
    super('You already have an active booking for this ride.');
    this.name = 'DuplicateBookingError';
  }
}

@Injectable()
export class CreateBookingUseCase implements ICreateBookingUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,

    @Inject(RIDE_REPOSITORY)
    private readonly rideRepository: IRideRepository,
  ) {}

  async execute(
    passengerId: string,
    dto: CreateBookingDto,
  ): Promise<BookingEntity> {
    const ride = await this.rideRepository.findById(dto.rideId);

    if (!ride) {
      throw new RideNotFoundError();
    }

    if (ride.driverId === passengerId) {
      throw new CannotBookOwnRideError();
    }

    if (
      ride.status !== RideStatus.SCHEDULED ||
      ride.departureTime.getTime() <= Date.now()
    ) {
      throw new RideNotAvailableError();
    }

    if (ride.availableSeats < dto.seatsRequested) {
      throw new InsufficientSeatsError();
    }

    const existingBooking =
      await this.bookingRepository.findActiveByPassengerAndRide(
        passengerId,
        dto.rideId,
      );

    if (existingBooking) {
      throw new DuplicateBookingError();
    }

    const totalPrice = ride.pricePerSeat * dto.seatsRequested;

    const bookingData: CreateBookingData = {
      rideId: ride.id,
      passengerId,
      driverId: ride.driverId,
      seatsRequested: dto.seatsRequested,
      pricePerSeat: ride.pricePerSeat,
      totalPrice,
      message: dto.message,
      status: BookingStatus.PENDING,
    };

    return this.bookingRepository.create(bookingData);
  }
}
