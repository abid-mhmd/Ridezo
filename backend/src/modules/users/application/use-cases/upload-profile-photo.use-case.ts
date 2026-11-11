import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';

import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { IUserRepository } from '../../domain/repositories/user.repository';

import { API_MESSAGES } from '../../../../common/constants/message.constants';
import { PROFILE_PHOTO_STORAGE } from '../ports/profile-photo-storage';
import type { IProfilePhotoStorage } from '../ports/profile-photo-storage';

@Injectable()
export class UploadProfilePhotoUseCase {
  private readonly logger = new Logger(UploadProfilePhotoUseCase.name);

  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(PROFILE_PHOTO_STORAGE)
    private readonly profilePhotoStorage: IProfilePhotoStorage,
  ) {}

  async execute(
    userId: string,
    file: {
      buffer: Buffer;
      mimetype: string;
    },
  ) {
    if (!file) {
      throw new BadRequestException(API_MESSAGES.USERS.PROFILE_PHOTO_REQUIRED);
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(API_MESSAGES.USERS.INVALID_PHOTO_TYPE);
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(API_MESSAGES.USERS.NOT_FOUND);
    }

    let objectKey: string;

    try {
      const uploaded = await this.profilePhotoStorage.upload(
        file.buffer,
        file.mimetype,
      );

      objectKey = uploaded.objectKey;

      const profilePhotoUrl = await this.profilePhotoStorage.getUrl(objectKey);

      const updatedUser = await this.userRepository.updateProfile(userId, {
        profilePhoto: '',
        profilePhotoKey: objectKey,
      });

      if (!updatedUser) {
        await this.profilePhotoStorage.delete(objectKey);

        throw new NotFoundException(API_MESSAGES.USERS.NOT_FOUND);
      }

      if (user.profilePhotoKey) {
        try {
          await this.profilePhotoStorage.delete(user.profilePhotoKey);
        } catch (error) {
          this.logger.error(
            `Failed to delete previous profile photo: ${user.profilePhotoKey}`,
            error instanceof Error ? error.stack : undefined,
          );
        }
      }

      return {
        message: API_MESSAGES.USERS.PROFILE_UPDATED,
        profilePhoto: profilePhotoUrl,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Profile photo upload failed. Please try again.',
      );
    }
  }
}
