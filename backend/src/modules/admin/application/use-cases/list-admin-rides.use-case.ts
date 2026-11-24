import { Inject, Injectable } from '@nestjs/common';
import {
  RIDE_REPOSITORY,
  type IRideRepository,
} from '../../../rides/domain/repositories/ride.repository';
import {
  PROFILE_PHOTO_STORAGE,
  type IProfilePhotoStorage,
} from '../../../users/application/ports/profile-photo-storage';
import {
  VEHICLE_PHOTO_STORAGE,
  type IVehiclePhotoStorage,
} from '../../../vehicles/application/ports/vehicle-photo-storage';
import type { AdminRideListQueryDto } from '../dto/admin-ride-query.dto';
import type {
  IListAdminRidesUseCase,
  ListAdminRidesResult,
} from '../interfaces/list-admin-rides.use-case.interface';

@Injectable()
export class ListAdminRidesUseCase implements IListAdminRidesUseCase {
  constructor(
    @Inject(RIDE_REPOSITORY)
    private readonly rideRepository: IRideRepository,

    @Inject(PROFILE_PHOTO_STORAGE)
    private readonly profilePhotoStorage: IProfilePhotoStorage,

    @Inject(VEHICLE_PHOTO_STORAGE)
    private readonly vehiclePhotoStorage: IVehiclePhotoStorage,
  ) {}

  async execute(query: AdminRideListQueryDto): Promise<ListAdminRidesResult> {
    const { rides, total } = await this.rideRepository.findAll({
      page: query.page,
      limit: query.limit,
      search: query.search,
      status: query.status,
    });

    const resolvedRides = await Promise.all(
      rides.map(async (ride) => {
        const [driverPhoto, vehiclePhoto] = await Promise.all([
          ride.driver?.profilePhoto &&
          !ride.driver.profilePhoto.startsWith('http')
            ? this.profilePhotoStorage.getUrl(ride.driver.profilePhoto)
            : Promise.resolve(ride.driver?.profilePhoto ?? ''),
          ride.vehicle?.vehiclePhoto &&
          !ride.vehicle.vehiclePhoto.startsWith('http')
            ? this.vehiclePhotoStorage.getUrl(ride.vehicle.vehiclePhoto)
            : Promise.resolve(ride.vehicle?.vehiclePhoto ?? ''),
        ]);

        return {
          ...ride,
          driver: ride.driver
            ? { ...ride.driver, profilePhoto: driverPhoto }
            : undefined,
          vehicle: ride.vehicle ? { ...ride.vehicle, vehiclePhoto } : undefined,
        };
      }),
    );

    return {
      rides: resolvedRides,
      pagination: {
        page: query.page,
        limit: query.limit,
        total,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }
}
