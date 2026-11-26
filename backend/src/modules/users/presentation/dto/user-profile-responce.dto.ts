import type {
  IdentityVerificationStatus,
  IdentityDocumentType,
} from '../../domain/enums/user.enums';
export interface UserProfileResponseDto {
  id: string;
  firstName: string;
  lastName?: string;
  about?: string;
  email: string;
  phone?: string;
  profilePhoto?: string;
  languages: string[];
  completedRideCount: number;
  rating: number;
  reviewCount: number;
  emailVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
  identityVerification: {
    status: IdentityVerificationStatus;
    documentType: IdentityDocumentType | null;
    maskedDocumentNumber: string | null;
    expiryDate: Date | null;
    rejectionReason: string | null;
    submittedAt: Date | null;
    verifiedAt: Date | null;
  };
  role: string;
  preferences?: {
    smoking?: string;
    pets?: string;
    seatingComfort?: string;
    climateControl?: string;
  };
  location?: {
    city?: string;
    state?: string;
    country?: string;
  };
  status: string;
}
