import type { VehicleEntity } from '../../../vehicles/domain/entities/vehicle.entity';
import type { VehicleDocumentEntity } from '../../../vehicles/domain/entities/vehicle-document.entity';
import type { AdminVehicleOwnerSummary } from './list-admin-vehicles.use-case.interface';

export const GET_ADMIN_VEHICLE_DETAILS_USE_CASE = Symbol(
  'GET_ADMIN_VEHICLE_DETAILS_USE_CASE',
);

export interface AdminVehicleDocumentWithUrl {
  document: VehicleDocumentEntity;
  documentUrl: string;
}

export interface AdminVehicleDetailsResult {
  vehicle: VehicleEntity;
  owner: AdminVehicleOwnerSummary | null;
  documents: AdminVehicleDocumentWithUrl[];
}

export interface IGetAdminVehicleDetailsUseCase {
  execute(vehicleId: string): Promise<AdminVehicleDetailsResult>;
}
