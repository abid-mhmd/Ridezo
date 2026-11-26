import type {
  IdentityDocumentType,
  IdentityVerificationStatus,
} from '../../../users/domain/enums/user.enums';

export interface AdminIdentityVerificationResponse {
  status: IdentityVerificationStatus;
  documentType: IdentityDocumentType | null;
  maskedDocumentNumber: string | null;
  expiryDate: Date | null;
  rejectionReason: string | null;
  submittedAt: Date | null;
  verifiedAt: Date | null;
  documentUrl?: string | null;
}

export interface AdminUserListItem {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  profilePhoto?: string;
  role: string;
  accountStatus: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
  identityVerification: AdminIdentityVerificationResponse;
  createdAt: Date;
}

export interface AdminUserDetailsResponse {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  about: string;
  profilePhoto: string;
  role: string;
  accountStatus: string;
  emailVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
  identityVerification: AdminIdentityVerificationResponse;
  languages: string[];
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  completedRideCount: number;
  rating: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;
}
