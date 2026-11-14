import { Inject, Injectable } from '@nestjs/common';
import { RIDE_REPOSITORY } from '../../domain/repositories/ride.repository';
import type {
  IRideRepository,
  ListRidesQuery,
} from '../../domain/repositories/ride.repository';
import type { RideEntity } from '../../domain/entities/ride.entity';
import type { IGetMyRidesUseCase } from '../interfaces/get-my-rides.use-case.interface';

@Injectable()
export class GetMyRidesUseCase implements IGetMyRidesUseCase {
  constructor(
    @Inject(RIDE_REPOSITORY)
    private readonly rideRepository: IRideRepository,
  ) {}

  async execute(
    driverId: string,
    query: ListRidesQuery,
  ): Promise<{
    rides: RideEntity[];
    total: number;
  }> {
    return this.rideRepository.findByDriverId(driverId, query);
  }
}
