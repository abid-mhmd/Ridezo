import type { VehicleEntity } from '../../domain/entities/vehicle.entity';

export interface IGetVehicleByIdUseCase {
  execute(vehicleId: string, ownerId: string): Promise<VehicleEntity>;
}

export const GET_VEHICLE_BY_ID_USE_CASE = Symbol('GET_VEHICLE_BY_ID_USE_CASE');
