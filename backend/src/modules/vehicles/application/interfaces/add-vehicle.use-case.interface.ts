import type { AddVehicleDto } from '../dto/add-vehicle.dto';
import type { VehicleEntity } from '../../domain/entities/vehicle.entity';

export interface IAddVehicleUseCase {
  execute(ownerId: string, dto: AddVehicleDto): Promise<VehicleEntity>;
}

export const ADD_VEHICLE_USE_CASE = Symbol('ADD_VEHICLE_USE_CASE');
