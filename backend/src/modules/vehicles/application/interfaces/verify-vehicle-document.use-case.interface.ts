import type { DocumentVerificationStatus } from '../../domain/enums/vehicle-document.enums';
import type { VehicleVerificationStatus } from '../../domain/enums/vehicle.enums';

export const VERIFY_VEHICLE_DOCUMENT_USE_CASE = Symbol(
  'VERIFY_VEHICLE_DOCUMENT_USE_CASE',
);

export interface VerifyVehicleDocumentResult {
  documentId: string;
  verificationStatus: DocumentVerificationStatus;
  rejectionReason: string | null;
  expiryDate: Date | null;
  vehicleVerificationStatus: VehicleVerificationStatus;
}

export interface IVerifyVehicleDocumentUseCase {
  execute(
    documentId: string,
    userId: string,
  ): Promise<VerifyVehicleDocumentResult>;
}
