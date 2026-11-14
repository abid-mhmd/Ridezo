export type VehicleDocumentType =
  'registration_certificate' | 'insurance' | 'pollution_certificate';

export type DocumentVerificationStatus =
  'pending' | 'approved' | 'rejected' | 'requires_review';

export interface VehicleDocument {
  id: string;
  vehicleId: string;
  documentType: VehicleDocumentType;
  verificationStatus: DocumentVerificationStatus;
  expiryDate: string | null;
  documentUrl: string;
  createdAt: string;
}

export interface UploadVehicleDocumentPayload {
  documentType: VehicleDocumentType;
}

export interface VerifyVehicleDocumentResponse {
  documentId: string;
  verificationStatus: DocumentVerificationStatus;
  rejectionReason: string | null;
  expiryDate: string | null;
  vehicleVerificationStatus: 'pending' | 'approved' | 'rejected';
}

export interface UploadedVehicleDocument {
  id: string;
  vehicleId: string;
  documentType: VehicleDocumentType;
  verificationStatus: DocumentVerificationStatus;
  expiryDate: string | null;
  createdAt: string;
}
