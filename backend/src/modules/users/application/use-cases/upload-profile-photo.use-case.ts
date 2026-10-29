import {
  Inject,
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { configureCloudinary } from '../../../../infrastructure/config/Cloudinary.config.js';
import { USER_REPOSITORY } from '../../domain/repositories/user.repository.js';
import type { UserRepository } from '../../domain/repositories/user.repository.js';
import { API_MESSAGES } from '../../../../common/contstants/message.constants.js';

@Injectable()
export class UploadProfilePhotoUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
    private readonly configService: ConfigService,
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
      throw new BadRequestException(
       API_MESSAGES.USERS.INVALID_PHOTO_TYPE
      );
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException(API_MESSAGES.USERS.NOT_FOUND);
    }

    configureCloudinary(this.configService);

    let result: {
      secure_url: string;
      public_id: string;
    };

    try {
      result = await new Promise((resolve, reject) => {
        const upload = cloudinary.uploader.upload_stream(
          {
            folder: 'ridezo/profile-photos',
            resource_type: 'image',
          },
          (error, uploaded) => {
            if (error || !uploaded) {
              reject(error ?? new Error('Image upload failed.'));
              return;
            }

            resolve({
              secure_url: uploaded.secure_url,
              public_id: uploaded.public_id,
            });
          },
        );

        upload.end(file.buffer);
      });
    } catch {
      throw new InternalServerErrorException(
        'Profile photo upload failed. Please try again.',
      );
    }

    const updatedUser = await this.userRepository.updateProfile(userId, {
      profilePhoto: result.secure_url,
    });

    if (!updatedUser) {
      await cloudinary.uploader.destroy(result.public_id);
      throw new NotFoundException(API_MESSAGES.USERS.NOT_FOUND);
    }

    return {
      message: API_MESSAGES.USERS.PROFILE_UPDATED,
      profilePhoto: result.secure_url,
    };
  }
}
