import { Inject, Injectable, NotFoundException } from '@nestjs/common';

import { VEHICLE_REPOSITORY } from '../../domain/repositories/vehicle.repository';
import type { IVehicleRepository } from '../../domain/repositories/vehicle.repository';

import { VEHICLE_PHOTO_STORAGE } from '../ports/vehicle-photo-storage';
import type { IVehiclePhotoStorage } from '../ports/vehicle-photo-storage';

import type { VehicleEntity } from '../../domain/entities/vehicle.entity';
import type { IGetVehicleByIdUseCase } from '../interfaces/get-vehicle-by-id.use-case.interface';

@Injectable()
export class GetVehicleByIdUseCase implements IGetVehicleByIdUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepository: IVehicleRepository,

    @Inject(VEHICLE_PHOTO_STORAGE)
    private readonly vehiclePhotoStorage: IVehiclePhotoStorage,
  ) {}

  async execute(vehicleId: string, ownerId: string): Promise<VehicleEntity> {
    const vehicle = await this.vehicleRepository.findByIdAndOwner(
      vehicleId,
      ownerId,
    );

    if (!vehicle) {
      throw new NotFoundException('Vehicle not found.');
    }

    if (vehicle.vehiclePhotoKey) {
      vehicle.vehiclePhoto = await this.vehiclePhotoStorage.getUrl(
        vehicle.vehiclePhotoKey,
      );
    }

    return vehicle;
  }
}
