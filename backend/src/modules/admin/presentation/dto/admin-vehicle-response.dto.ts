import type {
  FuelType,
  VehicleType,
  VehicleVerificationStatus,
} from '../../../vehicles/domain/enums/vehicle.enums';
import type {
  DocumentVerificationStatus,
  VehicleDocumentType,
} from '../../../vehicles/domain/enums/vehicle-document.enums';

export class AdminVehicleOwnerDto {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  profilePhoto: string;
  emailVerified: boolean;
  phoneVerified: boolean;
}

export class AdminVehicleDocumentSummaryDto {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
}

export class AdminVehicleListItemDto {
  id: string;
  owner: AdminVehicleOwnerDto | null;
  vehicleType: VehicleType;
  brand: string;
  model: string;
  year: number;
  color: string;
  registrationNumber: string;
  seatCapacity: number;
  fuelType: FuelType;
  vehiclePhoto: string;
  verificationStatus: VehicleVerificationStatus;
  isActive: boolean;
  documentsSummary: AdminVehicleDocumentSummaryDto;
  createdAt: Date;
}

export class AdminVehicleDocumentDto {
  id: string;
  documentType: VehicleDocumentType;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  documentUrl: string;
  verificationStatus: DocumentVerificationStatus;
  expiryDate: Date | null;
  rejectionReason: string | null;
  reviewedAt: Date | null;
  createdAt: Date;
}

export class AdminVehicleDetailsDto {
  id: string;
  owner: AdminVehicleOwnerDto | null;
  vehicleType: VehicleType;
  brand: string;
  model: string;
  year: number;
  color: string;
  registrationNumber: string;
  seatCapacity: number;
  fuelType: FuelType;
  vehiclePhoto: string;
  verificationStatus: VehicleVerificationStatus;
  isActive: boolean;
  documents: AdminVehicleDocumentDto[];
  createdAt: Date;
  updatedAt: Date;
}
