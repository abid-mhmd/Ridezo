import { Inject, Injectable } from '@nestjs/common';
import { RIDE_REPOSITORY } from '../../domain/repositories/ride.repository';
import type { IRideRepository } from '../../domain/repositories/ride.repository';
import type { RideEntity } from '../../domain/entities/ride.entity';
import type { IGetRideDetailsUseCase } from '../interfaces/get-ride-details.use-case';

export class RideNotFoundError extends Error {
  constructor() {
    super('Ride not found.');
    this.name = 'RideNotFoundError';
  }
}

@Injectable()
export class GetRideDetailsUseCase implements IGetRideDetailsUseCase {
  constructor(
    @Inject(RIDE_REPOSITORY)
    private readonly rideRepository: IRideRepository,
  ) {}

  async execute(rideId: string): Promise<RideEntity> {
    const ride = await this.rideRepository.findById(rideId);

    if (!ride) {
      throw new RideNotFoundError();
    }

    return ride;
  }
}
