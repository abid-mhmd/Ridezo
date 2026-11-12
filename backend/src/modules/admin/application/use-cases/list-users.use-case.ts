import { Inject, Injectable } from '@nestjs/common';
import { USER_REPOSITORY } from '../../../users/domain/repositories/user.repository';
import type { IUserRepository } from '../../../users/domain/repositories/user.repository';
import type { ListUsersQuery } from '../../../users/domain/repositories/user.repository';
import { PROFILE_PHOTO_STORAGE } from '../../../users/application/ports/profile-photo-storage';
import type { IProfilePhotoStorage } from '../../../users/application/ports/profile-photo-storage';
import type { AdminUserListResult } from '../dto/admin-user.list-responce.dto';
import { IListUsersUseCase } from '../interfaces/list-users.use-case.interface';

@Injectable()
export class ListUsersUseCase implements IListUsersUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(PROFILE_PHOTO_STORAGE)
    private readonly profilePhotoStorage: IProfilePhotoStorage,
  ) {}

  async execute(query: ListUsersQuery): Promise<AdminUserListResult> {
    const { users, total } = await this.userRepository.listUsers(query);

    await Promise.all(
      users.map(async (user) => {
        if (user.profilePhotoKey) {
          user.profilePhoto = await this.profilePhotoStorage.getUrl(
            user.profilePhotoKey,
          );
        }
      }),
    );

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
