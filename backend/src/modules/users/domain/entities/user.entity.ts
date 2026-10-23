import {
  AccountStatus,
  IdentityVerificationStatus,
  UserRole,
  SmokingPreference,
  SeatingComfortPreference,
  PetPreference,
  ClimateControlPreference,
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
