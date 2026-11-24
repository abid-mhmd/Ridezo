import type { VehicleVerificationStatus } from '../../../vehicles/domain/enums/vehicle.enums';

export const UPDATE_ADMIN_VEHICLE_STATUS_USE_CASE = Symbol(
  'UPDATE_ADMIN_VEHICLE_STATUS_USE_CASE',
);

export interface UpdateAdminVehicleStatusResult {
  id: string;
  verificationStatus: VehicleVerificationStatus;
}

export interface IUpdateAdminVehicleStatusUseCase {
  execute(
    vehicleId: string,
    status: VehicleVerificationStatus,
  ): Promise<UpdateAdminVehicleStatusResult>;
}
