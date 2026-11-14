import type { RideEntity } from '../../domain/entities/ride.entity';
import type { ListRidesQuery } from '../../domain/repositories/ride.repository';

export interface IGetMyRidesUseCase {
  execute(
    driverId: string,
    query: ListRidesQuery,
  ): Promise<{
    rides: RideEntity[];
    total: number;
  }>;
}
