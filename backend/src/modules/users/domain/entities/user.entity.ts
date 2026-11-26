import {
  AccountStatus,
  IdentityVerificationStatus,
  UserRole,
  SmokingPreference,
  SeatingComfortPreference,
  PetPreference,
  ClimateControlPreference,
  IdentityDocumentType,
} from '../enums/user.enums';

export interface UserLocation {
  city?: string;
  state?: string;
  country?: string;
}

export interface IdentityVerification {
  status: IdentityVerificationStatus;
  documentType?: IdentityDocumentType | null;
  maskedDocumentNumber?: string | null;
  documentHash?: string | null;
  documentKey?: string | null;
  expiryDate?: Date | null;
  rejectionReason?: string | null;
  consentGivenAt?: Date | null;
  submittedAt?: Date | null;
  verifiedAt?: Date | null;
  reviewedAt?: Date | null;
}

export interface UserPreferences {
  smoking?: SmokingPreference;
  pets?: PetPreference;
  seatingComfort?: SeatingComfortPreference;
  climateControl?: ClimateControlPreference;
}

export interface UserEntity {
  id: string;

  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  passwordHash?: string;
  about: string;
  profilePhoto: string;
  role: UserRole;
  accountStatus: AccountStatus;
  emailVerified: boolean;
  phoneVerified: boolean;
  identityVerification: IdentityVerification;
  location?: UserLocation;
  languages: string[];
  preferences?: UserPreferences;
  completedRideCount: number;
  rating: number;
  reviewCount: number;
  googleId?: string;

  createdAt: Date;
  updatedAt: Date;
}
