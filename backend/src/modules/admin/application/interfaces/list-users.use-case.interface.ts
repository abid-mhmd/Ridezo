import type { ListUsersQuery } from '../../../users/domain/repositories/user.repository';
import type { AdminUserListResult } from '../dto/admin-user.list-responce.dto';

export interface IListUsersUseCase {
  execute(query: ListUsersQuery): Promise<AdminUserListResult>;
}

export const LIST_USERS_USE_CASE = Symbol('LIST_USERS_USE_CASE');
