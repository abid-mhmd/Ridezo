import { Inject, Injectable, NotFoundException, Logger } from '@nestjs/common';

import { VEHICLE_REPOSITORY } from '../../domain/repositories/vehicle.repository';
import type { IVehicleRepository } from '../../domain/repositories/vehicle.repository';

import type { UpdateVehicleDto } from '../dto/update-vehicle.dto';
import type { VehicleEntity } from '../../domain/entities/vehicle.entity';

import { VEHICLE_MESSAGES } from '../../presentation/constants/vehicle-messages.constants';
import { VehicleRegistrationAlreadyExistsError } from './add-vehicle.use-case';

import { VEHICLE_PHOTO_STORAGE } from '../ports/vehicle-photo-storage';
import type { IVehiclePhotoStorage } from '../ports/vehicle-photo-storage';

@Injectable()
export class UpdateVehicleUseCase {
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

    if (dto.registrationNumber !== undefined) {
      const registrationNumber = dto.registrationNumber
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

      dto = {
        ...dto,
        registrationNumber,
      };
    }

    const vehicle = await this.vehicleRepository.update(
      vehicleId,
      ownerId,
      dto,
    );

    if (!vehicle) {
      throw new NotFoundException(VEHICLE_MESSAGES.NOT_FOUND);
    }

    // Generate a presigned URL for the updated vehicle photo.
    if (vehicle.vehiclePhotoKey) {
      vehicle.vehiclePhoto = await this.vehiclePhotoStorage.getUrl(
        vehicle.vehiclePhotoKey,
      );
    }

    // Delete the previous photo only when a different key was saved.
    const previousPhotoKey = existingVehicle.vehiclePhotoKey;
    const currentPhotoKey = vehicle.vehiclePhotoKey;

    if (
      previousPhotoKey &&
      currentPhotoKey &&
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

    return vehicle;
  }
}
