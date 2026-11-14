import type { RideEntity } from '../../domain/entities/ride.entity';
import type { UpdateRideDto } from '../dto/update-ride.dto';

export const UPDATE_RIDE_USE_CASE = Symbol('UPDATE_RIDE_USE_CASE');

export interface IUpdateRideUseCase {
  execute(
    driverId: string,
    rideId: string,
    dto: UpdateRideDto,
  ): Promise<RideEntity>;
}
