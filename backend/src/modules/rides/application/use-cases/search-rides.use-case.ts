import { Inject, Injectable } from '@nestjs/common';
import { RIDE_REPOSITORY } from '../../domain/repositories/ride.repository';
import type {
  IRideRepository,
  SearchRidesQuery,
} from '../../domain/repositories/ride.repository';
import type { RideEntity } from '../../domain/entities/ride.entity';
import type { SearchRidesDto } from '../dto/search-rides.dto';
import type { ISearchRidesUseCase } from '../interfaces/search-rides.use-case.interface';

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

    const query: SearchRidesQuery = {
      originLongitude: dto.originLongitude,
      originLatitude: dto.originLatitude,
      destinationLongitude: dto.destinationLongitude,
      destinationLatitude: dto.destinationLatitude,
      departureDate,
      seats: dto.seats,
      minPrice: dto.minPrice,
      maxPrice: dto.maxPrice,
      page: dto.page,
      limit: dto.limit,
    };

    return this.rideRepository.search(query);
  }
}
