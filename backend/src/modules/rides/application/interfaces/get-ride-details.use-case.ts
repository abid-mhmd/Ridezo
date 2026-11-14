import type { RideEntity } from '../../domain/entities/ride.entity';

export interface IGetRideDetailsUseCase {
  execute(rideId: string): Promise<RideEntity>;
}
