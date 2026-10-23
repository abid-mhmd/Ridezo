export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
}

export enum AccountStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  DEACTIVATED = 'deactivated',
}

export enum IdentityVerificationStatus {
  NOT_STARTED = 'not_started',
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
}

export enum SmokingPreference {
  NON_SMOKING = 'non-smoking',
  SMOKING_ALLOWED = 'smoking-allowed',
  NO_PREFERENCE = 'no-preference',
}

export enum PetPreference {
  ALLOWED = 'allowed',
  NOT_ALLOWED = 'not-allowed',
  NO_PREFERENCE = 'no-preference',
}

export enum SeatingComfortPreference {
  WINDOW = 'window',
  MIDDLE = 'middle',
  AISLE = 'aisle',
  NO_PREFERENCE = 'no-preference',
}

export enum ClimateControlPreference {
  AC_PREFERRED = 'ac-preferred',
  NON_AC_PREFERRED = 'non-ac-preferred',
  NO_PREFERENCE = 'no-preference',
}

