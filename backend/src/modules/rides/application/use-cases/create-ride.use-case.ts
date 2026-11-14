import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository';
import { VEHICLE_REPOSITORY } from '../../../vehicles/domain/repositories/vehicle.repository';
import type { IVehicleRepository } from '../../../vehicles/domain/repositories/vehicle.repository';
import { RIDE_REPOSITORY } from '../../domain/repositories/ride.repository';
import type {
  IRideRepository,
  CreateRideData,
} from '../../domain/repositories/ride.repository';
import type { RideEntity } from '../../domain/entities/ride.entity';
import { RideStatus } from '../../domain/enums/ride.enums';
import type { CreateRideDto } from '../dto/create-ride.dto';
import type { ICreateRideUseCase } from '../interfaces/create-ride.use-case.interface';
import {
  AccountStatus,
  IdentityVerificationStatus,
} from '../../../users/domain/enums/user.enums';
import { VehicleVerificationStatus } from '../../../vehicles/domain/enums/vehicle.enums';

export class DriverNotFoundError extends Error {
  constructor() {
    super('Driver not found.');
    this.name = 'DriverNotFoundError';
  }
}

export class DriverAccountInactiveError extends Error {
  constructor() {
    super('Your account is not active.');
    this.name = 'DriverAccountInactiveError';
  }
}

export class DriverIdentityNotVerifiedError extends Error {
  constructor() {
    super('Identity verification is required to create a ride.');
    this.name = 'DriverIdentityNotVerifiedError';
  }
}

export class VehicleNotFoundError extends Error {
  constructor() {
    super('Vehicle not found or does not belong to you.');
    this.name = 'VehicleNotFoundError';
  }
}

export class VehicleInactiveError extends Error {
  constructor() {
    super('The selected vehicle is inactive.');
    this.name = 'VehicleInactiveError';
  }
}

export class VehicleNotApprovedError extends Error {
  constructor() {
    super('The selected vehicle has not been approved.');
    this.name = 'VehicleNotApprovedError';
  }
}

export class InvalidPassengerSeatCountError extends Error {
  constructor() {
    super('Invalid passenger seat count for the selected vehicle.');
    this.name = 'InvalidPassengerSeatCountError';
  }
}

export class InvalidDepartureTimeError extends Error {
  constructor() {
    super('Departure time must be in the future.');
    this.name = 'InvalidDepartureTimeError';
  }
}

export class InvalidRideLocationsError extends Error {
  constructor() {
    super('Origin and destination must be different.');
    this.name = 'InvalidRideLocationsError';
  }
}

@Injectable()
export class CreateRideUseCase implements ICreateRideUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepository: IVehicleRepository,

    @Inject(RIDE_REPOSITORY)
    private readonly rideRepository: IRideRepository,
  ) {}

  async execute(driverId: string, dto: CreateRideDto): Promise<RideEntity> {
    // 1. Verify driver
    const driver = await this.userRepository.findById(driverId);

    if (!driver) {
      throw new DriverNotFoundError();
    }

    if (driver.accountStatus !== AccountStatus.ACTIVE) {
      throw new DriverAccountInactiveError();
    }

    if (
      driver.identityVerification.status !== IdentityVerificationStatus.VERIFIED
    ) {
      throw new DriverIdentityNotVerifiedError();
    }

    // 2. Verify vehicle ownership
    const vehicle = await this.vehicleRepository.findByIdAndOwner(
      dto.vehicleId,
      driverId,
    );

    if (!vehicle) {
      throw new VehicleNotFoundError();
    }

    // 3. Verify vehicle status
    if (!vehicle.isActive) {
      throw new VehicleInactiveError();
    }

    if (vehicle.verificationStatus !== VehicleVerificationStatus.APPROVED) {
      throw new VehicleNotApprovedError();
    }

    // 4. Validate passenger seats
    const maximumPassengerSeats = vehicle.seatCapacity - 1;

    if (dto.totalSeats < 1 || dto.totalSeats > maximumPassengerSeats) {
      throw new InvalidPassengerSeatCountError();
    }

    // 5. Validate departure time
    const departureTime = new Date(dto.departureTime);

    if (departureTime.getTime() <= Date.now()) {
      throw new InvalidDepartureTimeError();
    }

    // 6. Validate locations
    if (dto.origin.placeId === dto.destination.placeId) {
      throw new InvalidRideLocationsError();
    }

    // 7. Prepare ride data
    const rideData: CreateRideData = {
      driverId,
      vehicleId: vehicle.id,
      origin: dto.origin,
      destination: dto.destination,
      stops: dto.stops ?? [],
      departureTime,
      totalSeats: dto.totalSeats,
      availableSeats: dto.totalSeats,
      pricePerSeat: dto.pricePerSeat,
      preferences: dto.preferences ?? {},
      pickupInstructions: dto.pickupInstructions,
      status: RideStatus.SCHEDULED,
    };

    // 8. Persist ride
    return this.rideRepository.create(rideData);
  }
}
