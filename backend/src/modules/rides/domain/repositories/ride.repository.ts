import type { RideEntity } from '../entities/ride.entity';
import type { RideStatus } from '../enums/ride.enums';

export const RIDE_REPOSITORY = Symbol('RIDE_REPOSITORY');

export type CreateRideData = Omit<RideEntity, 'id' | 'createdAt' | 'updatedAt'>;

export type UpdateRideData = Partial<
  Pick<
    RideEntity,
    | 'origin'
    | 'destination'
    | 'stops'
    | 'departureTime'
    | 'pricePerSeat'
    | 'preferences'
    | 'pickupInstructions'
  >
>;

export interface ListRidesQuery {
  page: number;
  limit: number;
}

export interface AdminListRidesQuery {
  page: number;
  limit: number;
  search?: string;
  status?: RideStatus;
}

export interface SearchRidesQuery {
  originLongitude: number;
  originLatitude: number;
  destinationLongitude: number;
  destinationLatitude: number;
  departureDate: Date;
  seats: number;
  minPrice?: number;
  maxPrice?: number;
  page: number;
  limit: number;
}
export interface SearchRidesQuery {
  originLongitude: number;
  originLatitude: number;
  destinationLongitude: number;
  destinationLatitude: number;
  departureDate: Date;
  seats: number;
  minPrice?: number;
  maxPrice?: number;
  departureWindows?: ('morning' | 'afternoon' | 'evening')[];
  sortBy?: 'departure' | 'price-low' | 'price-high';
  page: number;
  limit: number;
}

export interface IRideRepository {
  create(data: CreateRideData): Promise<RideEntity>;
  findById(rideId: string): Promise<RideEntity | null>;
  findByDriverId(
    driverId: string,
    query: ListRidesQuery,
  ): Promise<{
    rides: RideEntity[];
    total: number;
  }>;
  findAll(
    query: AdminListRidesQuery,
  ): Promise<{ rides: RideEntity[]; total: number }>;
  update(
    rideId: string,
    driverId: string,
    data: UpdateRideData,
  ): Promise<RideEntity | null>;
  cancel(rideId: string, driverId: string): Promise<boolean>;
  cancelByAdmin(rideId: string): Promise<boolean>;
  search(
    query: SearchRidesQuery,
    excludeDriverId?: string,
  ): Promise<{
    rides: RideEntity[];
    total: number;
  }>;
  reserveSeats(rideId: string, seats: number): Promise<boolean>;
  releaseSeats(rideId: string, seats: number): Promise<void>;
  findUpcomingByRecurringRideId(
    recurringRideId: string,
    limit?: number,
  ): Promise<RideEntity[]>;
  existsByRecurringRideAndDate(
    recurringRideId: string,
    occurrenceDate: string,
  ): Promise<boolean>;
  cancelFutureUnbookedByRecurringRideId(
    recurringRideId: string,
  ): Promise<number>;
}
