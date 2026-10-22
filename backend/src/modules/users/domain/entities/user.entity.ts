import {
  AccountStatus,
  IdentityVerificationStatus,
  UserRole,
} from '../enums/user.enums.js';

export interface UserLocation {
  city?: string;
  state?: string;
  country?: string;
}

export interface IdentityVerification {
  status: IdentityVerificationStatus;
  verifiedAt: Date | null;
}

export interface UserPreferences {
  smoking?: 'non-smoking' | 'smoking-allowed' | 'no-preference';
  pets?: 'allowed' | 'not-allowed' | 'no-preference';
  seatingComfort?: 'window' | 'middle' | 'aisle' | 'no-preference';
  climateControl?: 'ac-preferred' | 'non-ac-preferred' | 'no-preference';
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
