import type {
  DocumentVerificationStatus,
  VehicleDocumentType,
} from '../../domain/enums/vehicle-document.enums';

export const GET_VEHICLE_DOCUMENTS_USE_CASE = Symbol(
  'GET_VEHICLE_DOCUMENTS_USE_CASE',
);

export interface VehicleDocumentListResult {
  id: string;
  vehicleId: string;
  documentType: VehicleDocumentType;
  verificationStatus: DocumentVerificationStatus;
  documentUrl: string;
  expiryDate: Date | null;
  createdAt: Date;
}

export interface IGetVehicleDocumentsUseCase {
  execute(
    userId: string,
    vehicleId: string,
  ): Promise<VehicleDocumentListResult[]>;
}
