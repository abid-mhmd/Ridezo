import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { VEHICLE_PHOTO_STORAGE } from '../ports/vehicle-photo-storage';
import type { IVehiclePhotoStorage } from '../ports/vehicle-photo-storage';

@Injectable()
export class UploadVehiclePhotoUseCase {
  constructor(
    @Inject(VEHICLE_PHOTO_STORAGE)
    private readonly vehiclePhotoStorage: IVehiclePhotoStorage,
  ) {}

  async execute(file: { buffer: Buffer; mimetype: string }) {
    if (!file) {
      throw new BadRequestException('Vehicle photo is required.');
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Only JPEG, PNG, and WEBP images are allowed.',
      );
    }

    try {
      const result = await this.vehiclePhotoStorage.upload(file.buffer);

      return {
        vehiclePhoto: result.secureUrl,
      };
    } catch {
      throw new InternalServerErrorException(
        'Vehicle photo upload failed. Please try again.',
      );
    }
  }
}
