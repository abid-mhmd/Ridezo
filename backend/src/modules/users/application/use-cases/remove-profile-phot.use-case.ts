import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.js';
import type { UserRepository } from '../../domain/repositories/user.repository.js';
import { API_MESSAGES } from '../../../../common/constants/message.constants.js';

@Injectable()
export class RemoveProfilePhotoUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(userId: string) {
    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(API_MESSAGES.USERS.NOT_FOUND);
    }

    if (!user.profilePhoto) {
      return {
        message: 'No profile photo to remove.',
      };
    }
    const updatedUser = await this.userRepository.updateProfile(userId, {
      profilePhoto: '',
    });

    if (!updatedUser) {
      throw new NotFoundException(API_MESSAGES.USERS.NOT_FOUND);
    }
    return {
      message: API_MESSAGES.USERS.PHOTO_REMOVED,
    };
  }
}
