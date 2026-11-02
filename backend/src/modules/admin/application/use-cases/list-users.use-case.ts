import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository.js';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository.js';
import type { ListUsersQuery } from '../../../users/domain/repositories/user.repository.js';

import type { AdminUserListResult } from '../dto/admin-user.list-responce.dto.js';

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
  ) {}

  async execute(query: ListUsersQuery): Promise<AdminUserListResult> {
    const { users, total } = await this.userRepository.listUsers(query);

    return {
      users,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }
}
