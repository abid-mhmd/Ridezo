import type { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import type { VehicleEntity } from '../../domain/entities/vehicle.entity';

export interface IUpdateVehicleUseCase {
  execute(
    vehicleId: string,
    ownerId: string,
    dto: UpdateVehicleDto,
  ): Promise<VehicleEntity>;
}

export const UPDATE_VEHICLE_USE_CASE = Symbol('UPDATE_VEHICLE_USE_CASE');
