import type { RideEntity } from '../../domain/entities/ride.entity';
import type { ListRidesQuery } from '../../domain/repositories/ride.repository';

export const GET_MY_RIDES_USE_CASE = Symbol('GET_MY_RIDES_USE_CASE');

export interface IGetMyRidesUseCase {
  execute(
    driverId: string,
    query: ListRidesQuery,
  ): Promise<{
    rides: RideEntity[];
    total: number;
  }>;
}
