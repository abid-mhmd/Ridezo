import type { CreateRideDto } from '../dto/create-ride.dto';
import type { RideEntity } from '../../domain/entities/ride.entity';

export interface ICreateRideUseCase {
  execute(driverId: string, dto: CreateRideDto): Promise<RideEntity>;
}
