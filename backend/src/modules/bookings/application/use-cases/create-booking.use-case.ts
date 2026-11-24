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
import {
  PROFILE_PHOTO_STORAGE,
  type IProfilePhotoStorage,
} from '../../../users/application/ports/profile-photo-storage';
import {
  VEHICLE_PHOTO_STORAGE,
  type IVehiclePhotoStorage,
} from '../../../vehicles/application/ports/vehicle-photo-storage';

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

export class RideDetailsUnavailableError extends Error {
  constructor() {
    super('Ride driver or vehicle information is unavailable.');
    this.name = 'RideDetailsUnavailableError';
  }
}

@Injectable()
export class CreateBookingUseCase implements ICreateBookingUseCase {
  constructor(
    @Inject(BOOKING_REPOSITORY)
    private readonly bookingRepository: IBookingRepository,

    @Inject(RIDE_REPOSITORY)
    private readonly rideRepository: IRideRepository,

    @Inject(PROFILE_PHOTO_STORAGE)
    private readonly profilePhotoStorage: IProfilePhotoStorage,

    @Inject(VEHICLE_PHOTO_STORAGE)
    private readonly vehiclePhotoStorage: IVehiclePhotoStorage,
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

    if (!ride.driver || !ride.vehicle) {
      throw new RideDetailsUnavailableError();
    }

    const bookingData: CreateBookingData = {
      rideId: ride.id,
      passengerId,
      driverId: ride.driverId,
      seatsRequested: dto.seatsRequested,
      pricePerSeat: ride.pricePerSeat,
      totalPrice,
      message: dto.message,
      status: BookingStatus.PENDING,

      driverSnapshot: {
        firstName: ride.driver.firstName,
        lastName: ride.driver.lastName,
        profilePhoto: ride.driver.profilePhoto,
      },

      vehicleSnapshot: {
        brand: ride.vehicle.brand,
        model: ride.vehicle.model,
        year: ride.vehicle.year,
        color: ride.vehicle.color,
        registrationNumber: ride.vehicle.registrationNumber,
        vehiclePhoto: ride.vehicle.vehiclePhoto ?? '',
      },
      rideSnapshot: {
        origin: ride.origin,
        destination: ride.destination,
        stops: ride.stops,
        departureTime: ride.departureTime,
        pickupInstructions: ride.pickupInstructions,
      },
    };

    const reserved = await this.rideRepository.reserveSeats(
      ride.id,
      dto.seatsRequested,
    );

    if (!reserved) {
      throw new InsufficientSeatsError();
    }

    let booking: BookingEntity;
    try {
      booking = await this.bookingRepository.create(bookingData);
    } catch (error) {
      await this.rideRepository.releaseSeats(ride.id, dto.seatsRequested);
      throw error;
    }

    const [driverPhoto, vehiclePhoto] = await Promise.all([
      booking.driverSnapshot?.profilePhoto &&
      !booking.driverSnapshot.profilePhoto.startsWith('http')
        ? this.profilePhotoStorage.getUrl(booking.driverSnapshot.profilePhoto)
        : Promise.resolve(booking.driverSnapshot?.profilePhoto ?? ''),
      booking.vehicleSnapshot?.vehiclePhoto &&
      !booking.vehicleSnapshot.vehiclePhoto.startsWith('http')
        ? this.vehiclePhotoStorage.getUrl(booking.vehicleSnapshot.vehiclePhoto)
        : Promise.resolve(booking.vehicleSnapshot?.vehiclePhoto ?? ''),
    ]);

    return {
      ...booking,
      driverSnapshot: {
        ...booking.driverSnapshot,
        profilePhoto: driverPhoto,
      },
      vehicleSnapshot: {
        ...booking.vehicleSnapshot,
        vehiclePhoto,
      },
    };
  }
}
