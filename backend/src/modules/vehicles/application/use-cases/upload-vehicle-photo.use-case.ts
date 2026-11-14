import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';

import { VEHICLE_PHOTO_STORAGE } from '../ports/vehicle-photo-storage';
import type { IVehiclePhotoStorage } from '../ports/vehicle-photo-storage';
import type {
  IUploadVehiclePhotoUseCase,
  UploadVehiclePhotoInput,
} from '../interfaces/upload-vehicle-photo.use-case.interface';
import type { UploadVehiclePhotoResult } from '../interfaces/upload-vehicle-photo.use-case.interface';

@Injectable()
export class UploadVehiclePhotoUseCase implements IUploadVehiclePhotoUseCase {
  constructor(
    @Inject(VEHICLE_PHOTO_STORAGE)
    private readonly vehiclePhotoStorage: IVehiclePhotoStorage,
  ) {}

  async execute(
    file: UploadVehiclePhotoInput,
  ): Promise<UploadVehiclePhotoResult> {
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
      const result = await this.vehiclePhotoStorage.upload(
        file.buffer,
        file.mimetype,
      );

      const vehiclePhoto = await this.vehiclePhotoStorage.getUrl(
        result.objectKey,
      );

      return {
        vehiclePhoto,
        vehiclePhotoKey: result.objectKey,
      };
    } catch {
      throw new InternalServerErrorException(
        'Vehicle photo upload failed. Please try again.',
      );
    }
  }
}
