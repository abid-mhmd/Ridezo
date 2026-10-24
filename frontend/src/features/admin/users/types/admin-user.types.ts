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