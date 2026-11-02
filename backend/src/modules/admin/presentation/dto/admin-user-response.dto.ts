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
  idVerified: string;
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
