export type IdentityVerificationStatus =
  | 'not_started'
  | 'pending'
  | 'verified'
  | 'rejected';

export type IdentityDocumentType =
  | 'driving_license'
  | 'aadhaar'
  | 'pan'
  | 'passport';

export interface IdentityVerificationInfo {
  status: IdentityVerificationStatus;
  documentType: IdentityDocumentType | null;
  maskedDocumentNumber: string | null;
  expiryDate: string | null;
  rejectionReason: string | null;
  submittedAt: string | null;
  verifiedAt: string | null;
  documentUrl?: string | null; 
}