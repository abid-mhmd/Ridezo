export interface AdminUserListItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  profilePhoto?: string;
  role: string;
  accountStatus: 'active' | 'suspended' | 'deactivated';
  emailVerified: boolean;
  phoneVerified: boolean;
  createdAt: string;
}

export interface AdminUserListResponse {
  users: AdminUserListItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface AdminUserListParams {
  page: number;
  limit: number;
  search?: string;
}

export interface AdminUserLocation {
  city?: string;
  state?: string;
  country?: string;
}

export interface AdminUserDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  about?: string;
  profilePhoto?: string;
  role: string;
  accountStatus: 'active' | 'suspended' | 'deactivated';
  emailVerified: boolean;
  phoneVerified: boolean;
  idVerified: boolean;
  languages: string[];
  location?: AdminUserLocation | null;
  completedRideCount: number;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminUserDetailsResponse {
  user: AdminUserDetails;
}