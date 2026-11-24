import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  RIDE_REPOSITORY,
  type IRideRepository,
} from '../../../rides/domain/repositories/ride.repository';
import {
  USER_REPOSITORY,
  type IUserRepository,
} from '../../../users/domain/repositories/user.repository';
import {
  PROFILE_PHOTO_STORAGE,
  type IProfilePhotoStorage,
} from '../../../users/application/ports/profile-photo-storage';
import {
  VEHICLE_PHOTO_STORAGE,
  type IVehiclePhotoStorage,
} from '../../../vehicles/application/ports/vehicle-photo-storage';
import type {
  AdminRideDetailsResult,
  IGetAdminRideDetailsUseCase,
} from '../interfaces/get-admin-ride-details.use-case.interface';

@Injectable()
export class GetAdminRideDetailsUseCase implements IGetAdminRideDetailsUseCase {
  constructor(
    @Inject(RIDE_REPOSITORY)
    private readonly rideRepository: IRideRepository,

    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,

    @Inject(PROFILE_PHOTO_STORAGE)
    private readonly profilePhotoStorage: IProfilePhotoStorage,

    @Inject(VEHICLE_PHOTO_STORAGE)
    private readonly vehiclePhotoStorage: IVehiclePhotoStorage,
  ) {}

  async execute(rideId: string): Promise<AdminRideDetailsResult> {
    const ride = await this.rideRepository.findById(rideId);

    if (!ride) {
      throw new NotFoundException('Ride not found.');
    }

    const [driverUser, driverPhoto, vehiclePhoto] = await Promise.all([
      this.userRepository.findById(ride.driverId),
      ride.driver?.profilePhoto && !ride.driver.profilePhoto.startsWith('http')
        ? this.profilePhotoStorage.getUrl(ride.driver.profilePhoto)
        : Promise.resolve(ride.driver?.profilePhoto ?? ''),
      ride.vehicle?.vehiclePhoto &&
      !ride.vehicle.vehiclePhoto.startsWith('http')
        ? this.vehiclePhotoStorage.getUrl(ride.vehicle.vehiclePhoto)
        : Promise.resolve(ride.vehicle?.vehiclePhoto ?? ''),
    ]);

    return {
      ride: {
        ...ride,
        driver: ride.driver
          ? { ...ride.driver, profilePhoto: driverPhoto }
          : undefined,
        vehicle: ride.vehicle ? { ...ride.vehicle, vehiclePhoto } : undefined,
      },
      driverContact: driverUser
        ? {
            email: driverUser.email,
            phone: driverUser.phone,
          }
        : null,
    };
  }
}
