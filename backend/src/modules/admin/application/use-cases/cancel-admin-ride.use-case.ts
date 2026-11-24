import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  RIDE_REPOSITORY,
  type IRideRepository,
} from '../../../rides/domain/repositories/ride.repository';
import { RideStatus } from '../../../rides/domain/enums/ride.enums';
import type {
  CancelAdminRideResult,
  ICancelAdminRideUseCase,
} from '../interfaces/cancel-admin-ride.use-case.interface';

@Injectable()
export class CancelAdminRideUseCase implements ICancelAdminRideUseCase {
  constructor(
    @Inject(RIDE_REPOSITORY)
    private readonly rideRepository: IRideRepository,
  ) {}

  async execute(rideId: string): Promise<CancelAdminRideResult> {
    const ride = await this.rideRepository.findById(rideId);

    if (!ride) {
      throw new NotFoundException('Ride not found.');
    }

    const cancelled = await this.rideRepository.cancelByAdmin(rideId);

    if (!cancelled) {
      throw new BadRequestException(
        'This ride cannot be cancelled because it is already completed or cancelled.',
      );
    }

    return {
      id: ride.id,
      status: RideStatus.CANCELLED,
    };
  }
}
