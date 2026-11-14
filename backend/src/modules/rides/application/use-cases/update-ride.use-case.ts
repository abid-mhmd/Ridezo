import { Inject, Injectable } from '@nestjs/common';
import { RIDE_REPOSITORY } from '../../domain/repositories/ride.repository';
import type {
  IRideRepository,
  UpdateRideData,
} from '../../domain/repositories/ride.repository';
import type { RideEntity } from '../../domain/entities/ride.entity';
import { RideStatus } from '../../domain/enums/ride.enums';
import type { UpdateRideDto } from '../dto/update-ride.dto';
import type { IUpdateRideUseCase } from '../interfaces/update-ride.use-case.interface';

export class RideNotFoundError extends Error {
  constructor() {
    super('Ride not found or you do not have permission to update it.');
    this.name = 'RideNotFoundError';
  }
}

export class RideCannotBeUpdatedError extends Error {
  constructor() {
    super('This ride cannot be updated.');
    this.name = 'RideCannotBeUpdatedError';
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
export class UpdateRideUseCase implements IUpdateRideUseCase {
  constructor(
    @Inject(RIDE_REPOSITORY)
    private readonly rideRepository: IRideRepository,
  ) {}

  async execute(
    driverId: string,
    rideId: string,
    dto: UpdateRideDto,
  ): Promise<RideEntity> {
    const existingRide = await this.rideRepository.findById(rideId);

    if (!existingRide || existingRide.driverId !== driverId) {
      throw new RideNotFoundError();
    }

    if (existingRide.status !== RideStatus.SCHEDULED) {
      throw new RideCannotBeUpdatedError();
    }

    if (
      dto.departureTime &&
      new Date(dto.departureTime).getTime() <= Date.now()
    ) {
      throw new InvalidDepartureTimeError();
    }

    const origin = dto.origin ?? existingRide.origin;
    const destination = dto.destination ?? existingRide.destination;

    if (origin.placeId === destination.placeId) {
      throw new InvalidRideLocationsError();
    }

    const updateData: UpdateRideData = {
      ...(dto.origin && { origin: dto.origin }),
      ...(dto.destination && { destination: dto.destination }),
      ...(dto.stops && { stops: dto.stops }),
      ...(dto.departureTime && {
        departureTime: new Date(dto.departureTime),
      }),
      ...(dto.pricePerSeat !== undefined && {
        pricePerSeat: dto.pricePerSeat,
      }),
      ...(dto.preferences && { preferences: dto.preferences }),
      ...(dto.pickupInstructions !== undefined && {
        pickupInstructions: dto.pickupInstructions,
      }),
    };

    const updatedRide = await this.rideRepository.update(
      rideId,
      driverId,
      updateData,
    );

    if (!updatedRide) {
      throw new RideNotFoundError();
    }

    return updatedRide;
  }
}
