import type { RideEntity } from '../../domain/entities/ride.entity';
import type { SearchRidesDto } from '../dto/search-rides.dto';

export const SEARCH_RIDES_USE_CASE = Symbol('SEARCH_RIDES_USE_CASE');

export interface ISearchRidesUseCase {
  execute(
    driverId: string,
    dto: SearchRidesDto,
  ): Promise<{
    rides: RideEntity[];
    total: number;
  }>;
}
