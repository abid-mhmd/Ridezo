import type { RideEntity } from '../../../rides/domain/entities/ride.entity';
import type { AdminRideListQueryDto } from '../dto/admin-ride-query.dto';

export const LIST_ADMIN_RIDES_USE_CASE = Symbol('LIST_ADMIN_RIDES_USE_CASE');

export interface ListAdminRidesResult {
  rides: RideEntity[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface IListAdminRidesUseCase {
  execute(query: AdminRideListQueryDto): Promise<ListAdminRidesResult>;
}
