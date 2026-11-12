export interface IDeactivateVehicleUseCase {
  execute(vehicleId: string, ownerId: string): Promise<void>;
}

export const DEACTIVATE_VEHICLE_USE_CASE = Symbol(
  'DEACTIVATE_VEHICLE_USE_CASE',
);
