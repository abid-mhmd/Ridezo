export interface UserPreferences {
  smoking?: 'non-smoking' | 'smoking-allowed' | 'no-preference';
  pets?: 'allowed' | 'not-allowed' | 'no-preference';
  seatingComfort?: 'window' | 'middle' | 'aisle' | 'no-preference';
  climateControl?: 'ac-preferred' | 'non-ac-preferred' | 'no-preference';
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  about?: string;
  email: string;
  phone?: string;
  profilePhoto?: string;
  languages: string[];
  preferences?: UserPreferences;
  completedRideCount: number;
  rating: number;
  reviewCount: number;
  emailVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
  role: string;
  status: string;
  location?: {
    city?: string;
    state?: string;
  };
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  about?: string;
  phone?: string;
  languages?: string[];
  location?: { city?: string; state?: string };
  preferences?: UserProfile['preferences'];
}
