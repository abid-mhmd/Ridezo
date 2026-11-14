import type { CreateRideDto } from '../dto/create-ride.dto';
import type { RideEntity } from '../../domain/entities/ride.entity';

export const CREATE_RIDE_USE_CASE = Symbol('CREATE_RIDE_USE_CASE');

export interface ICreateRideUseCase {
  execute(driverId: string, dto: CreateRideDto): Promise<RideEntity>;
}
