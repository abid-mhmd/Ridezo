import { Inject, Injectable } from '@nestjs/common';

import { VEHICLE_REPOSITORY } from '../../domain/repositories/vehicle.repository';
import type { IVehicleRepository } from '../../domain/repositories/vehicle.repository';

import { VEHICLE_PHOTO_STORAGE } from '../ports/vehicle-photo-storage';
import type { IVehiclePhotoStorage } from '../ports/vehicle-photo-storage';

@Injectable()
export class GetMyVehiclesUseCase {
  constructor(
    @Inject(VEHICLE_REPOSITORY)
    private readonly vehicleRepository: IVehicleRepository,

    @Inject(VEHICLE_PHOTO_STORAGE)
    private readonly vehiclePhotoStorage: IVehiclePhotoStorage,
  ) {}

  async execute(ownerId: string) {
    const vehicles = await this.vehicleRepository.findByOwnerId(ownerId);

    return Promise.all(
      vehicles.map(async (vehicle) => {
        if (vehicle.vehiclePhotoKey) {
          vehicle.vehiclePhoto = await this.vehiclePhotoStorage.getUrl(
            vehicle.vehiclePhotoKey,
          );
        }

        return vehicle;
      }),
    );
  }
}
