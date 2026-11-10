import type { UserEntity } from '../../../users/domain/entities/user.entity';

export interface AdminUserListResult {
  users: UserEntity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
