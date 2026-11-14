import { Inject, Injectable } from '@nestjs/common';
import { RIDE_REPOSITORY } from '../../domain/repositories/ride.repository';
import type { IRideRepository } from '../../domain/repositories/ride.repository';
import { RideStatus } from '../../domain/enums/ride.enums';
import type { ICancelRideUseCase } from '../interfaces/cancel-ride.use-case';

export class RideNotFoundOrNotOwnedError extends Error {
  constructor() {
    super('Ride not found or you do not have permission to cancel it.');
    this.name = 'RideNotFoundOrNotOwnedError';
  }
}

export class RideCannotBeCancelledError extends Error {
  constructor() {
    super('This ride cannot be cancelled.');
    this.name = 'RideCannotBeCancelledError';
  }
}

@Injectable()
export class CancelRideUseCase implements ICancelRideUseCase {
  constructor(
    @Inject(RIDE_REPOSITORY)
    private readonly rideRepository: IRideRepository,
  ) {}

  async execute(driverId: string, rideId: string): Promise<void> {
    // 1. Find the ride.
    const ride = await this.rideRepository.findById(rideId);

    if (!ride || ride.driverId !== driverId) {
      throw new RideNotFoundOrNotOwnedError();
    }

    // 2. Check whether cancellation is allowed.
    const cancellableStatuses = [RideStatus.SCHEDULED, RideStatus.FULL];

    if (!cancellableStatuses.includes(ride.status)) {
      throw new RideCannotBeCancelledError();
    }

    // 3. Cancel the ride.
    const cancelled = await this.rideRepository.cancel(rideId, driverId);

    // 4. Handle cases where the ride changed before cancellation.
    if (!cancelled) {
      throw new RideCannotBeCancelledError();
    }
  }
}
