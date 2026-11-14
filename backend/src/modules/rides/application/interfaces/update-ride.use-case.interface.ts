import type { RideEntity } from '../../domain/entities/ride.entity';
import type { UpdateRideDto } from '../dto/update-ride.dto';

export interface IUpdateRideUseCase {
  execute(
    driverId: string,
    rideId: string,
    dto: UpdateRideDto,
  ): Promise<RideEntity>;
}
