import { Inject, Injectable, NotFoundException, Logger } from '@nestjs/common';

import { VEHICLE_REPOSITORY } from '../../domain/repositories/vehicle.repository';
import type { IVehicleRepository } from '../../domain/repositories/vehicle.repository';

import type { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import type { VehicleEntity } from '../../domain/entities/vehicle.entity';

import { VEHICLE_MESSAGES } from '../../presentation/constants/vehicle-messages.constants';
import { VehicleRegistrationAlreadyExistsError } from './add-vehicle.use-case';

import { VEHICLE_PHOTO_STORAGE } from '../ports/vehicle-photo-storage';
import type { IVehiclePhotoStorage } from '../ports/vehicle-photo-storage';
import type { IUpdateVehicleUseCase } from '../interfaces/update-vehicle.use-case.interface';

@Injectable()
export class UpdateVehicleUseCase implements IUpdateVehicleUseCase {
  private readonly logger = new Logger(UpdateVehicleUseCase.name);

  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepository: IVehicleRepository,

    @Inject(VEHICLE_PHOTO_STORAGE)
    private readonly vehiclePhotoStorage: IVehiclePhotoStorage,
  ) {}

  async execute(
    vehicleId: string,
    ownerId: string,
    dto: UpdateVehicleDto,
  ): Promise<VehicleEntity> {
    const existingVehicle = await this.vehicleRepository.findByIdAndOwner(
      vehicleId,
      ownerId,
    );

    if (!existingVehicle) {
      throw new NotFoundException(VEHICLE_MESSAGES.NOT_FOUND);
    }

    const updateData: UpdateVehicleDto = { ...dto };

    // Do not overwrite the stored S3 key if the frontend sent back an existing presigned URL
    if (updateData.vehiclePhoto?.startsWith('http')) {
      delete updateData.vehiclePhoto;
    }

    if (updateData.registrationNumber !== undefined) {
      const registrationNumber = updateData.registrationNumber
        .replace(/[\s-]/g, '')
        .toUpperCase();

      const registrationExists =
        await this.vehicleRepository.existsByRegistrationNumber(
          registrationNumber,
          vehicleId,
        );

      if (registrationExists) {
        throw new VehicleRegistrationAlreadyExistsError();
      }

      updateData.registrationNumber = registrationNumber;
    }

    const vehicle = await this.vehicleRepository.update(
      vehicleId,
      ownerId,
      updateData,
    );

    if (!vehicle) {
      throw new NotFoundException(VEHICLE_MESSAGES.NOT_FOUND);
    }

    // Capture the raw S3 key BEFORE converting vehicle.vehiclePhoto to a signed URL
    const previousPhotoKey = existingVehicle.vehiclePhoto;
    const currentPhotoKey = vehicle.vehiclePhoto;

    // Delete the previous S3 object only when a different key was saved
    if (
      previousPhotoKey &&
      !previousPhotoKey.startsWith('http') &&
      previousPhotoKey !== currentPhotoKey
    ) {
      try {
        await this.vehiclePhotoStorage.delete(previousPhotoKey);
      } catch (error) {
        this.logger.error(
          `Failed to delete previous vehicle photo: ${previousPhotoKey}`,
          error instanceof Error ? error.stack : undefined,
        );
      }
    }

    // Generate a presigned URL for the response
    if (currentPhotoKey && !currentPhotoKey.startsWith('http')) {
      vehicle.vehiclePhoto =
        await this.vehiclePhotoStorage.getUrl(currentPhotoKey);
    }

    return vehicle;
  }
}
