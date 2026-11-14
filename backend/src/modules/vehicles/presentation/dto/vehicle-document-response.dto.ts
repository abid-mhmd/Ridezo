import type {
  VehicleDocumentType,
  DocumentVerificationStatus,
} from '../../domain/enums/vehicle-document.enums';

export interface VehicleDocumentResponseDto {
  id: string;
  vehicleId: string;
  documentType: VehicleDocumentType;
  verificationStatus: DocumentVerificationStatus;
  expiryDate: Date | null;
  createdAt: Date;
}
