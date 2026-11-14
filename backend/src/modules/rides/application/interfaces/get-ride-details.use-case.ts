import type { RideEntity } from '../../domain/entities/ride.entity';

export const GET_RIDE_DETAILS_USE_CASE = Symbol('GET_RIDE_DETAILS_USE_CASE');

export interface IGetRideDetailsUseCase {
  execute(rideId: string): Promise<RideEntity>;
}
