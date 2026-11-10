import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository';
import type { IUserRepository } from '../../domain/repositories/user.repository';
import { API_MESSAGES } from '../../../../common/constants/message.constants';
import { PROFILE_PHOTO_STORAGE } from '../ports/profile-photo-storage';
import type { IProfilePhotoStorage } from '../ports/profile-photo-storage';

@Injectable()
export class UploadProfilePhotoUseCase {
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

    let result: {
      secureUrl: string;
      publicId: string;
    };

    try {
      result = await this.profilePhotoStorage.upload(file.buffer);
    } catch {
      throw new InternalServerErrorException(
        'Profile photo upload failed. Please try again.',
      );
    }

    const updatedUser = await this.userRepository.updateProfile(userId, {
      profilePhoto: result.secureUrl,
    });

    if (!updatedUser) {
      await this.profilePhotoStorage.delete(result.publicId);
      throw new NotFoundException(API_MESSAGES.USERS.NOT_FOUND);
    }

    return {
      message: API_MESSAGES.USERS.PROFILE_UPDATED,
      profilePhoto: result.secureUrl,
    };
  }
}
