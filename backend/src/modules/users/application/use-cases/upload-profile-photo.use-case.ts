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
      throw new BadRequestException('Profile photo is required.');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only JPEG, PNG, and WebP images are allowed.',
      );
    }

    const user = await this.userRepository.findById(userId);

    if (!user) {
      throw new NotFoundException('User not found.');
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
      throw new NotFoundException('User not found.');
    }

    return {
      message: 'Profile photo updated successfully.',
      profilePhoto: result.secure_url,
    };
  }
}
