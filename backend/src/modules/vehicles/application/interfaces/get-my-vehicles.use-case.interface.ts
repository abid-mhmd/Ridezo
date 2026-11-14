import type { VehicleEntity } from '../../domain/entities/vehicle.entity';

export interface IGetMyVehiclesUseCase {
  execute(ownerId: string): Promise<VehicleEntity[]>;
}

export const GET_MY_VEHICLES_USE_CASE = Symbol('GET_MY_VEHICLES_USE_CASE');
