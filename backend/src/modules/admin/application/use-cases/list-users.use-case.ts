import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository.js';
import type { UserRepository } from '../../../users/domain/repositories/user.repository.js';
import type { ListUsersQuery } from '../../../users/domain/repositories/user.repository.js';
import { UserEntity } from '../../../users/domain/entities/user.entity.js';
import type { AdminUserListResult } from '../dto/admin-user.list-responce.dto.js';

@Injectable()
export class ListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(query: ListUsersQuery): Promise<AdminUserListResult> {
    const { users, total } = await this.userRepository.listUsers(query);

    return {
      users: users.map((user: UserEntity) => ({
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName ?? '',
        email: user.email,
        phone: user.phone,
        profilePhoto: user.profilePhoto,
        role: user.role,
        accountStatus: user.accountStatus,
        emailVerified: user.emailVerified,
        phoneVerified: user.phoneVerified,
        createdAt: user.createdAt,
      })),
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }
}
