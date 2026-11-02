import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { configureCloudinary } from '../../../../infrastructure/config/Cloudinary.config.js';
import type { IProfilePhotoStorage } from '../../application/ports/profile-photo-storage.js';

@Injectable()
export class CloudinaryProfilePhotoStorage implements IProfilePhotoStorage {
  constructor(private readonly configService: ConfigService) {}

  async upload(file: Buffer): Promise<{
    secureUrl: string;
    publicId: string;
  }> {
    const cloudinary = configureCloudinary(this.configService);

    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'ridezo/profile-photos',
        },
        (error, result) => {
          if (error || !result) {
            return reject(error ?? new Error('Profile photo upload failed'));
          }

          resolve({
            secureUrl: result.secure_url,
            publicId: result.public_id,
          });
        },
      );

      uploadStream.end(file);
    });
  }

  async delete(publicId: string): Promise<void> {
    const cloudinary = configureCloudinary(this.configService);

    await cloudinary.uploader.destroy(publicId);
  }
}
