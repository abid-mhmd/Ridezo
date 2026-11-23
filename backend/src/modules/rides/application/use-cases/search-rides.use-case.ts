import { Inject, Injectable } from '@nestjs/common';
import { RIDE_REPOSITORY } from '../../domain/repositories/ride.repository';
import type {
  IRideRepository,
  SearchRidesQuery,
} from '../../domain/repositories/ride.repository';
import type { RideEntity } from '../../domain/entities/ride.entity';
import type { SearchRidesDto } from '../dto/search-rides.dto';
import type { ISearchRidesUseCase } from '../interfaces/search-rides.use-case.interface';
import { PROFILE_PHOTO_STORAGE } from '../../../users/application/ports/profile-photo-storage';
import type { IProfilePhotoStorage } from '../../../users/application/ports/profile-photo-storage';
import { VEHICLE_PHOTO_STORAGE } from '../../../vehicles/application/ports/vehicle-photo-storage';
import type { IVehiclePhotoStorage } from '../../../vehicles/application/ports/vehicle-photo-storage';

export class InvalidRideSearchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidRideSearchError';
  }
}

@Injectable()
export class SearchRidesUseCase implements ISearchRidesUseCase {
  constructor(
    @Inject(RIDE_REPOSITORY)
    private readonly rideRepository: IRideRepository,
    @Inject(PROFILE_PHOTO_STORAGE)
    private readonly profilePhotoStorage: IProfilePhotoStorage,

    @Inject(VEHICLE_PHOTO_STORAGE)
    private readonly vehiclePhotoStorage: IVehiclePhotoStorage,
  ) {}

  async execute(
    driverId: string,
    dto: SearchRidesDto,
  ): Promise<{
    rides: RideEntity[];
    total: number;
  }> {
    const isSameLocation =
      dto.originLongitude === dto.destinationLongitude &&
      dto.originLatitude === dto.destinationLatitude;

    if (isSameLocation) {
      throw new InvalidRideSearchError(
        'Origin and destination must be different.',
      );
    }

    const datePattern = /^\d{4}-\d{2}-\d{2}$/;

    if (!datePattern.test(dto.departureDate)) {
      throw new InvalidRideSearchError('Invalid departure date.');
    }

    const departureDate = new Date(`${dto.departureDate}T00:00:00.000Z`);

    if (
      Number.isNaN(departureDate.getTime()) ||
      departureDate.toISOString().slice(0, 10) !== dto.departureDate
    ) {
      throw new InvalidRideSearchError('Invalid departure date.');
    }

    if (
      dto.minPrice !== undefined &&
      dto.maxPrice !== undefined &&
      dto.minPrice > dto.maxPrice
    ) {
      throw new InvalidRideSearchError(
        'Minimum price cannot exceed maximum price.',
      );
    }
    const validWindows = ['morning', 'afternoon', 'evening'] as const;
    const departureWindows = dto.departureWindows
      ?.split(',')
      .map((w) => w.trim().toLowerCase())
      .filter((w): w is 'morning' | 'afternoon' | 'evening' =>
        (validWindows as readonly string[]).includes(w),
      );

    const query: SearchRidesQuery = {
      originLongitude: dto.originLongitude,
      originLatitude: dto.originLatitude,
      destinationLongitude: dto.destinationLongitude,
      destinationLatitude: dto.destinationLatitude,
      departureDate,
      seats: dto.seats,
      minPrice: dto.minPrice,
      maxPrice: dto.maxPrice,
     departureWindows: departureWindows?.length ? departureWindows : undefined,
      sortBy: dto.sortBy,
      page: dto.page,
      limit: dto.limit,
    };

    const result = await this.rideRepository.search(query, driverId);

    const rides = await Promise.all(
      result.rides.map(async (ride) => {
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
      }),
    );

    return {
      rides,
      total: result.total,
    };
  }
}
