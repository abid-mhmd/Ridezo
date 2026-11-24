import type { VehicleEntity } from '../../../vehicles/domain/entities/vehicle.entity';
import type { AdminVehicleListQueryDto } from '../dto/admin-vehicle-query.dto';

export const LIST_ADMIN_VEHICLES_USE_CASE = Symbol(
  'LIST_ADMIN_VEHICLES_USE_CASE',
);

export interface AdminVehicleOwnerSummary {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  profilePhoto: string;
  emailVerified: boolean;
  phoneVerified: boolean;
}

export interface AdminVehicleDocumentSummary {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export interface AdminVehicleListItem {
  vehicle: VehicleEntity;
  owner: AdminVehicleOwnerSummary | null;
  documentsSummary: AdminVehicleDocumentSummary;
}

export interface ListAdminVehiclesResult {
  vehicles: AdminVehicleListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IListAdminVehiclesUseCase {
  execute(query: AdminVehicleListQueryDto): Promise<ListAdminVehiclesResult>;
}
