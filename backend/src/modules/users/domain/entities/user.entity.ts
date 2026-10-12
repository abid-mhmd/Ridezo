import { AccountStatus , IdentityVerificationStatus , UserRole } from "../enums/user.enums.js";

export interface UserLocation {
    city?:string,
    state?:string,
    country?:string
}

export interface IdentityVerification {
    status: IdentityVerificationStatus,
    verifiedAt:Date | null;
}

export interface UserEntity {
  id: string;

  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  passwordHash: string;

  about: string;
  profilePhoto: string;

  role: UserRole;
  accountStatus: AccountStatus;

  emailVerified: boolean;
  phoneVerified: boolean;

  identityVerification: IdentityVerification;
  location?: UserLocation;

  languages: string[];

  completedRideCount: number;
  rating: number;
  reviewCount: number;

  createdAt: Date;
  updatedAt: Date;
}