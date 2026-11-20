import { Inject, Injectable } from '@nestjs/common';
import { RIDE_REPOSITORY } from '../../domain/repositories/ride.repository';
import type { IRideRepository } from '../../domain/repositories/ride.repository';
import type { RideEntity } from '../../domain/entities/ride.entity';
import type { IGetRideDetailsUseCase } from '../interfaces/get-ride-details.use-case';
import { PROFILE_PHOTO_STORAGE } from '../../../users/application/ports/profile-photo-storage';
import type { IProfilePhotoStorage } from '../../../users/application/ports/profile-photo-storage';
import { VEHICLE_PHOTO_STORAGE } from '../../../vehicles/application/ports/vehicle-photo-storage';
import type { IVehiclePhotoStorage } from '../../../vehicles/application/ports/vehicle-photo-storage';

export class RideNotFoundError extends Error {
  constructor() {
    super('Ride not found.');
    this.name = 'RideNotFoundError';
  }
}

@Injectable()
export class GetRideDetailsUseCase implements IGetRideDetailsUseCase {
  constructor(
    @Inject(RIDE_REPOSITORY)
    private readonly rideRepository: IRideRepository,

    @Inject(PROFILE_PHOTO_STORAGE)
    private readonly profilePhotoStorage: IProfilePhotoStorage,

    @Inject(VEHICLE_PHOTO_STORAGE)
    private readonly vehiclePhotoStorage: IVehiclePhotoStorage,
  ) {}

  async execute(rideId: string): Promise<RideEntity> {
    const ride = await this.rideRepository.findById(rideId);

    if (!ride) {
      throw new RideNotFoundError();
    }

    if (ride.driver?.profilePhoto) {
      ride.driver.profilePhoto = await this.profilePhotoStorage.getUrl(
        ride.driver.profilePhoto,
      );
    }

    if (ride.vehicle?.vehiclePhoto) {
      ride.vehicle.vehiclePhoto = await this.vehiclePhotoStorage.getUrl(
        ride.vehicle.vehiclePhoto,
      );
    }

    return ride;
  }
}
