import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { IUserRepository } from '../../domain/repositories/user.repository';

import { PROFILE_PHOTO_STORAGE } from '../ports/profile-photo-storage';
import type { IProfilePhotoStorage } from '../ports/profile-photo-storage';

import type { UserEntity } from '../../domain/entities/user.entity';
import { API_MESSAGES } from '../../../../common/constants/message.constants';
import type { IGetUserProfileUseCase } from '../interfaces/get-user-profile.use-case.interface';

@Injectable()
export class GetUserProfileUseCase implements IGetUserProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(PROFILE_PHOTO_STORAGE)
    private readonly profilePhotoStorage: IProfilePhotoStorage,
  ) {}

  async execute(userId: string): Promise<UserEntity> {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(API_MESSAGES.USERS.NOT_FOUND);
    }

    if (user.profilePhotoKey) {
      user.profilePhoto = await this.profilePhotoStorage.getUrl(
        user.profilePhotoKey,
      );
    }

    return user;
  }
}
