import { Inject, Injectable, NotFoundException, Logger } from '@nestjs/common';

import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { IUserRepository } from '../../domain/repositories/user.repository';

import { PROFILE_PHOTO_STORAGE } from '../ports/profile-photo-storage';
import type { IProfilePhotoStorage } from '../ports/profile-photo-storage';

import { API_MESSAGES } from '../../../../common/constants/message.constants';

@Injectable()
export class RemoveProfilePhotoUseCase {
  private readonly logger = new Logger(RemoveProfilePhotoUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(PROFILE_PHOTO_STORAGE)
    private readonly profilePhotoStorage: IProfilePhotoStorage,
  ) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(API_MESSAGES.USERS.NOT_FOUND);
    }

    if (!user.profilePhoto && !user.profilePhotoKey) {
      return {
        message: 'No profile photo to remove.',
      };
    }

    const updatedUser = await this.userRepository.updateProfile(userId, {
      profilePhoto: '',
      profilePhotoKey: '',
    });

    if (!updatedUser) {
      throw new NotFoundException(API_MESSAGES.USERS.NOT_FOUND);
    }

    if (user.profilePhotoKey) {
      try {
        await this.profilePhotoStorage.delete(user.profilePhotoKey);
      } catch (error) {
        this.logger.error(
          `Failed to delete profile photo: ${user.profilePhotoKey}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

    return {
      message: API_MESSAGES.USERS.PHOTO_REMOVED,
    };
  }
}
