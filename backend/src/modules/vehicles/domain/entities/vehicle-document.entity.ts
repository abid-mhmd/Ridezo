import {
  VehicleDocumentType,
  DocumentVerificationStatus,
} from '../enums/vehicle-document.enums';

export interface VehicleDocumentEntity {
  id: string;
  vehicleId: string;
  documentType: VehicleDocumentType;
  documentKey: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  verificationStatus: DocumentVerificationStatus;
  expiryDate: Date | null;
  rejectionReason: string | null;
  reviewedAt: Date | null;
  reviewedBy: string | null;

  createdAt: Date;
  updatedAt: Date;
}
